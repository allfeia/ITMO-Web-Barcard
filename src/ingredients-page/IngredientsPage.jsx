import './ingredients-page.css';
import '../commonStyles.css';
import WestIcon from "@mui/icons-material/West";
import Button from "@mui/material/Button";
import React, {useRef, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import drawHint from "./hint.js";
import TextField from "@mui/material/TextField";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useIngredients } from "./Ingredients";
import {useDispatch} from "react-redux";
import { useSelector } from 'react-redux';
import {addHintUsage, addStageMistake, resetLevel, toggleIngredient} from "../game/gameSlice.js";
import RecipeCard from "../menu-page/RecipeCard.jsx";
import {ingredientErrors} from './ingredients_error.js';
import ErrorModal from "../ErrorModal.jsx";

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

    useEffect(() => {
        if (mode !== "hard" && hintRef.current) {
            drawHint(hintRef.current);
        }
    }, [mode]);

    const errorChecker = () => {
        const totalErrors = ingredientErrors(selectedIngredients, cocktailIngredients);

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
            <Button
                className="back-btn"
                variant="text"
                onClick={() => {
                    goTo(-1)
                    dispatch(resetLevel())
                }}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{ fontSize: "30px" }} />
            </Button>
            {mode !== "hard" && (
                <canvas
                    className="hint-icon"
                    ref={hintRef}
                    style={{ width: 50, height: 50 }}
                    onClick={() => {
                        setIsHintOpen(true)
                        dispatch(addHintUsage({ stage: 'stage1'}));
                    }}
                ></canvas>
            )}
            {isHintOpen && (
                <RecipeCard
                    open={isHintOpen}
                    onClose={() => setIsHintOpen(false)}
                    cocktail={{id: cocktail}}
                    isHint={true}
                />
            )}
            <h1 className="ingredient-title">Ингредиенты</h1>

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
                    sx={{ backgroundColor: "#333", color: "#fff", fontSize: "12px" }}
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
