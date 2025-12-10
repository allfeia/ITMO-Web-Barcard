import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../models.js", () => {
  return {
    Bar: {
      findAll: vi.fn(),
      findByPk: vi.fn(),
      create: vi.fn(),
      findOne: vi.fn(),
    },
    User: { findByPk: vi.fn(), findAll: vi.fn() },
    Point: { findOne: vi.fn() },
    Cocktail: { findAll: vi.fn(), findByPk: vi.fn() },
    Ingredient: vi.fn(), // как модель, но напрямую в тестах не трогаем
    CocktailIngredient: vi.fn(),
    CocktailRecipeStep: vi.fn(),
    UserFavourite: {
      findOrCreate: vi.fn(),
      findAll: vi.fn(),
      destroy: vi.fn(),
    },
  };
});

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn(async (s) => `hash:${s}`) },
}));

import router from "./api.js";
import { Bar, User, Point } from "../models.js";
import jwt from "jsonwebtoken";

function appWithRouter() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  return app;
}

function bearer(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET || "dev", {
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
}

describe("api router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /health", async () => {
    const app = appWithRouter();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  describe("GET /me", () => {
    it("401 if no user id in token", async () => {
      const app = appWithRouter();
      const auth = bearer({ roles: ["user"] }); // без id
      const res = await request(app).get("/api/me").set("Authorization", auth);
      expect(res.status).toBe(401);
    });

    it("404 if user not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["user"] });
      const res = await request(app).get("/api/me").set("Authorization", auth);
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: ["id", "email", "login", "name", "roles", "bar_id"],
      });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "User not found" });
    });

    it("returns profile with points sum", async () => {
      const fakeUser = {
        id: 2,
        email: "a",
        login: "l",
        name: "n",
        roles: ["user"],
        bar_id: 3,
      };
      User.findByPk.mockResolvedValue(fakeUser);
      Point.findOne.mockResolvedValue({ get: vi.fn().mockReturnValue("42") });

      const app = appWithRouter();
      const auth = bearer({ id: 2, roles: ["user"] });
      const res = await request(app).get("/api/me").set("Authorization", auth);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: 2,
        email: "a",
        login: "l",
        name: "n",
        roles: ["user"],
        bar_id: 3,
        points: 42,
      });
    });

    it("handles server error", async () => {
      User.findByPk.mockRejectedValue(new Error("db down"));
      const app = appWithRouter();
      const auth = bearer({ id: 3, roles: ["user"] });
      const res = await request(app).get("/api/me").set("Authorization", auth);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Server error" });
    });
  });

  describe("GET /admin/bars", () => {
    it("requires super_admin", async () => {
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["user"] });
      const res = await request(app)
        .get("/api/admin/bars")
        .set("Authorization", auth);
      expect(res.status).toBe(403);
    });

    it("lists bars", async () => {
      Bar.findAll.mockResolvedValue([
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ]);
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .get("/api/admin/bars")
        .set("Authorization", auth);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ]);
      expect(Bar.findAll).toHaveBeenCalledWith({ order: [["name", "ASC"]] });
    });
  });

  describe("GET /bars?query=", () => {
    it("returns [] for empty query", async () => {
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .get("/api/bars")
        .set("Authorization", auth);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("searches by name (ilike)", async () => {
      Bar.findAll.mockResolvedValue([{ id: 5, name: "Foo" }]);
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .get("/api/bars?query=Fo")
        .set("Authorization", auth);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 5, name: "Foo" }]);
    });
  });

  describe("POST /admin/bars", () => {
    it("400 on invalid payload", async () => {
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .post("/api/admin/bars")
        .set("Authorization", auth)
        .send({ name: "", barKey: "" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid payload" });
    });

    it("201 on valid payload", async () => {
      Bar.create.mockResolvedValue({ id: 10, name: "NewBar" });
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .post("/api/admin/bars")
        .set("Authorization", auth)
        .send({
          name: "NewBar",
          address: "Street 1",
          description: "desc",
          website: "https://ex.com",
          barKey: "k",
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: "Бар создан",
        id: 10,
        name: "NewBar",
      });
      expect(Bar.create).toHaveBeenCalled();
    });
  });

  describe("GET /admin/bars/:barId/staff", () => {
    it("400 on invalid barId", async () => {
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .get("/api/admin/bars/xyz/staff")
        .set("Authorization", auth);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid bar id" });
    });

    it("404 if bar not found", async () => {
      Bar.findByPk.mockResolvedValue(null);
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .get("/api/admin/bars/7/staff")
        .set("Authorization", auth);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Бар не найден" });
    });

    it("returns mapped staff", async () => {
      Bar.findByPk.mockResolvedValue({ id: 7, name: "B" });
      User.findAll.mockResolvedValue([
        {
          id: 1,
          email: "e1",
          login: "l1",
          name: "n1",
          roles: ["staff"],
          bar_id: 7,
        },
        {
          id: 2,
          email: "e2",
          login: "l2",
          name: "n2",
          roles: ["bar_admin"],
          bar_id: 7,
        },
      ]);
      const app = appWithRouter();
      const auth = bearer({ id: 1, roles: ["super_admin"] });
      const res = await request(app)
        .get("/api/admin/bars/7/staff")
        .set("Authorization", auth);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          id: 1,
          email: "e1",
          login: "l1",
          name: "n1",
          roles: ["staff"],
          bar_id: 7,
        },
        {
          id: 2,
          email: "e2",
          login: "l2",
          name: "n2",
          roles: ["bar_admin"],
          bar_id: 7,
        },
      ]);
    });
  });
});

