import './ingredients-page.css';
import '../../commonStyles.css';
import Button from "@mui/material/Button";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useIngredients } from "./Ingredients.jsx";
import HardModeFailModal from "../HardModeFailModal";
import { useDispatch, useSelector } from 'react-redux';
import {
    addHintUsage,
    addStageMistake,
    resetLevel,
    setStageScore,
    setStageStepsCount,
    toggleIngredient,
    setGameOver,
    resetGameOver,
} from "../../game/gameSlice.js";
import RecipeCard from "../../menu-page/RecipeCard.jsx";
import { ingredientErrors } from './ingredients_error.js';
import ErrorModal from "../ErrorModal.jsx";
import PageHeader from "../PageHeader.jsx";
import { calculateStageScore } from "../../game/scoreCalculator.js";

function IngredientsPage() {
    const goTo = useNavigate();
    const hintRef = useRef(null);

    const [isHintOpen, setIsHintOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorCount, setErrorCount] = useState(0);

    const dispatch = useDispatch();

    const mode = useSelector(state => state.game.mode);
    const selectedIngredients = useSelector(state => state.game.selectedIngredients);
    const cocktail = useSelector(state => state.game.cocktailId);
    const cocktailIngredients = useSelector(state => state.game.cocktailData?.ingredients || []);
    const stage1Data = useSelector(state => state.game.stages.stage1);
    const gameOver = useSelector(state => state.game.gameOver);

    console.log('Выбранные ингредиенты:', selectedIngredients);

    const {
        searchValue,
        setSearchValue,
        groupedIngredients
    } = useIngredients();

    const errorChecker = () => {
        const totalErrors = ingredientErrors(selectedIngredients, cocktailIngredients);

        dispatch(setStageStepsCount({
            stage: 'stage1',
            stepsCount: cocktailIngredients.length
        }));

        if (totalErrors > 0) {
            dispatch(addStageMistake({
                stage: 'stage1',
                count: totalErrors
            }));

            // Проверка на превышение в hard-режиме
            const currentMistakes = stage1Data.mistakes + totalErrors;
            const steps = stage1Data.stepsCount || cocktailIngredients.length;
            const maxAllowed = Math.max(steps - 2, 1);

            if (mode === 'hard' && currentMistakes > maxAllowed) {
                dispatch(setGameOver({
                    isOver: true,
                    reason: 'too_many_mistakes_hard'
                }));
            } else {
                setErrorCount(totalErrors);
                setErrorModalOpen(true);
            }
        } else {
            const stageScore = calculateStageScore('stage1', mode, stage1Data);
            dispatch(setStageScore({
                stage: 'stage1',
                score: stageScore
            }));
            goTo("/proportions");
        }
    };

    return (
        <div className="ingredients-container">
            <PageHeader
                title="Ингредиенты"
                showHint={mode !== "hard"}
                hintCanvasRef={hintRef}
                onBack={() => { goTo(-1); dispatch(resetLevel()); }}
                onHintClick={() => { setIsHintOpen(true); dispatch(addHintUsage({ stage: 'stage1' })); }}
            />

            {isHintOpen && (
                <RecipeCard
                    open={isHintOpen}
                    onClose={() => setIsHintOpen(false)}
                    cocktail={{ id: cocktail }}
                    isHint={true}
                />
            )}

            <div className="search-create-row">
                <TextField
                    className="ingredient-search"
                    placeholder="Поиск"
                    color="#333"
                    focused
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    className="create-btn"
                    variant="text"
                    sx={{ backgroundColor: "#333", color: "#EFEEEC", fontSize: "12px" }}
                    onClick={errorChecker}
                >
                    Создать с пропорциями
                </Button>
            </div>

            <div className="ingredients-groups">
                {groupedIngredients.map(group => (
                    <div key={group.type} className="ingredient-group">
                        <h2 className="ingredient-group-title">{group.title}</h2>
                        <div className="ingredient-list">
                            {group.items.map(item => {
                                const isSelected = Boolean(selectedIngredients[item.id]);

                                return (
                                    <button
                                        key={item.id}
                                        className={`ingredient-chip ${isSelected ? "active" : ""}`}
                                        onClick={() => dispatch(toggleIngredient(item))}
                                    >
                                        {item.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <ErrorModal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                errorCount={errorCount}
            />

            <HardModeFailModal
                open={gameOver}
                onClose={() => dispatch(resetGameOver())}
                onStudyRecipe={() => {
                    dispatch(resetGameOver());
                    setIsHintOpen(true);
                }}
                onChangeMode={() => {
                    dispatch(resetGameOver());
                    dispatch(resetLevel());
                    goTo('/levelPage');
                }}
            />
        </div>
    );
}

export default IngredientsPage;