// tests/server.test.js
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("server.js bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();

    // Мокаем sequelize и authenticate
    vi.doMock("../src/db.js", () => ({
      sequelize: { authenticate: vi.fn().mockResolvedValue(void 0) },
    }));

    // Мокаем models импорт, чтобы побочный код не мешал
    vi.doMock("../src/models.js", () => ({}));

    // Мокаем express и все middlewares
    const use = vi.fn();
    const getApp = () => ({
      use,
      listen: vi.fn((port, cb) => cb && cb()),
    });

    const expressMock = vi.fn(() => getApp());
    expressMock.json = () => (req, res, next) => next();

    vi.doMock("express", () => ({ default: expressMock }));
    vi.doMock("helmet", () => ({ default: () => (req, res, next) => next() }));
    vi.doMock("cors", () => ({
      default: () => (req, res, next) => next(),
    }));
    vi.doMock("express-rate-limit", () => ({
      default: () => (req, res, next) => next(),
    }));

    // Мокаем роуты
    const routerStub = (req, res, next) => next && next();
    vi.doMock("../src/routes/auth.js", () => ({ default: routerStub }));
    vi.doMock("../src/routes/api.js", () => ({ default: routerStub }));

    // Тишина в логах
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("настраивает middlewares, роуты и стартует сервер", async () => {
    process.env.PORT = "0";
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await import("../src/server.js");

    // Проверяем, что ошибок не было
    expect(consoleError).not.toHaveBeenCalled();
  });
});