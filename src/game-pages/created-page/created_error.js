export const createdErrors = (shuffledSteps, correctSteps, cocktailIngredients, userAnswers) => {
    if (!shuffledSteps.length || !correctSteps.length) return { ingredientErrors: 0, orderErrors: 0, totalErrors: 0 };

    let ingredientErrors = 0;
    let orderErrors = 0;

    shuffledSteps.forEach(step => {
        if (!step.ingredient_name) return;

        const correctIngredient = cocktailIngredients.find(
            ing => ing.name === step.ingredient_name
        );

        if (!userAnswers[step.step_number] || userAnswers[step.step_number] !== correctIngredient.name) {
            ingredientErrors += 1;
        }
    });

    shuffledSteps.forEach((step, index) => {
        if (correctSteps[index]?.step_number !== step.step_number) {
            orderErrors += 1;
        }
    });

    // console.log("ингр ошибки:",ingredientErrors);
    // console.log("порядок ошибки:",orderErrors);
    // console.log("user answers:",userAnswers);
    // console.log("cocktailIngr", cocktailIngredients);

    return ingredientErrors + orderErrors;
};
