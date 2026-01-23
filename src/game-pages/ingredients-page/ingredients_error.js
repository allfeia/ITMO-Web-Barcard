export const ingredientErrors = (selectedIngredients, cocktailIngredients) => {
  if (!cocktailIngredients || !cocktailIngredients.length) return 0;

  const selectedIds = Object.keys(selectedIngredients).map((id) => Number(id));
  const correctIds = cocktailIngredients.map((ing) => ing.id);

  // ошибки = пропущенные + лишние
  const missing = correctIds.filter((id) => !selectedIds.includes(id));
  const extra = selectedIds.filter((id) => !correctIds.includes(id));

  return missing.length + extra.length;

  // console.log("выбранные пользователем:",selectedIngredients);
  // console.log("ингредиенты коктейля", correctIds);
  // console.log("ошибки", totalErrors);
};
