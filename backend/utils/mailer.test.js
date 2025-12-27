import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("nodemailer", () => {
  return {
    default: {
      createTransport: vi.fn(),
    },
  };
});

describe("mailer", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("makeTransport возвращает null если не хватает env", async () => {
    const { makeTransport } = await import("./mailer.js");
    expect(makeTransport()).toBeNull();

    process.env.SMTP_HOST = "smtp.example.com";
    const mod2 = await import("./mailer.js");
    expect(mod2.makeTransport()).toBeNull();

    process.env.SMTP_USER = "user";
    const mod3 = await import("./mailer.js");
    expect(mod3.makeTransport()).toBeNull();

    process.env.SMTP_PASS = "pass";
    const mod4 = await import("./mailer.js");
    expect(mod4.makeTransport()).not.toBeNull();
  });

  it("makeTransport создает transport с ожидаемыми параметрами", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "2525";
    process.env.SMTP_USER = "u";
    process.env.SMTP_PASS = "p";

    const nodemailer = (await import("nodemailer")).default;
    nodemailer.createTransport.mockReturnValue({});

    const { makeTransport } = await import("./mailer.js");
    makeTransport();

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 2525,
      secure: false,
      auth: { user: "u", pass: "p" },
      requireTLS: true,
    });
  });

  it("sendMail логирует и возвращает mocked:true если transport отсутствует", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { sendMail } = await import("./mailer.js");

    const res = await sendMail({
      to: "a@b.c",
      subject: "Subj",
      text: "Hello",
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith("[MAILER MOCK]", {
      to: "a@b.c",
      subject: "Subj",
      text: "Hello",
    });
    expect(res).toEqual({ mocked: true });
  });

  it("sendMail вызывает transport.sendMail с from=SMTP_FROM если задан", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "pass";
    process.env.SMTP_FROM = "noreply@example.com";

    const nodemailer = (await import("nodemailer")).default;
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "id1" });
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    const { sendMail } = await import("./mailer.js");
    const res = await sendMail({ to: "t@e.st", subject: "S", text: "T" });

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: "noreply@example.com",
      to: "t@e.st",
      subject: "S",
      text: "T",
    });
    expect(res).toEqual({ messageId: "id1" });
  });

  it("sendMail вызывает transport.sendMail с from=SMTP_USER если SMTP_FROM не задан", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "pass";
    delete process.env.SMTP_FROM;

    const nodemailer = (await import("nodemailer")).default;
    const sendMailMock = vi.fn().mockResolvedValue({ ok: true });
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    const { sendMail } = await import("./mailer.js");
    const res = await sendMail({ to: "t@e.st", subject: "S2", text: "T2" });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: "user@example.com",
      to: "t@e.st",
      subject: "S2",
      text: "T2",
    });
    expect(res).toEqual({ ok: true });
  });
});