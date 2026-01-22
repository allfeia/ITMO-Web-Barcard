function RecipeStepCard({ step, selectedIngredients, userAnswers, setUserAnswers }) {
    const ingredientOptions = Object.values(selectedIngredients);

    const handleChange = (e) => {
        setUserAnswers(prev => ({
            ...prev,
            [step.step_number]: e.target.value
        }));
    };

    let beforeText = step.action;
    let afterText = "";
    if (step.ingredient_name) {
        const regex = new RegExp(step.ingredient_name, "i");
        const match = step.action.match(regex);
        if (match) {
            const index = match.index;
            beforeText = step.action.slice(0, index);
            afterText = step.action.slice(index + match[0].length);
        }
    }

    return (
        <div className="recipe-step-card">
        <span className="step-text">
            {beforeText}
            {step.ingredient_name && ingredientOptions.length > 0 && (
                <select
                    value={userAnswers[step.step_number] || ""}
                    onChange={handleChange}
                    className="inline-select"
                >
                    <option value="" disabled/>
                    {ingredientOptions.map(ing => (
                        <option key={ing.id} value={ing.name}>{ing.name}</option>
                    ))}
                </select>
            )}
            {afterText}
        </span>
        </div>
    );
}

export default RecipeStepCard;
