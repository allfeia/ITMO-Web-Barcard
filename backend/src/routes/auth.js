import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, Bar, UserFavourite } from "../models.js";
import {authRequired, requireRole, signJwt} from "../middleware/auth.js";
import { Op } from "sequelize";

const router = Router();

function setAuthCookie(res, token) {
    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60,
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
    setAuthCookie(res, token);

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
    setAuthCookie(res, token);

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
    password: z.string().min(6),
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
      const { barId, barName, roles, name, login, email, password } =
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

      const hash = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_ROUNDS) || 12
      );
      const desiredRoles = Array.from(new Set(roles));

      const user = await User.create({
        email,
        login,
        name,
        roles: desiredRoles,
        password: hash,
        bar_id: bar.id
      });

      return res.status(201).json({
        ok: true,
        message: `B бар "${bar.name}" добавлен сотрудник`,
        user: {
          id: user.id,
          email: user.email,
          login: user.login,
          name: user.name,
          roles: user.roles,
          bar_id: user.bar_id
        }
      });
    } catch (e) {
      if (e.errors || e.issues)
        return  res.status(400).json({ error: 'Invalid payload' });
      console.log(req.body);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post("/logout", (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ ok: true });
});


export default router;
