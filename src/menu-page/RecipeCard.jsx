import {Fade, Modal, Paper, Typography, Box, Button} from "@mui/material";
import EastIcon from '@mui/icons-material/East';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import {setCocktail} from "../game/gameSlice.js";

function RecipeCard({ open, onClose, cocktail, isHint }) {
    const goTo = useNavigate();
    const [recipeData, setRecipeData] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (open && cocktail?.id) {
            setRecipeData(null);


            fetch(`/api/cocktail/${cocktail.id}/recipe`)
                .then(res => {
                    if (!res.ok) throw new Error(`error: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    setRecipeData(data);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [open, cocktail?.id]);

    const formatIngredientLine = (name, amountStr) => {
        const totalWidth = 22;
        const namePart = name;
        const amountPart = amountStr || "";

        const maxNameLength = totalWidth - (amountPart ? amountPart.length + 1 : 2);

        let truncatedName = namePart;
        if (namePart.length > maxNameLength) {
            truncatedName = namePart.substring(0, maxNameLength - 1) + "…";
        }

        const availableSpace = totalWidth - truncatedName.length - amountPart.length;
        const dots = availableSpace > 0 ? '.'.repeat(availableSpace) : '';

        return `${truncatedName}${dots}${amountPart}`;
    };

    const cocktailId = useSelector(state => state.game.cocktailId);
    console.log("Выбранный коктейль:", cocktailId);

    return (
        <Modal
            className="menu-flipped-card"
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: "blur(8px)",
                        transition: "0.6s"
                    }
                }
            }}
        >
            <Fade in={open} timeout={300}>
                <Paper className="menu-flipped-card-content">
                    {recipeData && (
                        <>
                            <Typography variant="h4" className="cocktail-name" gutterBottom>
                                {recipeData.name}
                            </Typography>


                            <Box className="recipe-sections">
                                <Typography variant="h7" className="recipeHeader">Ингредиенты</Typography>
                                <Box className="recipe-content">
                                    {recipeData.ingredients.map((ing, index) => (
                                        <Typography key={index} variant="h8" component="div" className="recipe-lists">
                                            {formatIngredientLine(ing.name, ing.amountStr)}
                                        </Typography>
                                    ))}
                                </Box>

                                <Typography variant="h7" className="recipeHeader">Рецепт</Typography>
                                <Box component="ol" className="recipe-steps recipe-content">
                                    {recipeData.steps.map((step, index) => (
                                        <li key={index}>
                                            <Typography variant="h8" className="recipe-lists">
                                                {step.action}
                                            </Typography>
                                        </li>
                                    ))}
                                </Box>
                            </Box>

                            {!isHint && (
                                <button
                                    className="learn"
                                    onClick={() => {
                                        dispatch(setCocktail({id: cocktail.id, data: recipeData}));
                                        goTo("/levelPage")
                                    }}
                                >
                                    <Typography variant="h6" className="learn-cocktail">
                                        Изучить
                                    </Typography>
                                    <EastIcon className="learn-arrow" sx={{ fontSize: "30px" }} />
                                </button>
                            )}
                        </>
                    )}
                </Paper>
            </Fade>
        </Modal>
    );
}

export default RecipeCard;