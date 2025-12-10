import { beforeEach, describe, expect, it, vi } from "vitest";

describe("models.js", () => {
  beforeEach(() => {
    vi.resetModules();
    const defineSymbol = Symbol("define");
    const mockInit = vi.fn(function (_attrs, _options) {
      this[defineSymbol] = _options;
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
          return (...args) => ({ __type: String(prop), args });
        },
      },
    );

    const sequelize = { defineSymbol, mockInit };

    vi.doMock("../db.js", () => ({ sequelize }));
    vi.doMock("sequelize", () => ({
      DataTypes,
      Model: MockModel,
      Sequelize: vi.fn(),
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

    // связи вызывались (базовые)
    expect(Bar.hasMany).toHaveBeenCalled();
    expect(User.belongsTo).toHaveBeenCalled();
    expect(Cocktail.belongsToMany).toHaveBeenCalled();
    expect(Ingredient.belongsToMany).toHaveBeenCalled();
    expect(CocktailRecipeStep.belongsTo).toHaveBeenCalled();
    expect(Point.belongsTo).toHaveBeenCalled();

    // доп. проверки для новых связей

    // User.belongsTo(Cocktail, { as: "savedCocktail" })
    expect(User.belongsTo).toHaveBeenCalledWith(
      Cocktail,
      expect.objectContaining({
        foreignKey: "saved_cocktail_id",
        as: "savedCocktail",
      }),
    );

    // User.hasMany(Point, { as: "userPoints" })
    expect(User.hasMany).toHaveBeenCalledWith(
      Point,
      expect.objectContaining({
        foreignKey: "user_id",
        as: "userPoints",
      }),
    );

    // Cocktail.hasMany(Point, { as: "cocktailPoints" })
    expect(Cocktail.hasMany).toHaveBeenCalledWith(
      Point,
      expect.objectContaining({
        foreignKey: "cocktail_id",
        as: "cocktailPoints",
      }),
    );

    // User.belongsToMany(Cocktail, { through: UserFavourite, as: "favouriteCocktails" })
    expect(User.belongsToMany).toHaveBeenCalledWith(
      Cocktail,
      expect.objectContaining({
        through: UserFavourite,
        foreignKey: "user_id",
        otherKey: "cocktail_id",
        as: "favouriteCocktails",
      }),
    );

    // Cocktail.belongsToMany(User, { through: UserFavourite, as: "usersWhoFavourited" })
    expect(Cocktail.belongsToMany).toHaveBeenCalledWith(
      User,
      expect.objectContaining({
        through: UserFavourite,
        foreignKey: "cocktail_id",
        otherKey: "user_id",
        as: "usersWhoFavourited",
      }),
    );
  });

  it("валидатор User.roleConstraints — staff/bar_admin требуют пароль и bar_id", async () => {
    const { User } = await import("../src/models.js");
    const validate = User[Object.getOwnPropertySymbols(User)[0]].validate;

    const make = (roles, extras = {}) => ({
      roles,
      password: extras.password ?? null,
      bar_id: extras.bar_id ?? null,
    });

    // staff без пароля и bar_id — ошибка
    expect(() => validate.roleConstraints.call(make(["staff"]))).toThrow(
      /парол/i,
    );

    // bar_admin с паролем, но без bar_id — ошибка
    expect(() =>
      validate.roleConstraints.call(make(["bar_admin"], { password: "x" })),
    ).toThrow(/ID бара/i);

    // staff с обоими — ок
    expect(() =>
      validate.roleConstraints.call(
        make(["staff"], { password: "x", bar_id: 1 }),
      ),
    ).not.toThrow();
  });

  it("валидатор User.roleConstraints — user требует пароль и запрещает bar_id", async () => {
    const { User } = await import("../src/models.js");
    const validate = User[Object.getOwnPropertySymbols(User)[0]].validate;

    // user без пароля — ошибка
    expect(() =>
      validate.roleConstraints.call({
        roles: ["user"],
        password: null,
        bar_id: null,
      }),
    ).toThrow(/парол/i);

    // user с bar_id — ошибка
    expect(() =>
      validate.roleConstraints.call({
        roles: ["user"],
        password: "x",
        bar_id: 1,
      }),
    ).toThrow(/ID бара/i);

    // корректный вариант
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
    const validate = User[Object.getOwnPropertySymbols(User)[0]].validate;

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
