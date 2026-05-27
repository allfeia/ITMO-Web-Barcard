export function filterCocktails(cocktails, preferences = {}) {
  const {
    alcoholPreference = "any",
    allergies = [],
  } = preferences;

  let filtered = cocktails;

  const isAlcoholIngredient = (i) => {
  return (i.type || "").toLowerCase() === "alcohol";
  }; 

  const cocktailHasAlcohol = (cocktail) => (cocktail.ingredients || []).some(isAlcoholIngredient);

  if (alcoholPreference !== "any") {
    filtered = filtered.filter((c) => {
      const alcoholic = cocktailHasAlcohol(c);

      if (alcoholPreference === "alcohol") return alcoholic;
      if (alcoholPreference === "non-alcohol") return !alcoholic;

      return true;
    });
  }

  // 🚫 аллергии по ingredient.id
  if (allergies.length) {
    const allergySet = new Set(allergies.map(Number));

    filtered = filtered.filter((c) => {
      return !(c.ingredients || []).some((i) =>
        allergySet.has(i.id)
      );
    });
  }

  return filtered;
}