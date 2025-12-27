import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, Bar, UserFavourite, PasswordToken} from "../models.js";
import {authRequired, requireRole, signJwt, signRefreshToken, inviteSessionRequired, signInviteSession} from "../middleware/auth.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { sendMail } from "../../utils/mailer.js";
import { createPasswordToken, sha256, generateOtp6} from "../../utils/passwordTokens.js";

const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_dev";

const router = Router();

function setAuthCookie(res, token, refreshToken) {
    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });
}

function setInviteCookie(res, inviteSessionJwt) {
  res.cookie("invite_session", inviteSessionJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, 
    path: "/",
  });
}

function clearInviteCookie(res) {
  res.clearCookie("invite_session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

const superLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/super/login", async (req, res) => {
  try {
    const { username, password } = superLoginSchema.parse(req.body);
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: username }, { login: username }, { name: username }],
      },
    });
    if (
        !user ||
        !user.password ||
        !user.roles?.includes("super_admin") ||
        !(await bcrypt.compare(password, user.password))
    ) {
        return res.status(404).json({ error: "Неверные учетные данные" });
    }

    const token = signJwt(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookie(res, token, refreshToken);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        name: user.name,
        roles: user.roles,
        bar_id: user.bar_id ?? null,
      },
    });
  } catch (e) {
    if (e.errors || e.issues)
      return res.status(400).json({ error: "Invalid payload" });
    return res.status(500).json({ error: "Server error" });
  }
});

const barmanAuthSchema = z.object({
  barId: z.number().int().positive(),
  username: z.string().min(1),
  password: z.string().min(1),
  barKey: z.string().min(1),
});

router.post("/barman/auth", async (req, res) => {
  try {
    const { barId, username, password, barKey } = barmanAuthSchema.parse(
      req.body,
    );

    const bar = await Bar.findByPk(barId);
    if (!bar) return res.status(404).json({ error: "Бар не найден" });


    if (!(await bcrypt.compare(barKey, bar.pass_key))) {
        return res.status(403).json({ error: "Неверные учетные данные" });
    }

    const user = await User.findOne({
      where: {
        bar_id: bar.id,
        [Op.or]: [{ email: username }, { login: username }, { name: username }],
      },
    });

    if (
        !user ||
        !user.password ||
        !["staff", "bar_admin"].some(r => user.roles?.includes(r)) ||
        !(await bcrypt.compare(password, user.password))
    ) {
        return res.status(403).json({ error: "Неверные учетные данные" });
    }

    const token = signJwt(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookie(res, token, refreshToken);

    const favourites = await UserFavourite.findAll({
      where: { user_id: user.id },
      attributes: ["cocktail_id"],
    });

    const savedCocktailsId = favourites.map((f) => f.cocktail_id);

    return res.json({
      ok: true,
      mode: "login",
      message: "Успешный вход",
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        name: user.name,
        roles: user.roles,
        bar_id: user.bar_id,
      },
      barName: bar.name,
      barSite: bar["web-site"] ?? null,
      saved_cocktails_id: savedCocktailsId,
    });
  } catch (e) {
    if (e.errors || e.issues)
      return res.status(400).json({ error: "Invalid payload" });
    return res.status(500).json({ error: "Server error" });
  }
});

const grantBarAdminSchema = z.object({
  userId: z.number().int().positive(),
  makeBarAdmin: z.boolean(),
});

router.post(
  "/super/grant-bar-admin",
  authRequired,
  requireRole("super_admin"),
  async (req, res) => {
    try {
      const { userId, makeBarAdmin } = grantBarAdminSchema.parse(req.body);
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ error: "Сотрудник не найден" });

      const roles = new Set(user.roles || []);
      if (makeBarAdmin) {
        if (!user.bar_id)
          return res
            .status(400)
            .json({ error: "Сотрудник должен работать в баре" });
        roles.add("bar_admin");
        roles.add("staff");
      } else {
        roles.delete("bar_admin");
        if (!roles.size) roles.add("user");
      }
      user.roles = Array.from(roles);
      await user.save();

      return res.json({
        ok: true,
        user: { id: user.id, roles: user.roles, bar_id: user.bar_id },
      });
    } catch (e) {
      if (e.errors || e.issues)
        return res.status(400).json({ error: "Invalid payload" });
      return res.status(500).json({ error: "Server error" });
    }
  },
);

