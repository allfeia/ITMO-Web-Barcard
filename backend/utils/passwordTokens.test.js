import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const createMock = vi.fn();

vi.mock("../src/models.js", () => {
  return {
    PasswordToken: {
      create: createMock,
    },
  };
});

describe("passwordTokens", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.PASSWORD_TOKEN_TTL_MIN;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("makeRawToken возвращает hex строку длиной 64", async () => {
    const { makeRawToken } = await import("./passwordTokens.js");
    const t = makeRawToken();
    expect(typeof t).toBe("string");
    expect(t).toMatch(/^[0-9a-f]{64}$/);
  });

  it("sha256 возвращает ожидаемый хэш", async () => {
    const { sha256 } = await import("./passwordTokens.js");
    expect(sha256("test")).toBe(
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    );
  });

  it("verifyToken возвращает true для корректной пары raw/hash и false иначе", async () => {
    const { verifyToken, sha256 } = await import("./passwordTokens.js");
    const raw = "abc";
    const h = sha256(raw);
    expect(verifyToken(raw, h)).toBe(true);
    expect(verifyToken("abcd", h)).toBe(false);
  });

  it("getExpiryDate использует TTL по умолчанию 15 минут", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

    const { getExpiryDate } = await import("./passwordTokens.js");
    const d = getExpiryDate();

    expect(d.toISOString()).toBe("2020-01-01T00:15:00.000Z");

    vi.useRealTimers();
  });

  it("getExpiryDate использует PASSWORD_TOKEN_TTL_MIN из env", async () => {
    process.env.PASSWORD_TOKEN_TTL_MIN = "2";

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

    const { getExpiryDate } = await import("./passwordTokens.js");
    const d = getExpiryDate();

    expect(d.toISOString()).toBe("2020-01-01T00:02:00.000Z");

    vi.useRealTimers();
  });

  it("generateOtp6 возвращает строку из 6 цифр", async () => {
    const { generateOtp6 } = await import("./passwordTokens.js");
    for (let i = 0; i < 50; i++) {
      const otp = generateOtp6();
      expect(otp).toMatch(/^\d{6}$/);
      const n = Number(otp);
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });

  it("createPasswordToken создает запись и возвращает raw и row", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
    process.env.PASSWORD_TOKEN_TTL_MIN = "10";

    const rowFromDb = { id: 123 };
    createMock.mockResolvedValue(rowFromDb);

    const mod = await import("./passwordTokens.js");
    const res = await mod.createPasswordToken({ userId: 7, purpose: "reset" });

    expect(res).toHaveProperty("raw");
    expect(res.raw).toMatch(/^[0-9a-f]{64}$/);
    expect(res).toEqual({ raw: res.raw, row: rowFromDb });

    expect(createMock).toHaveBeenCalledTimes(1);
    const arg = createMock.mock.calls[0][0];

    expect(arg.user_id).toBe(7);
    expect(arg.purpose).toBe("reset");
    expect(arg.token_hash).toBe(mod.sha256(res.raw));
    expect(arg.expires_at instanceof Date).toBe(true);
    expect(arg.expires_at.toISOString()).toBe("2020-01-01T00:10:00.000Z");

    vi.useRealTimers();
  });
});