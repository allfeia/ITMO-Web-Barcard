import { DataTypes, Model } from "sequelize";
import { sequelize } from "./db.js";

export class User extends Model {}
User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    roles: {
      type: DataTypes.JSONB("user", "staff", "bar_admin", "super_admin"),
      allowNull: false,
      defaultValue: [],
    },
    password: { type: DataTypes.STRING, allowNull: true },
    saved_cocktail_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "cocktails", key: "id" },
    },
    bar_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "bars",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    validate: {
      roleConstraints() {
        const set = new Set(this.roles || []);
        const has = (r) => set.has(r);

        if (has("staff") || has("bar_admin")) {
          if (!this.password || !this.bar_id) {
            throw new Error(
              "Для ролей staff/bar_admin обязательны пароль и ID бара.",
            );
          }
        }
        if (has("user")) {
          if (!this.password)
            throw new Error("Для роли user пароль обязателен.");
          if (this.bar_id)
            throw new Error("Для роли user не должен быть указан ID бара.");
        }
        if (has("super_admin") && this.bar_id) {
          throw new Error("Для super_admin не должен быть указан ID бара.");
        }
      },
    },
  },
);

export class Bar extends Model {}
Bar.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    pass_key: { type: DataTypes.STRING, allowNull: false },
    "web-site": { type: DataTypes.STRING, field: "web_site" },
  },
  { sequelize, modelName: "Bar", tableName: "bars", underscored: true },
);

export class Cocktail extends Model {}
Cocktail.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bar_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "bars", key: "id" },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    draw_file: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: "Cocktail",
    tableName: "cocktails",
    underscored: true,
  },
);

export class Ingredient extends Model {}
Ingredient.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: "Ingredient",
    tableName: "ingredients",
    underscored: true,
  },
);

export class CocktailRecipeStep extends Model {}
CocktailRecipeStep.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cocktail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cocktails", key: "id" },
    },
    step_number: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.TEXT, allowNull: false },

    ingredient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "ingredients", key: "id" },
    },
    ingredient_case: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: "CocktailRecipeStep",
    tableName: "cocktail_recipe_steps",
    underscored: true,
  },
);

export class CocktailIngredient extends Model {}
CocktailIngredient.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cocktail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cocktails", key: "id" },
    },
    ingredient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "ingredients", key: "id" },
    },
    recipe_step_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "cocktail_recipe_steps", key: "id" },
    },
    amount: { type: DataTypes.FLOAT, allowNull: true },
    unit: { type: DataTypes.STRING, allowNull: true },
    step_order: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: "CocktailIngredient",
    tableName: "cocktail_ingredients",
    underscored: true,
  },
);

export class CocktailRecipeStep extends Model {}
CocktailRecipeStep.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cocktail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cocktails", key: "id" },
    },
    step_number: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.TEXT, allowNull: false },
    ingredient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "ingredients", key: "id" },
    },
    amount: { type: DataTypes.FLOAT, allowNull: true },
    unit: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: "CocktailRecipeStep",
    tableName: "cocktail_recipe_steps",
    underscored: true,
  },
);

export class Point extends Model {}
Point.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    cocktail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cocktails", key: "id" },
    },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attempt_number: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: "Point",
    tableName: "points",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["cocktail_id"] },
      { fields: ["user_id", "cocktail_id", "created_at"] },
    ],
  },
);

export class UserFavourite extends Model {}
UserFavourite.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    cocktail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cocktails", key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "UserFavourite",
    tableName: "user_favourites",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["cocktail_id"] },
      { unique: true, fields: ["user_id", "cocktail_id"] },
    ],
  },
);

// Связи
Bar.hasMany(Cocktail, { foreignKey: "bar_id" });
Bar.hasMany(User, { foreignKey: "bar_id", as: "employees" });

User.belongsTo(Bar, { foreignKey: "bar_id", as: "workplace" });
Cocktail.belongsTo(Bar, { foreignKey: "bar_id" });

Cocktail.belongsToMany(Ingredient, {
  through: CocktailIngredient,
  foreignKey: "cocktail_id",
  otherKey: "ingredient_id",
});
Ingredient.belongsToMany(Cocktail, {
  through: CocktailIngredient,
  foreignKey: "ingredient_id",
  otherKey: "cocktail_id",
});

Cocktail.hasMany(CocktailRecipeStep, { foreignKey: "cocktail_id" });

CocktailRecipeStep.belongsTo(Ingredient, {
  foreignKey: "ingredient_id",
  as: "mainIngredient",});

CocktailRecipeStep.belongsTo(Cocktail, { foreignKey: "cocktail_id" });

CocktailRecipeStep.hasMany(CocktailIngredient, {
  foreignKey: "recipe_step_id",
  as: "stepIngredients",
});

Ingredient.hasMany(CocktailRecipeStep, {
  foreignKey: "ingredient_id",
  as: "stepsAsMainIngredient",
});

CocktailIngredient.belongsTo(CocktailRecipeStep, {
  foreignKey: "recipe_step_id",
  as: "step",
});

CocktailIngredient.belongsTo(Ingredient, {
  foreignKey: "ingredient_id",
});
Ingredient.hasMany(CocktailIngredient, {
  foreignKey: "ingredient_id",
});

User.belongsTo(Cocktail, {
  foreignKey: "saved_cocktail_id",
  as: "savedCocktail",
});

User.hasMany(Point, { foreignKey: "user_id", as: "userPoints" });
Point.belongsTo(User, { foreignKey: "user_id" });

Cocktail.hasMany(Point, { foreignKey: "cocktail_id", as: "cocktailPoints" });
Point.belongsTo(Cocktail, { foreignKey: "cocktail_id" });

User.belongsToMany(Cocktail, {
  through: UserFavourite,
  foreignKey: "user_id",
  otherKey: "cocktail_id",
  as: "favouriteCocktails",
});

Cocktail.belongsToMany(User, {
  through: UserFavourite,
  foreignKey: "cocktail_id",
  otherKey: "user_id",
  as: "usersWhoFavourited",
});
