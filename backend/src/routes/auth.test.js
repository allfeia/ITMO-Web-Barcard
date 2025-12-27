import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

vi.mock("../models.js", () => {
  return {
    User: { findOne: vi.fn(), findByPk: vi.fn(), create: vi.fn() },
    Bar: { findByPk: vi.fn(), findOne: vi.fn() },
    UserFavourite: { findAll: vi.fn() },
    PasswordToken: { findOne: vi.fn(), create: vi.fn(), update: vi.fn() },
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(async (a, b) => a === b || b === `hash:${a}`),
    hash: vi.fn(async (s) => `hash:${s}`),
  },
}));

vi.mock("../../utils/mailer.js", () => ({
  sendMail: vi.fn(async () => true),
}));

vi.mock("../../utils/passwordTokens.js", () => ({
  createPasswordToken: vi.fn(async () => ({ raw: "raw_token_123" })),
  sha256: vi.fn((s) => `sha256:${s}`),
  generateOtp6: vi.fn(() => "123456"),
}));

vi.mock("../middleware/auth.js", () => {
  const authRequired = (req, res, next) => {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || "dev");
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };

  const requireRole =
    (...roles) =>
    (req, res, next) => {
      const userRoles = req.user?.roles || [];
      if (!roles.some((r) => userRoles.includes(r)))
        return res.status(403).json({ error: "Forbidden" });
      next();
    };

  const inviteSessionRequired = (req, res, next) => {
    const token = req.cookies?.invite_session;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.invite = jwt.verify(token, "invite_dev");
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };

  const signJwt = (user) =>
    jwt.sign(
      { id: user.id, roles: user.roles, bar_id: user.bar_id ?? null },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "15m" },
    );

  const signRefreshToken = (user) =>
    jwt.sign(
      { id: user.id, roles: user.roles, bar_id: user.bar_id ?? null },
      process.env.REFRESH_SECRET || "refresh_dev",
      { expiresIn: "1d" },
    );

  const signInviteSession = (payload) =>
    jwt.sign(payload, "invite_dev", { expiresIn: "10m" });

  return {
    authRequired,
    requireRole,
    signJwt,
    signRefreshToken,
    inviteSessionRequired,
    signInviteSession,
  };
});

import router from "./auth.js";
import { User, Bar, UserFavourite, PasswordToken } from "../models.js";
import { sendMail } from "../../utils/mailer.js";
import { createPasswordToken, sha256, generateOtp6 } from "../../utils/passwordTokens.js";

function appWithRouter() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/auth", router);
  return app;
}

function authCookie(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET || "dev", {
    expiresIn: "1h",
  });
  return `access_token=${token}`;
}

function inviteCookie(invitePayload) {
  const token = jwt.sign(invitePayload, "invite_dev", { expiresIn: "10m" });
  return `invite_session=${token}`;
}

