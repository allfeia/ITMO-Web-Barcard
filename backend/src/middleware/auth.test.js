import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { signJwt, signRefreshToken, authRequired, requireRole } from "./auth.js";

describe("signJwt", () => {
  it("normalizes roles and bar_id from barId", () => {
    const token = signJwt({
      id: 1,
      email: "a@b",
      login: "a",
      name: "A",
      roles: ["user", null, undefined, "admin"],
      barId: 7,
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");
    expect(decoded.roles).toEqual(["user", "admin"]);
    expect(decoded.bar_id).toBe(7);
  });

  it("keeps null bar_id if not provided and filters bad roles", () => {
    const token = signJwt({
      id: 2,
      email: "x@y",
      login: "x",
      name: "X",
      roles: [null, false, 0, "staff"],
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");
    expect(decoded.roles).toEqual(["staff"]);
    expect(decoded.bar_id).toBe(null);
  });

  it("prefers numeric bar_id over barId", () => {
    const token = signJwt({
      id: 3,
      roles: ["user"],
      bar_id: 5,
      barId: 999,
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");
    expect(decoded.bar_id).toBe(5);
  });
});

describe("signRefreshToken", () => {
  it("signs token with REFRESH_SECRET and same payload normalization", () => {
    const token = signRefreshToken({
      id: 11,
      roles: ["user", null, "admin"],
      barId: 8,
    });

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET || "refresh_dev");
    expect(decoded.id).toBe(11);
    expect(decoded.roles).toEqual(["user", "admin"]);
    expect(decoded.bar_id).toBe(8);
  });
});

describe("authRequired", () => {
  const mkReq = (cookies = undefined) => (cookies ? { cookies } : {});
  const mkRes = () => {
    const r = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    return r;
  };
  const next = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    next.mockReset();
  });

  it("responds 401 without token in cookies", () => {
    const res = mkRes();
    const req = mkReq();
    authRequired(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 on invalid token", () => {
    const res = mkRes();
    const req = mkReq({ access_token: "bad" });

    authRequired(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches normalized user and calls next on valid token", () => {
    const token = jwt.sign(
      { id: 10, roles: "not-an-array", barId: 3 },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "1h" }
    );

    const res = mkRes();
    const req = mkReq({ access_token: token });

    authRequired(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(10);
    expect(req.user.roles).toEqual([]);
    expect(req.user.bar_id).toBe(3);
  });

  it("filters falsy roles coming from token payload", () => {
    const token = jwt.sign(
      { id: 12, roles: ["user", null, undefined, "admin"], bar_id: 2 },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "1h" }
    );

    const res = mkRes();
    const req = mkReq({ access_token: token });

    authRequired(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.roles).toEqual(["user", "admin"]);
    expect(req.user.bar_id).toBe(2);
  });
});

describe("requireRole", () => {
  const mkRes = () => {
    const r = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    return r;
  };
  const next = vi.fn();

  beforeEach(() => next.mockReset());

  it("403 if no req.user", () => {
    const res = mkRes();
    requireRole("admin")({}, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  it("403 if role not present", () => {
    const res = mkRes();
    const req = { user: { roles: ["user"] } };

    requireRole("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes if any required role is present", () => {
    const res = mkRes();
    const req = { user: { roles: ["bar_admin"] } };

    requireRole("staff", "bar_admin")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});