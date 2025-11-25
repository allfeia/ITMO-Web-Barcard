import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, Bar } from "../models.js";
import { signJwt, authRequired, requireRole } from "../middleware/auth.js";
import { Op } from "sequelize";

const router = Router();

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
    if (!user) return res.status(404).json({ error: "Not found" });

    const roles = new Set(user.roles || []);
    if (!roles.has("super_admin"))
      return res.status(403).json({ error: "Forbidden" });

    if (!user.password)
      return res.status(403).json({ error: "No password set" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(403).json({ error: "Invalid password" });

    const token = signJwt({
      id: user.id,
      login: user.login,
      email: user.email,
      name: user.name,
      roles: Array.from(roles),
      bar_id: user.bar_id ?? null,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        name: user.name,
        roles: Array.from(roles),
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

    const okKey = await bcrypt.compare(barKey, bar.pass_key);
    if (!okKey) {
      return res.status(403).json({ error: "Неверный ключ бара" });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: username }, { login: username }, { name: username }],
      },
    });

    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    const roles = new Set(user.roles || []);
    if (!roles.has("staff") && !roles.has("bar_admin"))
      return res.status(403).json({ error: "Пользователь не сотрудник бара" });
    if (user.bar_id !== bar.id)
      return res
        .status(403)
        .json({ error: "Пользователь привязан к другому бару" });

    if (!user.password)
      return res.status(403).json({ error: "Пароль не установлен" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(403).json({ error: "Неверный пароль" });

    const token = signJwt({
      id: user.id,
      login: user.login,
      email: user.email,
      name: user.name,
      roles: Array.from(roles),
      bar_id: user.bar_id,
    });
    return res.json({
      ok: true,
      mode: "login",
      message: "Успешный вход",
      token,
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        name: user.name,
        roles: Array.from(roles),
        bar_id: user.bar_id,
      },
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
    password: z.string().min(6),
  })
  .refine((v) => Boolean(v.barId) || Boolean(v.barName), {
    message: "Нужно указать barId или barName",
    path: ["barId"],
  });

router.post(
  "/super/users/register-in-bar",
  authRequired,
  requireRole("super_admin", "bar_admin"),
  async (req, res) => {
    try {
      const { barId, barName, roles, name, login, email, password } =
        superRegisterInBarSchema.parse(req.body);

      let bar = null;
      if (typeof barId === "number") {
        bar = await Bar.findByPk(barId);
      } else if (typeof barName === "string" && barName.trim()) {
        bar = await Bar.findOne({ where: { name: barName.trim() } });
      }
      if (!bar) return res.status(404).json({ error: "Бар не найден" });

      let user = await User.findOne({
        where: { [Op.or]: [{ email }, { login }] },
      });
      const hash = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_ROUNDS) || 12,
      );

      const desiredRoles = Array.from(new Set(roles));

      if (!user) {
        user = await User.create({
          email,
          login,
          name,
          roles: desiredRoles,
          password: hash,
          bar_id: bar.id,
        });
      } else {
        user.email = email;
        user.login = login;
        user.name = name;
        user.bar_id = bar.id;
        if (password) user.password = hash;
        user.roles = desiredRoles;
        await user.save();
      }

      return res.status(201).json({
        ok: true,
        message: `B бар "${bar.name}" добавлен сотрудник`,
        user: {
          id: user.id,
          email: user.email,
          login: user.login,
          name: user.name,
          roles: user.roles,
          bar_id: user.bar_id,
        },
      });
    } catch (e) {
      if (e.errors || e.issues)
        return res.status(400).json({ error: "Invalid payload" });
      return res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
