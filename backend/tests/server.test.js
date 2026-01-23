import { beforeEach, describe, expect, it, vi } from "vitest";

describe("server.js bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();

    vi.doMock("../src/db.js", () => ({
      sequelize: { authenticate: vi.fn().mockResolvedValue(void 0) },
    }));

    vi.doMock("../src/models.js", () => ({}));

    const use = vi.fn();
    const listen = vi.fn((port, cb) => cb && cb());
    const set = vi.fn();

    const app = {
      use,
      listen,
      _set: set,
    };

    const expressMock = vi.fn(() => app);
    expressMock.json = vi.fn(() => (req, res, next) => next());

    vi.doMock("express", () => ({ default: expressMock }));
    vi.doMock("helmet", () => ({ default: vi.fn(() => (req, res, next) => next()) }));
    vi.doMock("cors", () => ({ default: vi.fn(() => (req, res, next) => next()) }));

    const rateLimitMock = vi.fn(() => (req, res, next) => next());
    vi.doMock("express-rate-limit", () => ({ default: rateLimitMock }));

    vi.doMock("cookie-parser", () => ({
      default: vi.fn(() => (req, res, next) => next()),
    }));

    const routerStub = (req, res, next) => next && next();
    vi.doMock("../src/routes/auth.js", () => ({ default: routerStub }));
    vi.doMock("../src/routes/api.js", () => ({ default: routerStub }));

    vi.doMock("../utils/telegramOdersBot.js", () => ({
      getBot: vi.fn(),
    }));

    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("настраивает middlewares, роуты и стартует сервер", async () => {
    process.env.PORT = "0";
    process.env.CORS_ORIGIN = "http://localhost";

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    const { sequelize } = await import("../src/db.js");
    const { getBot } = await import("../utils/telegramOdersBot.js");
    const express = (await import("express")).default;
    const helmet = (await import("helmet")).default;
    const cors = (await import("cors")).default;
    const rateLimit = (await import("express-rate-limit")).default;
    const cookieParser = (await import("cookie-parser")).default;

    await import("../src/server.js");

    expect(consoleError).not.toHaveBeenCalled();

    const app = express.mock.results[0].value;

    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledTimes(1);

    expect(cookieParser).toHaveBeenCalledTimes(1);
    expect(helmet).toHaveBeenCalledTimes(1);
    expect(cors).toHaveBeenCalledTimes(1);

    expect(express.json).toHaveBeenCalledWith({ limit: "1mb" });

    expect(rateLimit).toHaveBeenCalledTimes(2);
    expect(rateLimit).toHaveBeenNthCalledWith(1, {
      windowMs: 15 * 60 * 1000,
      max: 100,
    });
    expect(rateLimit).toHaveBeenNthCalledWith(2, {
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
    });

    expect(getBot).toHaveBeenCalledTimes(1);

    expect(consoleLog).toHaveBeenCalled();
  });

  it("при ошибке подключения к БД пишет ошибку и завершает процесс", async () => {
    vi.resetModules();

    const authErr = new Error("auth failed");
    vi.doMock("../src/db.js", () => ({
      sequelize: { authenticate: vi.fn().mockRejectedValue(authErr) },
    }));
    vi.doMock("../src/models.js", () => ({}));

    const use = vi.fn();
    const listen = vi.fn();
    const app = { use, listen };
    const expressMock = vi.fn(() => app);
    expressMock.json = vi.fn(() => (req, res, next) => next());
    vi.doMock("express", () => ({ default: expressMock }));

    vi.doMock("helmet", () => ({ default: vi.fn(() => (req, res, next) => next()) }));
    vi.doMock("cors", () => ({ default: vi.fn(() => (req, res, next) => next()) }));
    vi.doMock("express-rate-limit", () => ({ default: vi.fn(() => (req, res, next) => next()) }));
    vi.doMock("cookie-parser", () => ({
      default: vi.fn(() => (req, res, next) => next()),
    }));

    const routerStub = (req, res, next) => next && next();
    vi.doMock("../src/routes/auth.js", () => ({ default: routerStub }));
    vi.doMock("../src/routes/api.js", () => ({ default: routerStub }));

    vi.doMock("../utils/telegramOdersBot.js", () => ({
      getBot: vi.fn(),
    }));

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined);

    await import("../src/server.js");

    await new Promise((r) => setTimeout(r, 0));

    expect(consoleError).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(listen).not.toHaveBeenCalled();
  });
});
