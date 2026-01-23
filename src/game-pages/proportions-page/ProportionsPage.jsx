import {addHintUsage, addStageMistake, setIngredientAmount, setStageStepsCount} from "../../game/gameSlice.js";
import PageHeader from "../PageHeader.jsx";
import React, {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import RecipeCard from "../../menu-page/RecipeCard.jsx";
import Button from "@mui/material/Button";
import './proportions-page.css';
import {proportionsErrors} from "./proportions_error.js";
import ErrorModal from "../ErrorModal.jsx";

function ProportionsPage() {
    const goTo = useNavigate();
    const hintRef = useRef(null);

    const [isHintOpen, setIsHintOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorCount, setErrorCount] = useState(0);


    const dispatch = useDispatch();
    const mode = useSelector(state => state.game.mode);
    const selectedIngredients = useSelector(state => state.game.selectedIngredients);
    const cocktail = useSelector(state => state.game.cocktailId)

    const cocktailIngredients = useSelector(state => state.game.cocktailData?.ingredients || []);

    const ingredientsWithQuantity = Object.values(selectedIngredients).filter(selected =>
        cocktailIngredients.some(ci => ci.id === selected.id && ci.amount !== null)
    );

    const errorChecker = () => {
        const errors = proportionsErrors(ingredientsWithQuantity, cocktailIngredients);

        dispatch(setStageStepsCount({ stage: 'stage2', stepsCount: ingredientsWithQuantity.length }));

        if (errors > 0) {
            dispatch(addStageMistake({ stage: 'stage2', count: errors }));
            setErrorCount(errors);
            setErrorModalOpen(true);

            window.ym(106396717,'reachGoal','proportions_error', {count: errors});

        } else {
            goTo("/create");
        }
    };

    return (
        <div className="proportions-container">
            <PageHeader
                title="Пропорции"
                showHint={mode !== "hard"}
                hintCanvasRef={hintRef}
                onBack={() => { goTo(-1) }}
                onHintClick={() => {
                    setIsHintOpen(true);
                    dispatch(addHintUsage({ stage: 'stage2' }));
                    window.ym(106396717,'reachGoal','hints2')
                }}
            />
            {isHintOpen && (
                <RecipeCard
                    open={isHintOpen}
                    onClose={() => setIsHintOpen(false)}
                    cocktail={{id: cocktail}}
                    isHint={true}
                />
            )}
            <Button
                className="create-btn"
                variant="text"
                sx={{ backgroundColor: "#333", color: "#EFEEEC", fontSize: "12px", marginLeft: "35px", height: "42px", width: "45%" }}
                onClick={errorChecker}
            >
                Перейти к созданию
            </Button>
            <div className="selected-ingredients-frame">
                {ingredientsWithQuantity.length === 0 && <p>Нет ингредиентов с заданным количеством</p>}
                {ingredientsWithQuantity.map(ing => {
                    const recipeIng = cocktailIngredients.find(ci => ci.id === ing.id);
                    const unit = recipeIng?.unit || "";

                    return (
                        <div key={ing.id} className="selected-ingredient-row">
                            <span className="ingredient-name">{ing.name}</span>
                            <input
                                type="number"
                                className="ingredient-input"
                                value={ing.amount || ""}
                                placeholder="_____________"
                                onChange={e => dispatch(setIngredientAmount({ id: ing.id, amount: Number(e.target.value) }))}
                            />
                            <span className="ingredient-unit">{unit}</span>
                        </div>
                    );
                })}
            </div>
            <ErrorModal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                errorCount={errorCount}
            />

        </div>
    )
}
export default ProportionsPage;