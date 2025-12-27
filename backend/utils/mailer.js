import nodemailer from "nodemailer";

export function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
  host,
  port,
  secure: false,       
  auth: { user, pass },
  requireTLS: true,    
});
}

export async function sendMail({ to, subject, text }) {
  const transport = makeTransport();
  if (!transport) {
    console.log("[MAILER MOCK]", { to, subject, text });
    return { mocked: true };
  }

  return transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}