describe("auth endpoints", () => {
  beforeEach(() => vi.restoreAllMocks());

  describe("POST /super/login", () => {
    it("400 on invalid payload", async () => {
      const app = appWithRouter();
      const res = await request(app).post("/auth/super/login").send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("404 when user not found", async () => {
      User.findOne.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/login")
        .send({ username: "root", password: "x" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("404 when not super_admin", async () => {
      User.findOne.mockResolvedValue({ roles: ["user"] });
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/login")
        .send({ username: "u", password: "x" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("404 when no password set", async () => {
      User.findOne.mockResolvedValue({
        roles: ["super_admin"],
        password: null,
      });
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/login")
        .send({ username: "u", password: "x" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("404 when invalid password", async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        login: "l",
        email: "e",
        name: "n",
        roles: ["super_admin"],
        password: "other",
      });
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/login")
        .send({ username: "u", password: "x" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("200 returns token & user", async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        login: "root",
        email: "root@example.com",
        name: "Root",
        roles: ["super_admin"],
        password: "pass",
      });
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/login")
        .send({ username: "root", password: "pass" });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ id: 1, roles: ["super_admin"] });
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"].some((c) => c.startsWith("access_token="))).toBe(true);
      expect(res.headers["set-cookie"].some((c) => c.startsWith("refresh_token="))).toBe(true);
    });
  });

  describe("POST /barman/auth", () => {
    it("400 invalid payload", async () => {
      const app = appWithRouter();
      const res = await request(app).post("/auth/barman/auth").send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("404 bar not found", async () => {
      Bar.findByPk.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 1, username: "u", password: "p", barKey: "k" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Бар не найден" });
    });

    it("403 wrong bar key", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "different" });
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "bad" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("403 user not found", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true); // ключ бара
      User.findOne.mockResolvedValue(null);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("403 not staff/bar_admin", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true); // ключ бара ok
      User.findOne.mockResolvedValue({
        roles: ["user"],
        bar_id: 2,
        password: "p",
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("403 no password set", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true); // ключ бара ok
      User.findOne.mockResolvedValue({
        roles: ["staff"],
        bar_id: 2,
        password: null,
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("403 wrong password", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false); // ключ ok, пароль нет
      User.findOne.mockResolvedValue({
        roles: ["staff"],
        bar_id: 2,
        password: "other",
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Неверные учетные данные" });
    });

    it("200 login ok", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k", name: "Bar2" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

      User.findOne.mockResolvedValue({
        id: 10,
        login: "l",
        email: "e",
        name: "n",
        roles: ["staff"],
        bar_id: 2,
        password: "p",
      });
      UserFavourite.findAll.mockResolvedValue([{ cocktail_id: 1 }, { cocktail_id: 3 }]);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.mode).toBe("login");
      expect(res.body.user).toMatchObject({ id: 10, bar_id: 2 });
      expect(res.body.saved_cocktails_id).toEqual([1, 3]);
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"].some((c) => c.startsWith("access_token="))).toBe(true);
      expect(res.headers["set-cookie"].some((c) => c.startsWith("refresh_token="))).toBe(true);
    });
  });

  describe("POST /super/grant-bar-admin", () => {
    it("requires super_admin role", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Cookie", authCookie({ id: 1, roles: ["user"] }))
        .send({ userId: 1, makeBarAdmin: true });
      expect(res.status).toBe(403);
    });

    it("400 invalid payload", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("404 user not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({ userId: 99, makeBarAdmin: true });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Сотрудник не найден" });
    });

    it("makes bar_admin and staff when makeBarAdmin=true", async () => {
      const save = vi.fn(async () => true);
      const user = { id: 2, roles: ["staff"], bar_id: 5, save };
      User.findByPk.mockResolvedValue(user);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({ userId: 2, makeBarAdmin: true });
      expect(res.status).toBe(200);
      expect(save).toHaveBeenCalled();
      expect(res.body.user).toMatchObject({ id: 2 });
      expect(res.body.ok).toBe(true);
    });

    it("400 if makeBarAdmin=true but user has no bar_id", async () => {
      const save = vi.fn(async () => true);
      const user = { id: 2, roles: ["user"], bar_id: null, save };
      User.findByPk.mockResolvedValue(user);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({ userId: 2, makeBarAdmin: true });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Сотрудник должен работать в баре" });
    });

    it("removes bar_admin when makeBarAdmin=false and keeps at least user", async () => {
      const save = vi.fn(async () => true);
      const user = { id: 3, roles: ["bar_admin"], bar_id: 7, save };
      User.findByPk.mockResolvedValue(user);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({ userId: 3, makeBarAdmin: false });
      expect(res.status).toBe(200);
      expect(save).toHaveBeenCalled();
      expect(Array.isArray(res.body.user.roles)).toBe(true);
    });
  });

  describe("POST /super/users/register-in-bar", () => {
    it("requires super_admin or bar_admin", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Cookie", authCookie({ id: 1, roles: ["user"] }))
        .send({});
      expect(res.status).toBe(403);
    });

    it("400 invalid payload (no barId/barName)", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({
          roles: ["staff"],
          name: "N",
          login: "l",
          email: "e@example.com",
        });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("404 if bar not found by id", async () => {
      Bar.findByPk.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({
          barId: 5,
          roles: ["staff"],
          name: "N",
          login: "l",
          email: "e@example.com",
        });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Бар не найден" });
    });

    it("404 if bar not found by name", async () => {
      Bar.findByPk.mockResolvedValue(undefined);
      Bar.findOne.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Cookie", authCookie({ id: 1, roles: ["bar_admin"] }))
        .send({
          barName: "X",
          roles: ["staff"],
          name: "N",
          login: "l",
          email: "e@example.com",
        });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Бар не найден" });
    });

    it("409 if user with same login or email already exists", async () => {
      Bar.findByPk.mockResolvedValue({ id: 8, name: "Bar8" });

      User.findOne.mockResolvedValue({
        id: 11,
        email: "existing@example.com",
        login: "existing",
        name: "Existing",
        roles: ["user"],
        password: "hash:x",
        bar_id: null,
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Cookie", authCookie({ id: 1, roles: ["bar_admin"] }))
        .send({
          barId: 8,
          roles: ["staff", "bar_admin"],
          name: "N",
          login: "existing",
          email: "existing@example.com",
        });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        ok: false,
        error: "Сотрудник с таким логином или e‑mail уже существует",
      });
    });

    it("201 creates user with null password and sends invite email", async () => {
      Bar.findByPk.mockResolvedValue({ id: 8, name: "Bar8" });
      User.findOne.mockResolvedValue(null);

      User.create.mockResolvedValue({
        id: 101,
        email: "new@example.com",
        login: "new",
        name: "New",
        roles: ["staff"],
        password: null,
        bar_id: 8,
      });

      createPasswordToken.mockResolvedValue({ raw: "raw_token_123" });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Cookie", authCookie({ id: 1, roles: ["super_admin"] }))
        .send({
          barId: 8,
          roles: ["staff"],
          name: "New",
          login: "new",
          email: "new@example.com",
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@example.com",
          login: "new",
          name: "New",
          bar_id: 8,
          password: null,
        }),
      );
      expect(sendMail).toHaveBeenCalled();
    });
  });

  describe("POST /password/invite/session", () => {
    it("400 invalid payload", async () => {
      const app = appWithRouter();
      const res = await request(app).post("/auth/password/invite/session").send({});
      expect(res.status).toBe(400);
    });

    it("400 when token not found", async () => {
      PasswordToken.findOne.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/invite/session")
        .send({ token: "t" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: "Ссылка недействительна" });
      expect(sha256).toHaveBeenCalledWith("t");
    });

    it("400 when token already used", async () => {
      PasswordToken.findOne.mockResolvedValue({
        id: 1,
        user_id: 2,
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        used_at: new Date().toISOString(),
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/invite/session")
        .send({ token: "t" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: "Ссылка уже была использована" });
    });

    it("400 when token expired", async () => {
      PasswordToken.findOne.mockResolvedValue({
        id: 1,
        user_id: 2,
        expires_at: new Date(Date.now() - 60_000).toISOString(),
        used_at: null,
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/invite/session")
        .send({ token: "t" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: "Срок действия ссылки истек" });
    });

    it("200 sets invite_session cookie", async () => {
      PasswordToken.findOne.mockResolvedValue({
        id: 10,
        user_id: 20,
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        used_at: null,
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/invite/session")
        .send({ token: "t" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"].some((c) => c.startsWith("invite_session="))).toBe(true);
    });
  });

  describe("POST /password/request-reset", () => {
    it("401 when not authenticated", async () => {
      const app = appWithRouter();
      const res = await request(app).post("/auth/password/request-reset").send({});
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });

    it("404 when user not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/request-reset")
        .set("Cookie", authCookie({ id: 1, roles: ["user"] }))
        .send({});

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Пользователь не найден" });
    });

    it("200 creates reset token and sends email with code", async () => {
      User.findByPk.mockResolvedValue({ id: 1, email: "u@mail.com" });
      PasswordToken.create.mockResolvedValue({ id: 1 });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/request-reset")
        .set("Cookie", authCookie({ id: 1, roles: ["user"] }))
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(generateOtp6).toHaveBeenCalled();
      expect(PasswordToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1,
          token_hash: "sha256:123456",
          purpose: "reset",
          used_at: null,
        }),
      );
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "u@mail.com",
          subject: "Код для смены пароля",
        }),
      );
    });
  });

  describe("POST /password/confirm (invite)", () => {
    it("401 when no invite session", async () => {
      const app = appWithRouter();
      const res = await request(app).post("/auth/password/confirm").send({ password: "password123" });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });

    it("400 when invite token row missing", async () => {
      PasswordToken.findOne.mockResolvedValue(null);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/confirm")
        .set("Cookie", inviteCookie({ userId: 1, passwordTokenId: 2 }))
        .send({ password: "password123" });

      expect(res.status).toBe(400);
    });

    it("200 sets password, marks token used, clears invite cookie", async () => {
      const saveUser = vi.fn(async () => true);
      const saveToken = vi.fn(async () => true);

      PasswordToken.findOne.mockResolvedValue({
        id: 2,
        user_id: 1,
        purpose: "invite",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        used_at: null,
        save: saveToken,
      });

      User.findByPk.mockResolvedValue({
        id: 1,
        bar_id: 9,
        roles: ["staff"],
        password: null,
        save: saveUser,
      });

      PasswordToken.update.mockResolvedValue([1]);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/confirm")
        .set("Cookie", inviteCookie({ userId: 1, passwordTokenId: 2 }))
        .send({ password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ ok: true, purpose: "invite", barId: 9 });
      expect(saveUser).toHaveBeenCalled();
      expect(saveToken).toHaveBeenCalled();
      expect(PasswordToken.update).toHaveBeenCalled();
      expect(res.headers["set-cookie"].some((c) => c.startsWith("invite_session="))).toBe(true);
    });
  });

  describe("POST /password/confirm-code (reset)", () => {
    it("401 when not authenticated", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/confirm-code")
        .send({ code: "123456", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });

    it("400 invalid payload (bad code)", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/confirm-code")
        .set("Cookie", authCookie({ id: 1, roles: ["user"] }))
        .send({ code: "12", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("400 when code not found", async () => {
      PasswordToken.findOne.mockResolvedValue(null);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/confirm-code")
        .set("Cookie", authCookie({ id: 1, roles: ["user"] }))
        .send({ code: "123456", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Код недействителен или истёк" });
    });

    it("200 changes password and marks code used", async () => {
      const saveUser = vi.fn(async () => true);
      const saveToken = vi.fn(async () => true);

      PasswordToken.findOne.mockResolvedValue({
        id: 10,
        user_id: 1,
        purpose: "reset",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        used_at: null,
        save: saveToken,
      });

      User.findByPk.mockResolvedValue({
        id: 1,
        email: "u@mail.com",
        password: "old",
        save: saveUser,
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/confirm-code")
        .set("Cookie", authCookie({ id: 1, roles: ["user"] }))
        .send({ code: "123456", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, purpose: "reset" });
      expect(saveUser).toHaveBeenCalled();
      expect(saveToken).toHaveBeenCalled();
    });
  });

  describe("POST /password/request-invite-again", () => {
    it("401 when no invite session", async () => {
      const app = appWithRouter();
      const res = await request(app).post("/auth/password/request-invite-again").send({});
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });

    it("404 when user not found", async () => {
      User.findByPk.mockResolvedValue(null);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/request-invite-again")
        .set("Cookie", inviteCookie({ userId: 1, passwordTokenId: 2 }))
        .send({});

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Пользователь не найден" });
    });

    it('404 when bar not found', async () => {
      User.findByPk.mockResolvedValue({ id: 1, email: "u@mail.com", bar_id: 99 });
      Bar.findByPk.mockResolvedValue(null);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/request-invite-again")
        .set("Cookie", inviteCookie({ userId: 1, passwordTokenId: 2 }))
        .send({});

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Бар не найден" });
    });

    it("200 marks old invites used, clears invite cookie, creates new invite and sends email", async () => {
      User.findByPk.mockResolvedValue({ id: 1, email: "u@mail.com", bar_id: 5 });
      Bar.findByPk.mockResolvedValue({ id: 5, name: "Bar5" });

      PasswordToken.update.mockResolvedValue([1]);
      createPasswordToken.mockResolvedValue({ raw: "raw_token_123" });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/password/request-invite-again")
        .set("Cookie", inviteCookie({ userId: 1, passwordTokenId: 2 }))
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(PasswordToken.update).toHaveBeenCalled();
      expect(createPasswordToken).toHaveBeenCalledWith({ userId: 1, purpose: "invite" });
      expect(sendMail).toHaveBeenCalled();
      expect(res.headers["set-cookie"].some((c) => c.startsWith("invite_session="))).toBe(true);
    });
  });
});