import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("db.js", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  it("создает Sequelize без SSL, когда в URL нет sslmode=require", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@host:5432/db";
    const SequelizeMock = vi.fn().mockImplementation((_url, opts) => {
      // сохраняем опции, чтобы проверить
      return { opts };
    });
    vi.doMock("sequelize", () => ({ Sequelize: SequelizeMock }));

    const { sequelize } = await import("../src/db.js");
    expect(SequelizeMock).toHaveBeenCalledTimes(1);
    const [_url, opts] = SequelizeMock.mock.calls[0];
    expect(opts.logging).toBe(false);
    expect(opts.dialect).toBe("postgres");
    expect(opts.dialectOptions).toEqual({});
    expect(sequelize.opts.dialectOptions).toEqual({});
  });

  it("включает SSL, когда в URL присутствует sslmode=require", async () => {
    process.env.DATABASE_URL =
      "postgres://user:pass@host:5432/db?sslmode=require";
    const SequelizeMock = vi.fn().mockImplementation((_url, opts) => {
      return { opts };
    });
    vi.doMock("sequelize", () => ({ Sequelize: SequelizeMock }));

    const { sequelize } = await import("../src/db.js");
    const [_url, opts] = SequelizeMock.mock.calls[0];
    expect(opts.dialectOptions).toEqual({
      ssl: { require: true, rejectUnauthorized: false },
    });
    expect(sequelize.opts.dialectOptions.ssl.require).toBe(true);
  });
});