export const proportionsErrors = (ingredientsWithQuantity, cocktailIngredients) => {
    if (!ingredientsWithQuantity || !cocktailIngredients.length) return 0;

    let errors = 0;

    ingredientsWithQuantity.forEach((ing) => {
        const recipeIng = cocktailIngredients.find(ci => ci.id === ing.id);

        const correctAmount = recipeIng?.amount;
        const userAmount = ing.amount;

        if (correctAmount !== userAmount) {
            errors += 1;
        }
    });

    return errors;
};