const superRegisterInBarSchema = z
  .object({
    barId: z.number().int().positive().optional(),
    barName: z.string().min(1).optional(),
    roles: z
      .array(z.enum(["staff", "bar_admin"]))
      .nonempty()
      .refine((arr) => {
        const set = new Set(arr);
        return (
          (set.size === 1 && (set.has("staff") || set.has("bar_admin"))) ||
          (set.size === 2 && set.has("staff") && set.has("bar_admin"))
        );
      }, "Недопустимый набор ролей"),
    name: z.string().min(1),
    login: z.string().min(1),
    email: z.string().email(),
  })
  .refine((v) => Boolean(v.barId) || Boolean(v.barName), {
    message: "Нужно указать barId или barName",
    path: ["barId"],
  });

router.post(
  '/super/users/register-in-bar',
  authRequired,
  requireRole('super_admin', 'bar_admin'),
  async (req, res) => {
    try {
      const { barId, barName, roles, name, login, email} =
        superRegisterInBarSchema.parse(req.body);

      let bar = null;
      if (typeof barId === 'number') {
        bar = await Bar.findByPk(barId);
      } else if (typeof barName === 'string' && barName.trim()) {
        bar = await Bar.findOne({ where: { name: barName.trim() } });
      }
      if (!bar) return res.status(404).json({ error: 'Бар не найден' });

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { login }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          ok: false,
          error: 'Сотрудник с таким логином или e‑mail уже существует'
        });
      }
      const desiredRoles = Array.from(new Set(roles));

      const user = await User.create({
  email,
  login,
  name,
  roles: desiredRoles,
  password: null,
  bar_id: bar.id
});

const { raw } = await createPasswordToken({ userId: user.id, purpose: "invite" });
const ttlMin = Number(process.env.PASSWORD_TOKEN_TTL_MIN) || 15;
const link = `${process.env.APP_PUBLIC_URL}/password#token=${encodeURIComponent(raw)}&mode=invite`;

await sendMail({
  to: user.email,
  subject: `Вас пригласили в бар "${bar.name}"`,
  text: `Вас пригласили в бар "${bar.name}".\nЗадайте пароль: ${link}\nСсылка доступна ${ttlMin} минут.`,
});

return res.status(201).json({
  ok: true,
  message: `Приглашение отправлено на ${user.email}`,
  user: { id: user.id, email: user.email, login: user.login, name: user.name, roles: user.roles, bar_id: user.bar_id }
});
    } catch (e) {
      if (e.errors || e.issues)
        return res.status(400).json({ error: 'Invalid payload' });
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post("/password/invite/session", async (req, res) => {
  try {
    const schema = z.object({ token: z.string().min(1) });
    const { token } = schema.parse(req.body);

    const row = await PasswordToken.findOne({
      where: { token_hash: sha256(token), purpose: "invite" },
      attributes: ["id", "user_id", "expires_at", "used_at"],
    });

    if (!row) return res.status(400).json({ ok: false, error: "Ссылка недействительна" });
    if (row.used_at) return res.status(400).json({ ok: false, error: "Ссылка уже была использована" });
    if (new Date(row.expires_at).getTime() < Date.now())
      return res.status(400).json({ ok: false, error: "Срок действия ссылки истек" });

    const inviteJwt = signInviteSession({
      userId: row.user_id,
      passwordTokenId: row.id,
    });

    setInviteCookie(res, inviteJwt);
    return res.json({ ok: true });
  } catch (e) {
    if (e?.errors || e?.issues) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    return res.status(500).json({ error: "Server error" });
  }
});


router.post("/password/request-reset", authRequired, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  const code = generateOtp6();
  const ttlMin = Number(process.env.PASSWORD_TOKEN_TTL_MIN) || 15;

  await PasswordToken.create({
    user_id: user.id,
    token_hash: sha256(code),
    purpose: "reset",
    expires_at: new Date(Date.now() + ttlMin * 60 * 1000),
    used_at: null,
  });

  await sendMail({
    to: user.email,
    subject: "Код для смены пароля",
    text:
      `Вы запросили смену пароля.\n` +
      `Код: ${code}\n` +
      `Код действует ${ttlMin} минут.`,
  });

  return res.json({ ok: true, message: "Код отправлен" });
});

