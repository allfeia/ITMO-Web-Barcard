import { beforeEach, describe, expect, it, vi } from "vitest";

describe("scripts/seed-super-admin.js", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("создает или находит супер-админа", async () => {
    const authenticate = vi.fn().mockResolvedValue();
    const findOrCreate = vi.fn().mockResolvedValue([{ id: 1 }, true]);
    const hash = vi.fn().mockResolvedValue("hashed");

    vi.doMock("../src/db.js", () => ({ sequelize: { authenticate } }));
    vi.doMock("../src/models.js", () => ({
      User: { findOrCreate },
      __esModule: true,
      default: {},
    }));
    vi.doMock("bcryptjs", () => ({ default: { hash }, hash }));

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });

    let thrown;
    try {
      const mod = await import("../src/scripts/seed-super-admin.js");
      await mod.run();
    } catch (e) {
      thrown = e;
    }

    expect(authenticate).toHaveBeenCalledTimes(1);
    expect(hash).toHaveBeenCalledWith(expect.any(String), 12);
    expect(findOrCreate).toHaveBeenCalledWith({
      where: { email: "root@example.com" },
      defaults: expect.objectContaining({
        email: "root@example.com",
        login: "root",
        name: "Root",
        roles: ["super_admin"],
        password: "hashed",
        bar_id: null,
      }),
    });
    expect(thrown?.message).toBe("exit");
    exitSpy.mockRestore();
  });
});