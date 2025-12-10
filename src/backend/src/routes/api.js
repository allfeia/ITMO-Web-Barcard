import { Router } from "express";
import { z } from "zod";
import { authRequired, requireRole } from "../middleware/auth.js";
import {
  Bar,
  User,
  Point,
  Cocktail,
  Ingredient,
  CocktailIngredient,
  CocktailRecipeStep,
  UserFavourite,
} from "../models.js";
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

router.get("/cocktail", async (req, res) => {
  try {
    const barId = Number(req.query.barId);

    if (!Number.isFinite(barId) || barId <= 0) {
      return res.status(400).json({ error: "Invalid barId" });
    }

    const cocktails = await Cocktail.findAll({
      where: { bar_id: barId },
      attributes: ["id", "name", "description", "image"],
      order: [["name", "ASC"]],
    });
    return res.json(cocktails);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/cocktail/:id/recipe", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid cocktail id" });
    }

    const cocktail = await Cocktail.findByPk(id, {
      include: [
        {
          model: Ingredient,
          through: {
            model: CocktailIngredient,
            attributes: ["amount", "unit", "step_order"],
          },
          attributes: ["id", "name", "type"],
        },
        {
          model: CocktailRecipeStep,
          attributes: [
            "id",
            "step_number",
            "action",
            "ingredient_id",
            "amount",
            "unit",
            "ingredient_case",
          ],
        },
      ],
      order: [
        [CocktailRecipeStep, "step_number", "ASC"],
        [Ingredient, CocktailIngredient, "step_order", "ASC"],
      ],
    });

    if (!cocktail) return res.status(404).json({ error: "Not found" });

    const allIngredients = cocktail.Ingredients.map((ing) => {
      const ci = ing.CocktailIngredient;
      let amountStr = "";
      if (ci?.amount != null && ci?.amount !== "") {
        amountStr = String(ci.amount);
        if (ci.unit) {
          amountStr += ` ${ci.unit}`;
        }
      }

      return {
        id: ing.id,
        name: ing.name,
        type: ing.type,
        amount: ci?.amount ?? null,
        unit: ci?.unit ?? null,
        order: ci?.step_order ?? null,
        amountStr,
      };
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const mainIngredients = allIngredients.filter(
      (ing) => ing.type !== "garnish",
    );
    const garnishIngredients = allIngredients.filter(
      (ing) => ing.type === "garnish",
    );

    let decoration = "";
    if (garnishIngredients.length > 0) {
      decoration = garnishIngredients
        .map((ing) =>
          ing.amountStr ? `${ing.name} (${ing.amountStr})` : ing.name,
        )
        .join(", ");
    }

    const steps = cocktail.CocktailRecipeSteps.slice()
      .sort((a, b) => a.step_number - b.step_number)
      .map((s) => ({
        id: s.id,
        step_number: s.step_number,
        action: s.action,
        ingredient_id: s.ingredient_id,
        amount: s.amount,
        unit: s.unit,
        ingredient_case: s.ingredient_case,
      }));

    res.json({
      id: cocktail.id,
      name: cocktail.name,
      description: cocktail.description,
      image: cocktail.image,
      ingredients: mainIngredients,
      decoration,
      steps,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

const favouritesRequestSchema = z.object({
  savedCocktailsId: z.array(z.number().int().positive()),
});

router.post("/favourites", authRequired, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { savedCocktailsId } = favouritesRequestSchema.parse(req.body);
    const cocktails = await Cocktail.findAll({
      where: {
        id: { [Op.in]: savedCocktailsId },
      },
      attributes: ["id", "name", "description", "image", "bar_id"],
      order: [["name", "ASC"]],
    });

    return res.json(cocktails);
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: e.errors });
    }
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/favourites/add/:cocktailId", authRequired, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cocktailId = Number(req.params.cocktailId);
    if (!Number.isFinite(cocktailId) || cocktailId <= 0) {
      return res.status(400).json({ error: "Invalid cocktail id" });
    }

    const cocktail = await Cocktail.findByPk(cocktailId);
    if (!cocktail) {
      return res.status(404).json({ error: "Cocktail not found" });
    }

    const [created] = await UserFavourite.findOrCreate({
      where: { user_id: userId, cocktail_id: cocktailId },
      defaults: { user_id: userId, cocktail_id: cocktailId },
    });

    return res.json({
      ok: true,
      cocktailId: cocktailId,
      created,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete(
  "/favourites/remove/:cocktailId",
  authRequired,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const cocktailId = Number(req.params.cocktailId);
      if (!Number.isFinite(cocktailId) || cocktailId <= 0) {
        return res.status(400).json({ error: "Invalid cocktail id" });
      }

      const deleted = await UserFavourite.destroy({
        where: { user_id: userId, cocktail_id: cocktailId },
      });

      return res.json({
        ok: true,
        cocktailId,
        deleted: deleted > 0,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
