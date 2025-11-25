import { Router } from "express";
import { z } from "zod";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Bar, User, Point } from "../models.js";
import { Op, fn, col } from "sequelize";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));

router.get("/me", authRequired, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "login", "name", "roles", "bar_id"],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const sumRow = await Point.findOne({
      where: { user_id: userId },
      attributes: [
        [fn("COALESCE", fn("SUM", col("points")), 0), "total_points"],
      ],
    });

    const totalPoints = Number(sumRow?.get("total_points") ?? 0);

    return res.json({
      id: user.id,
      email: user.email,
      login: user.login,
      name: user.name,
      roles: user.roles,
      bar_id: user.bar_id,
      points: totalPoints,
    });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get(
  "/admin/bars",
  authRequired,
  requireRole("super_admin"),
  async (req, res) => {
    const bars = await Bar.findAll({ order: [["name", "ASC"]] });
    res.json(bars.map((b) => ({ id: b.id, name: b.name })));
  },
);

router.get(
  "/bars",
  authRequired,
  requireRole("super_admin"),
  async (req, res) => {
    const query = (req.query.query || "").toString().trim();
    if (!query) return res.json([]);
    const items = await Bar.findAll({
      where: { name: { [Op.iLike]: `%${query}%` } },
      order: [["name", "ASC"]],
      limit: 20,
    });
    res.json(items.map((b) => ({ id: b.id, name: b.name })));
  },
);

const adminBarSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  barKey: z.string().min(1),
});

router.post(
  "/admin/bars",
  authRequired,
  requireRole("super_admin"),
  async (req, res) => {
    try {
      const { name, address, description, website, barKey } =
        adminBarSchema.parse(req.body);

      const pass_key = await bcrypt.hash(barKey, 10);

      const bar = await Bar.create({
        name,
        address,
        description,
        pass_key,
        "web-site": website,
      });

      res.status(201).json({
        message: "Бар создан",
        id: bar.id,
        name: bar.name,
      });
    } catch {
      res.status(400).json({ error: "Invalid payload" });
    }
  },
);

// сотрудники выбранного бара
router.get(
  "/admin/bars/:barId/staff",
  authRequired,
  requireRole("super_admin"),
  async (req, res) => {
    const barId = Number(req.params.barId);
    if (!Number.isFinite(barId) || barId <= 0) {
      return res.status(400).json({ error: "Invalid bar id" });
    }
    const bar = await Bar.findByPk(barId);
    if (!bar) return res.status(404).json({ error: "Бар не найден" });

    const users = await User.findAll({
      where: { bar_id: barId },
      order: [["name", "ASC"]],
    });
    return res.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        login: u.login,
        name: u.name,
        roles: u.roles,
        bar_id: u.bar_id,
      })),
    );
  },
);

export default router;
