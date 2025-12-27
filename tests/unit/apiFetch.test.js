import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useApiFetch } from "../../src/apiFetch"; 

describe("useApiFetch", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("всегда добавляет credentials: include к запросу", async () => {
    const apiFetch = useApiFetch();

    globalThis.fetch.mockResolvedValueOnce({ status: 200 });

    await apiFetch("/api/data", { method: "GET" });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/data",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      })
    );
  });

  it("если статус не 401 — возвращает первый response и не делает refresh", async () => {
    const apiFetch = useApiFetch();

    const res = { status: 200, ok: true };
    globalThis.fetch.mockResolvedValueOnce(res);

    const out = await apiFetch("/api/data");

    expect(out).toBe(res);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/data",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("если 401 и refresh успешен — повторяет исходный запрос и возвращает второй response", async () => {
    const apiFetch = useApiFetch();

    const first = { status: 401, ok: false };
    const refresh = { ok: true };
    const second = { status: 200, ok: true };

    globalThis.fetch
      .mockResolvedValueOnce(first) // original
      .mockResolvedValueOnce(refresh) // refresh-token
      .mockResolvedValueOnce(second); // retry

    const out = await apiFetch("/api/data", { headers: { a: "b" } });

    expect(out).toBe(second);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);

    // 1) original
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/data",
      expect.objectContaining({
        headers: { a: "b" },
        credentials: "include",
      })
    );

    // 2) refresh
    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, "/api/refresh-token", {
      method: "POST",
      credentials: "include",
    });

    // 3) retry original
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      3,
      "/api/data",
      expect.objectContaining({
        headers: { a: "b" },
        credentials: "include",
      })
    );
  });

  it("если 401 и refresh НЕ успешен — возвращает первый response и не ретраит исходный запрос", async () => {
    const apiFetch = useApiFetch();

    const first = { status: 401, ok: false };
    const refresh = { ok: false };

    globalThis.fetch
      .mockResolvedValueOnce(first) // original
      .mockResolvedValueOnce(refresh); // refresh-token

    const out = await apiFetch("/api/data");

    expect(out).toBe(first);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/data",
      expect.objectContaining({ credentials: "include" })
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, "/api/refresh-token", {
      method: "POST",
      credentials: "include",
    });
  });

  it("если fetch кидает ошибку — логирует и пробрасывает её дальше", async () => {
    const apiFetch = useApiFetch();

    const err = new Error("network");
    globalThis.fetch.mockRejectedValueOnce(err);

    await expect(apiFetch("/api/data")).rejects.toThrow("network");
    expect(console.error).toHaveBeenCalledWith(err);
  });
});