import crypto from "crypto";
import { PasswordToken } from "../src/models.js";

export function makeRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function getExpiryDate() {
  const ttlMin = Number(process.env.PASSWORD_TOKEN_TTL_MIN) || 15;
  return new Date(Date.now() + ttlMin * 60 * 1000);
}

export function verifyToken(raw, tokenHash) {
  return sha256(raw) === tokenHash;
}

export function generateOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
  }

export async function createPasswordToken({ userId, purpose }) {
  const raw = makeRawToken();
  const token_hash = sha256(raw);
  const expires_at = getExpiryDate();

  const row = await PasswordToken.create({
    user_id: userId,
    token_hash,
    purpose,
    expires_at,
  });

  return { raw, row };
}