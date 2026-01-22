import './ingredients-page.css';
import '../../commonStyles.css';
import Button from "@mui/material/Button";
import React, {useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useIngredients } from "./Ingredients.jsx";
import {useDispatch} from "react-redux";
import { useSelector } from 'react-redux';
import {addHintUsage, addStageMistake, resetLevel, setStageStepsCount, toggleIngredient} from "../../game/gameSlice.js";
import RecipeCard from "../../menu-page/RecipeCard.jsx";
import {ingredientErrors} from './ingredients_error.js';
import ErrorModal from "../ErrorModal.jsx";
import PageHeader from "../PageHeader.jsx";

function IngredientsPage() {
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

    console.log('Выбранные ингредиенты:', selectedIngredients);

    const {
        searchValue,
        setSearchValue,
        groupedIngredients
    } = useIngredients();

    const errorChecker = () => {
        const totalErrors = ingredientErrors(selectedIngredients, cocktailIngredients);

        dispatch(setStageStepsCount({ stage: 'stage1', stepsCount: cocktailIngredients.length }));

        if (totalErrors > 0) {
            dispatch(addStageMistake({ stage: 'stage1', count: totalErrors }));
            setErrorCount(totalErrors);
            setErrorModalOpen(true);
        } else {
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
                    cocktail={{id: cocktail}}
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
        </div>
    );
}

export default IngredientsPage;
