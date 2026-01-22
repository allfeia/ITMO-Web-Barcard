import { beforeEach, describe, expect, it, vi } from "vitest";

describe("models.js", () => {
  beforeEach(() => {
    vi.resetModules();
    const defineSymbol = Symbol("define");

    const mockInit = vi.fn(function (_attrs, options) {
      this[OPTS] = options;
      return this;
    });

    class MockModel {
      static init = mockInit;
      static belongsTo = vi.fn();
      static hasMany = vi.fn();
      static belongsToMany = vi.fn();
    }

    const DataTypes = new Proxy(
      {},
      {
        get(_t, prop) {
          if (prop === "JSONB") return (...args) => ({ __type: "JSONB", args });
          if (prop === "ENUM") return (...args) => ({ __type: "ENUM", args });
          return { __type: String(prop) };
        },
      },
    );

    const sequelize = {};

    vi.doMock("../src/db.js", () => ({ sequelize }));
    vi.doMock("sequelize", () => ({
      DataTypes,
      Model: MockModel,
    }));
  });

  it("инициализирует модели и связи без ошибок", async () => {
    const mod = await import("../src/models.js");

    const {
      User,
      Bar,
      Cocktail,
      Ingredient,
      CocktailIngredient,
      CocktailRecipeStep,
      Point,
      UserFavourite,
      PasswordToken,
    } = mod;

    // сущности объявлены
    expect(User).toBeDefined();
    expect(Bar).toBeDefined();
    expect(Cocktail).toBeDefined();
    expect(Ingredient).toBeDefined();
    expect(CocktailIngredient).toBeDefined();
    expect(CocktailRecipeStep).toBeDefined();
    expect(Point).toBeDefined();
    expect(UserFavourite).toBeDefined();
    expect(PasswordToken).toBeDefined();

    // связи вызывались (базовые)
    expect(Bar.hasMany).toHaveBeenCalled();
    expect(User.belongsTo).toHaveBeenCalled();
    expect(User.hasMany).toHaveBeenCalled();
    expect(Cocktail.belongsTo).toHaveBeenCalled();
    expect(Cocktail.hasMany).toHaveBeenCalled();
    expect(Cocktail.belongsToMany).toHaveBeenCalled();
    expect(Ingredient.belongsToMany).toHaveBeenCalled();
    expect(CocktailRecipeStep.belongsTo).toHaveBeenCalled();
    expect(CocktailRecipeStep.hasMany).toHaveBeenCalled();
    expect(CocktailIngredient.belongsTo).toHaveBeenCalled();
    expect(Ingredient.hasMany).toHaveBeenCalled();
    expect(Point.belongsTo).toHaveBeenCalled();
    expect(PasswordToken.belongsTo).toHaveBeenCalled();
    expect(PasswordToken.init).toHaveBeenCalled();

    expect(User.belongsTo).toHaveBeenCalledWith(
      Cocktail,
      expect.objectContaining({
        foreignKey: "saved_cocktail_id",
        as: "savedCocktail",
      }),
    );

    expect(User.hasMany).toHaveBeenCalledWith(
      Point,
      expect.objectContaining({
        foreignKey: "user_id",
        as: "userPoints",
      }),
    );

    expect(Cocktail.hasMany).toHaveBeenCalledWith(
      Point,
      expect.objectContaining({
        foreignKey: "cocktail_id",
        as: "cocktailPoints",
      }),
    );

    expect(User.belongsToMany).toHaveBeenCalledWith(
      Cocktail,
      expect.objectContaining({
        through: UserFavourite,
        foreignKey: "user_id",
        otherKey: "cocktail_id",
        as: "favouriteCocktails",
      }),
    );

    expect(Cocktail.belongsToMany).toHaveBeenCalledWith(
      User,
      expect.objectContaining({
        through: UserFavourite,
        foreignKey: "cocktail_id",
        otherKey: "user_id",
        as: "usersWhoFavourited",
      }),
    );

    expect(User.hasMany).toHaveBeenCalledWith(
      PasswordToken,
      expect.objectContaining({
        foreignKey: "user_id",
        as: "passwordTokens",
      }),
    );

    expect(PasswordToken.belongsTo).toHaveBeenCalledWith(
      User,
      expect.objectContaining({
        foreignKey: "user_id",
      }),
    );

    expect(CocktailRecipeStep.belongsTo).toHaveBeenCalledWith(
      Ingredient,
      expect.objectContaining({
        foreignKey: "ingredient_id",
        as: "mainIngredient",
      }),
    );

    expect(CocktailRecipeStep.hasMany).toHaveBeenCalledWith(
      CocktailIngredient,
      expect.objectContaining({
        foreignKey: "recipe_step_id",
        as: "stepIngredients",
      }),
    );

    expect(CocktailIngredient.belongsTo).toHaveBeenCalledWith(
      CocktailRecipeStep,
      expect.objectContaining({
        foreignKey: "recipe_step_id",
        as: "step",
      }),
    );

    expect(Ingredient.hasMany).toHaveBeenCalledWith(
      CocktailRecipeStep,
      expect.objectContaining({
        foreignKey: "ingredient_id",
        as: "stepsAsMainIngredient",
      }),
    );

    expect(User.belongsTo).toHaveBeenCalledWith(
      Bar,
      expect.objectContaining({
        foreignKey: "bar_id",
        as: "workplace",
      }),
    );

    expect(Bar.hasMany).toHaveBeenCalledWith(
      User,
      expect.objectContaining({
        foreignKey: "bar_id",
        as: "employees",
      }),
    );
  });

  it("валидатор User.roleConstraints — staff/bar_admin требуют bar_id (пароль НЕ обязателен)", async () => {
    const { User } = await import("../src/models.js");

    const options = User[OPTS];
    expect(options).toBeDefined();
    expect(options.validate).toBeDefined();
    const validate = options.validate;

    const make = (roles, extras = {}) => ({
      roles,
      password: extras.password ?? null,
      bar_id: extras.bar_id ?? null,
    });

    expect(() => validate.roleConstraints.call(make(["staff"]))).toThrow(/ID бара/i);

    expect(() =>
      validate.roleConstraints.call(make(["bar_admin"], { password: "x" })),
    ).toThrow(/ID бара/i);

    expect(() =>
      validate.roleConstraints.call(make(["staff"], { bar_id: 1 })),
    ).not.toThrow();

    expect(() =>
      validate.roleConstraints.call(make(["bar_admin"], { bar_id: 2 })),
    ).not.toThrow();
  });

  it("валидатор User.roleConstraints — user требует пароль и запрещает bar_id", async () => {
    const { User } = await import("../src/models.js");

    const validate = User[OPTS].validate;

    expect(() =>
      validate.roleConstraints.call({
        roles: ["user"],
        password: null,
        bar_id: null,
      }),
    ).toThrow(/парол/i);

    expect(() =>
      validate.roleConstraints.call({
        roles: ["user"],
        password: "x",
        bar_id: 1,
      }),
    ).toThrow(/ID бара/i);

    expect(() =>
      validate.roleConstraints.call({
        roles: ["user"],
        password: "x",
        bar_id: null,
      }),
    ).not.toThrow();
  });

  it("валидатор User.roleConstraints — super_admin запрещает bar_id", async () => {
    const { User } = await import("../src/models.js");

    const validate = User[OPTS].validate;

    expect(() =>
      validate.roleConstraints.call({
        roles: ["super_admin"],
        password: "x",
        bar_id: 2,
      }),
    ).toThrow(/super_admin/i);

    expect(() =>
      validate.roleConstraints.call({
        roles: ["super_admin"],
        password: "x",
        bar_id: null,
      }),
    ).not.toThrow();
  });
});