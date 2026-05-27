export function rankCocktails(cocktails, tastes = []) {
  const tasteSet = new Set(tastes);

  const scored = cocktails.map((c) => {
    let score = 0;

    if (tasteSet.has("sweet")) score += c.taste_sweet ?? 0;
    if (tasteSet.has("sour")) score += c.taste_sour ?? 0;
    if (tasteSet.has("bitter")) score += c.taste_bitter ?? 0;
    if (tasteSet.has("salty")) score += c.taste_salty ?? 0;
    if (tasteSet.has("umami")) score += c.taste_umami ?? 0;

    return {
      id: c.id,
      name: c.name,
      score,
    };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ id, name }) => ({ id, name }));
}