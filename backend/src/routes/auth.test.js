import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../models.js", () => {
  return {
    User: { findOne: vi.fn(), findByPk: vi.fn(), create: vi.fn() },
    Bar: { findByPk: vi.fn(), findOne: vi.fn() },
    UserFavourite: { findAll: vi.fn() },
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(async (a, b) => a === b || b === `hash:${a}`),
    hash: vi.fn(async (s) => `hash:${s}`),
  },
}));

import router from "./auth.js";
import { User, Bar, UserFavourite } from "../models.js";
import jwt from "jsonwebtoken";

function appWithRouter() {
  const app = express();
  app.use(express.json());
  app.use("/auth", router);
  return app;
}

function bearer(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET || "dev", {
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
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
      expect(res.body).toEqual({ error: "Not found" });
    });

    it("403 when not super_admin", async () => {
      User.findOne.mockResolvedValue({ roles: ["user"] });
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/login")
        .send({ username: "u", password: "x" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Forbidden" });
    });

    it("403 when no password set", async () => {
      User.findOne.mockResolvedValue({
        roles: ["super_admin"],
        password: null,
      });
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/login")
        .send({ username: "u", password: "x" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No password set" });
    });

    it("403 when invalid password", async () => {
      // compare вернет false т.к. password !== user.password
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
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Invalid password" });
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
      expect(typeof res.body.token).toBe("string");
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
      expect(res.body).toEqual({
          errors: {
              barKey: "Неверный ключ бара",
          },
      });
    });

    it("404 user not found", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      // compare для barKey вернет true, так как compare сравнивает a===b
      const originalCompare = (await import("bcryptjs")).default.compare;
      originalCompare.mockResolvedValueOnce(true); // для ключа бара
      User.findOne.mockResolvedValue(null);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Пользователь не найден" });
    });

    it("403 not staff", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true); // ключ бара ок
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
      expect(res.body).toEqual({ error: "Пользователь не сотрудник бара" });
    });

    it("403 attached to another bar", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true); // ключ бара ок
      User.findOne.mockResolvedValue({
        roles: ["staff"],
        bar_id: 3,
        password: "p",
      });

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        error: "Пользователь привязан к другому бару",
      });
    });

    it("403 no password set", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare.mockResolvedValueOnce(true); // ключ бара ок
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
      expect(res.body).toEqual({
          errors: {
              password: "Пароль не установлен",
          },
      });
    });

    it("403 wrong password", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare
        .mockResolvedValueOnce(true) // ключ бара
        .mockResolvedValueOnce(false); // пароль
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
      expect(res.body).toEqual({
          errors: {
              password: "Неверный пароль",
          },
      });
    });

    it("200 login ok", async () => {
      Bar.findByPk.mockResolvedValue({ id: 2, pass_key: "k" });
      const { default: bcrypt } = await import("bcryptjs");
      bcrypt.compare
        .mockResolvedValueOnce(true) // ключ бара
        .mockResolvedValueOnce(true); // пароль
      User.findOne.mockResolvedValue({
        id: 10,
        login: "l",
        email: "e",
        name: "n",
        roles: ["staff"],
        bar_id: 2,
        password: "p",
      });
      UserFavourite.findAll.mockResolvedValue([
        { cocktail_id: 1 },
        { cocktail_id: 3 },
      ]);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/barman/auth")
        .send({ barId: 2, username: "u", password: "p", barKey: "k" });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.mode).toBe("login");
      expect(res.body.user).toMatchObject({ id: 10, bar_id: 2 });
      expect(res.body.saved_cocktails_id).toEqual([1, 3]);
      expect(typeof res.body.token).toBe("string");
    });
  });

  describe("POST /super/grant-bar-admin", () => {
    it("requires super_admin role", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Authorization", bearer({ id: 1, roles: ["user"] }))
        .send({ userId: 1, makeBarAdmin: true });
      expect(res.status).toBe(403);
    });

    it("400 invalid payload", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Authorization", bearer({ id: 1, roles: ["super_admin"] }))
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("404 user not found", async () => {
      const app = appWithRouter();
      const { User } = await import("../models.js");
      User.findByPk.mockResolvedValue(null);
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Authorization", bearer({ id: 1, roles: ["super_admin"] }))
        .send({ userId: 99, makeBarAdmin: true });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Сотрудник не найден" });
    });

    it("makes bar_admin and staff when makeBarAdmin=true", async () => {
      const save = vi.fn();
      const user = { id: 2, roles: ["staff"], bar_id: 5, save };
      User.findByPk.mockResolvedValue(user);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Authorization", bearer({ id: 1, roles: ["super_admin"] }))
        .send({ userId: 2, makeBarAdmin: true });
      expect(res.status).toBe(200);
      expect(save).toHaveBeenCalled();
      expect(res.body.user).toMatchObject({ id: 2 });
      expect(res.body.ok).toBe(true);
    });

    it("400 if makeBarAdmin=true but user has no bar_id", async () => {
      const save = vi.fn();
      const user = { id: 2, roles: ["user"], bar_id: null, save };
      User.findByPk.mockResolvedValue(user);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Authorization", bearer({ id: 1, roles: ["super_admin"] }))
        .send({ userId: 2, makeBarAdmin: true });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Сотрудник должен работать в баре" });
    });

    it("removes bar_admin when makeBarAdmin=false and keeps at least user", async () => {
      const save = vi.fn();
      const user = { id: 3, roles: ["bar_admin"], bar_id: 7, save };
      User.findByPk.mockResolvedValue(user);

      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/grant-bar-admin")
        .set("Authorization", bearer({ id: 1, roles: ["super_admin"] }))
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
        .set("Authorization", bearer({ id: 1, roles: ["user"] }))
        .send({});
      expect(res.status).toBe(403);
    });

    it("400 invalid payload (no barId/barName)", async () => {
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Authorization", bearer({ id: 1, roles: ["super_admin"] }))
        .send({
          // нет barId/barName
          roles: ["staff"],
          name: "N",
          login: "l",
          email: "e@example.com",
          password: "secret12",
        });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("404 if bar not found by id", async () => {
      Bar.findByPk.mockResolvedValue(null);
      const app = appWithRouter();
      const res = await request(app)
        .post("/auth/super/users/register-in-bar")
        .set("Authorization", bearer({ id: 1, roles: ["super_admin"] }))
        .send({
          barId: 5,
          roles: ["staff"],
          name: "N",
          login: "l",
          email: "e@example.com",
          password: "secret12",
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
        .set("Authorization", bearer({ id: 1, roles: ["bar_admin"] }))
        .send({
          barName: "X",
          roles: ["staff"],
          name: "N",
          login: "l",
          email: "e@example.com",
          password: "secret12",
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
    .set("Authorization", bearer({ id: 1, roles: ["bar_admin"] }))
    .send({
      barId: 8,
      roles: ["staff", "bar_admin"],
      name: "N",
      login: "existing",          
      email: "existing@example.com", 
      password: "secret12",
    });

  expect(res.status).toBe(409);
  expect(res.body).toEqual({
    ok: false,
    error: "Сотрудник с таким логином или e‑mail уже существует",
  });
});
  
  });
});
