import { beforeEach, describe, expect, it, vi } from "vitest";

describe("scripts/sync.js", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("успешный sync завершает процесс с кодом 0", async () => {
    const sync = vi.fn().mockResolvedValue();

    vi.doMock("../src/db.js", () => ({ sequelize: { sync } }));
    vi.doMock("../src/models.js", () => ({}));

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });

    let err;
    try {
      const mod = await import("../src/scripts/sync.js");
      await mod.run();
    } catch (e) {
      err = e;
    }

    expect(sync).toHaveBeenCalledWith({ alter: true });
    expect(err?.message).toBe("exit");
    exitSpy.mockRestore();
  });

  it("ошибка sync завершает процесс с кодом 1", async () => {
    const sync = vi.fn().mockRejectedValue(new Error("db error"));

    vi.doMock("../src/db.js", () => ({ sequelize: { sync } }));
    vi.doMock("../src/models.js", () => ({}));

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit1");
    });

    let err;
    try {
      const mod = await import("../src/scripts/sync.js");
      await mod.run();
    } catch (e) {
      err = e;
    }

    expect(sync).toHaveBeenCalledWith({ alter: true });
    expect(err?.message).toBe("exit1");
    exitSpy.mockRestore();
  });
});
