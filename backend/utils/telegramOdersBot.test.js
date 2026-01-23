import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("telegramOdersBot.js", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.TG_BOT_TOKEN;
    delete process.env.TG_BOT_POLLING;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  it("getBot: бросает ошибку если TG_BOT_TOKEN отсутствует", async () => {
    vi.doMock("telegraf", () => ({ Telegraf: vi.fn() }));

    const mod = await import("./telegramOdersBot.js");
    expect(() => mod.getBot()).toThrow("TG_BOT_TOKEN is missing in env");
  });

  it("getBot: создает бота один раз и кеширует инстанс", async () => {
    process.env.TG_BOT_TOKEN = "token";

    const start = vi.fn();
    const command = vi.fn();
    const launch = vi.fn();
    const stop = vi.fn();
    const sendMessage = vi.fn();

    const TelegrafMock = vi.fn(() => ({
      start,
      command,
      launch,
      stop,
      telegram: { sendMessage },
    }));

    vi.doMock("telegraf", () => ({ Telegraf: TelegrafMock }));

    const mod = await import("./telegramOdersBot.js");

    const b1 = mod.getBot();
    const b2 = mod.getBot();

    expect(TelegrafMock).toHaveBeenCalledTimes(1);
    expect(TelegrafMock).toHaveBeenCalledWith("token");
    expect(b2).toBe(b1);

    expect(start).toHaveBeenCalledTimes(1);
    expect(command).toHaveBeenCalledTimes(1);
    expect(command).toHaveBeenCalledWith("chatid", expect.any(Function));
    expect(launch).not.toHaveBeenCalled();
  });

  it("getBot: включает polling и вызывает launch/обработчики сигналов", async () => {
    process.env.TG_BOT_TOKEN = "token";
    process.env.TG_BOT_POLLING = "true";

    const start = vi.fn();
    const command = vi.fn();
    const launch = vi.fn();
    const stop = vi.fn();
    const sendMessage = vi.fn();

    const TelegrafMock = vi.fn(() => ({
      start,
      command,
      launch,
      stop,
      telegram: { sendMessage },
    }));

    vi.doMock("telegraf", () => ({ Telegraf: TelegrafMock }));

    const onceSpy = vi.spyOn(process, "once").mockImplementation(() => process);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const mod = await import("./telegramOdersBot.js");
    const b = mod.getBot();

    expect(b).toBeTruthy();
    expect(launch).toHaveBeenCalledTimes(1);

    expect(onceSpy).toHaveBeenCalledTimes(2);
    expect(onceSpy).toHaveBeenNthCalledWith(1, "SIGINT", expect.any(Function));
    expect(onceSpy).toHaveBeenNthCalledWith(2, "SIGTERM", expect.any(Function));

    expect(logSpy).toHaveBeenCalledWith("TG polling enabled, launching bot...");
    expect(logSpy).toHaveBeenCalledWith("Bot launched");
  });

  it("getBot: регистрирует start handler и он отвечает нужным текстом", async () => {
    process.env.TG_BOT_TOKEN = "token";

    const start = vi.fn();
    const command = vi.fn();
    const launch = vi.fn();
    const stop = vi.fn();
    const sendMessage = vi.fn();

    const TelegrafMock = vi.fn(() => ({
      start,
      command,
      launch,
      stop,
      telegram: { sendMessage },
    }));

    vi.doMock("telegraf", () => ({ Telegraf: TelegrafMock }));

    const mod = await import("./telegramOdersBot.js");
    mod.getBot();

    expect(start).toHaveBeenCalledTimes(1);
    const handler = start.mock.calls[0][0];

    const reply = vi.fn().mockResolvedValue(undefined);
    await handler({ reply });

    expect(reply).toHaveBeenCalledWith(
      "Бот активен. Добавьте меня в группу бара и выполните /chatid чтобы узнать chat id.",
    );
  });

  it("getBot: регистрирует команду chatid и она отвечает chat_id", async () => {
    process.env.TG_BOT_TOKEN = "token";

    const start = vi.fn();
    const command = vi.fn();
    const launch = vi.fn();
    const stop = vi.fn();
    const sendMessage = vi.fn();

    const TelegrafMock = vi.fn(() => ({
      start,
      command,
      launch,
      stop,
      telegram: { sendMessage },
    }));

    vi.doMock("telegraf", () => ({ Telegraf: TelegrafMock }));

    const mod = await import("./telegramOdersBot.js");
    mod.getBot();

    expect(command).toHaveBeenCalledTimes(1);
    const [cmdName, cmdHandler] = command.mock.calls[0];

    expect(cmdName).toBe("chatid");

    const reply = vi.fn().mockResolvedValue(undefined);
    await cmdHandler({ reply, chat: { id: 123 } });

    expect(reply).toHaveBeenCalledWith("chat_id: 123");
  });

  it("sendOrderToChat: вызывает telegram.sendMessage с нужными параметрами", async () => {
    process.env.TG_BOT_TOKEN = "token";

    const start = vi.fn();
    const command = vi.fn();
    const launch = vi.fn();
    const stop = vi.fn();
    const sendMessage = vi.fn().mockResolvedValue({ ok: true });

    const TelegrafMock = vi.fn(() => ({
      start,
      command,
      launch,
      stop,
      telegram: { sendMessage },
    }));

    vi.doMock("telegraf", () => ({ Telegraf: TelegrafMock }));

    const mod = await import("./telegramOdersBot.js");

    const res = await mod.sendOrderToChat({ chatId: 777, text: "hello" });

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith(777, "hello", {
      disable_web_page_preview: true,
    });
    expect(res).toEqual({ ok: true });
  });
});