describe("GET /cocktail", () => {
  it("400 if invalid barId", async () => {
    const app = appWithRouter();
    const res = await request(app).get("/api/cocktail?barId=abc");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid barId" });
  });

  it("returns cocktails for bar", async () => {
    Cocktail.findAll.mockResolvedValue([
      { id: 1, name: "A", description: "d", image: "img" },
    ]);
    const app = appWithRouter();
    const res = await request(app).get("/api/cocktail?barId=1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: "A", description: "d", image: "img" },
    ]);
  });

  it("500 on error", async () => {
    Cocktail.findAll.mockRejectedValue(new Error("db down"));
    const app = appWithRouter();
    const res = await request(app).get("/api/cocktail?barId=1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Server error" });
  });
});

describe("POST /favourites", () => {
  it("401 without auth", async () => {
    const app = appWithRouter();
    const res = await request(app)
      .post("/api/favourites")
      .send({ savedCocktailsId: [1, 2] });
    expect(res.status).toBe(401);
  });

  it("400 invalid payload", async () => {
    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .post("/api/favourites")
      .set("Authorization", auth)
      .send({ savedCocktailsId: "not-array" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid payload");
  });

  it("returns list of favourite cocktails", async () => {
    Cocktail.findAll.mockResolvedValue([
      { id: 1, name: "A", description: "d", image: "i", bar_id: 1 },
    ]);
    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .post("/api/favourites")
      .set("Authorization", auth)
      .send({ savedCocktailsId: [1] });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: "A", description: "d", image: "i", bar_id: 1 },
    ]);
  });
});

describe("PATCH /favourites/add/:cocktailId", () => {
  it("401 without auth", async () => {
    const app = appWithRouter();
    const res = await request(app).patch("/api/favourites/add/1");
    expect(res.status).toBe(401);
  });

  it("400 invalid cocktail id", async () => {
    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .patch("/api/favourites/add/abc")
      .set("Authorization", auth);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid cocktail id" });
  });

  it("404 cocktail not found", async () => {
    Cocktail.findByPk.mockResolvedValue(null);
    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .patch("/api/favourites/add/5")
      .set("Authorization", auth);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Cocktail not found" });
  });

  it("ok when created", async () => {
    Cocktail.findByPk.mockResolvedValue({ id: 5 });
    UserFavourite.findOrCreate.mockResolvedValue([{ id: 1 }, true]);

    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .patch("/api/favourites/add/5")
      .set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, cocktailId: 5, created: true });
  });
});

describe("DELETE /favourites/remove/:cocktailId", () => {
  it("401 without auth", async () => {
    const app = appWithRouter();
    const res = await request(app).delete("/api/favourites/remove/1");
    expect(res.status).toBe(401);
  });

  it("400 invalid cocktail id", async () => {
    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .delete("/api/favourites/remove/abc")
      .set("Authorization", auth);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid cocktail id" });
  });

  it("ok and deleted=false when nothing deleted", async () => {
    UserFavourite.destroy.mockResolvedValue(0);
    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .delete("/api/favourites/remove/5")
      .set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, cocktailId: 5, deleted: false });
  });

  it("ok and deleted=true when record deleted", async () => {
    UserFavourite.destroy.mockResolvedValue(1);
    const app = appWithRouter();
    const auth = bearer({ id: 1, roles: ["user"] });
    const res = await request(app)
      .delete("/api/favourites/remove/5")
      .set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, cocktailId: 5, deleted: true });
  });
});