const confirmInviteSchema = z.object({
  password: z.string().min(8),
});

router.post("/password/confirm", inviteSessionRequired, async (req, res) => {
  const { password } = confirmInviteSchema.parse(req.body);

  const { userId, passwordTokenId } = req.invite;

  const row = await PasswordToken.findOne({
    where: {
      id: passwordTokenId,
      user_id: userId,
      purpose: "invite",
    },
  });

  if (!row) return res.status(400).json({ error: "Ссылка недействительна или просрочена" });
  if (row.used_at) return res.status(400).json({ error: "Ссылка уже использована, повторное использование не предусмотрено" });
  if (new Date(row.expires_at).getTime() < Date.now())
    return res.status(400).json({ error: "Срок действия ссылки истек" });

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
  user.password = hash;
  await user.save();

  const now = new Date();

  row.used_at = now;
  await row.save();

  await PasswordToken.update(
    { used_at: now },
    {
      where: {
        user_id: user.id,
        purpose: "invite",
        used_at: null,
      },
    },
  );

  clearInviteCookie(res);

  return res.json({ ok: true, purpose: "invite", barId: user.bar_id, roles: user.roles });
});

const confirmCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8),
});

router.post("/password/confirm-code", authRequired, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { code, password } = confirmCodeSchema.parse(req.body);

    const tokenHash = sha256(code);
    const row = await PasswordToken.findOne({
      where: {
        token_hash: tokenHash,
        user_id: userId,
        purpose: "reset",
      },
    });

    if (!row) return res.status(400).json({ error: "Код недействителен или истёк" });
    if (row.used_at) return res.status(400).json({ error: "Код уже использован" });
    if (new Date(row.expires_at).getTime() < Date.now())
      return res.status(400).json({ error: "Срок действия кода истёк" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
    user.password = hash;
    await user.save();

    row.used_at = new Date();
    await row.save();

    return res.json({ ok: true, purpose: "reset" });
  } catch (e) {
    if (e?.errors || e?.issues) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/password/request-invite-again", inviteSessionRequired, async (req, res) => {
  const { userId } = req.invite;

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  const bar = user.bar_id ? await Bar.findByPk(user.bar_id) : null;
  if (!bar) return res.status(404).json({ error: "Бар не найден" });

  const now = new Date();

  await PasswordToken.update(
    { used_at: now },
    { where: { user_id: user.id, purpose: "invite", used_at: null } }
  );

  clearInviteCookie(res);

  const { raw } = await createPasswordToken({ userId: user.id, purpose: "invite" });
  const ttlMin = Number(process.env.PASSWORD_TOKEN_TTL_MIN) || 15;
  const link = `${process.env.APP_PUBLIC_URL}/password#token=${encodeURIComponent(raw)}&mode=invite`;

  await sendMail({
    to: user.email,
    subject: `Вас пригласили в бар "${bar.name}"`,
    text: `Вас пригласили в бар "${bar.name}".\nЗадайте пароль: ${link}\nСсылка доступна ${ttlMin} минут.`,
  });

  return res.json({ ok: true, message: "Приглашение отправлено повторно" });
});

router.post('/refresh-token', (req, res) => {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const newAccessToken = signJwt({
            id: payload.id,
            roles: payload.roles,
            bar_id: payload.bar_id,
        });

        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.json({ ok: true });
    } catch {
        return res.status(401).json({ error: "Invalid refresh token" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ ok: true });
});


export default router;