import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import RecipeCard from "./RecipeCard.jsx";
import drawHeartIcon from "../icons/heartIcon.js";
import {useAuth} from "../authContext/useAuth.js";
import {drawCocktailMap} from "./menu-cocktails/drawCocktailMap.js";

function CardsGrid({ cocktails }) {

    const canvasRef = useRef({});
    const [open, setOpen] = useState(false);
    const [selectedCocktail, setSelectedCocktail] = useState(null);
    const canvasRefsHeart = useRef({});

    const { setSavedCocktailsId, savedCocktailsId, token, isBarman } = useAuth();

    const openModal = (cocktail) => {
        setSelectedCocktail(cocktail)
        setOpen(true);
    }
    const closeModal = () => setOpen(false);

    useEffect(() => {
        cocktails.forEach(cocktail => {
            const canvas = canvasRef.current[cocktail.draw_file]
            const draw = drawCocktailMap[cocktail.draw_file];

            if (canvas && draw) {
                draw(canvas);
            }
        })
    }, [cocktails]);

    useEffect(() => {
        if (!isBarman) return;
        cocktails.forEach(cocktail => {
            const canvas = canvasRefsHeart.current[cocktail.id];
            if (canvas) {
                const isFilled = savedCocktailsId.includes(cocktail.id)
                drawHeartIcon(canvas, { color: '#333', filled: isFilled });
            }
        });
    }, [cocktails, savedCocktailsId, isBarman]);


    const addFavouriteCocktail = (cocktailId) => {
        if (!isBarman) return;
        fetch(`/api/favourites/add/${cocktailId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (!savedCocktailsId.includes(data.cocktailId)) {
                    setSavedCocktailsId(prev => [...prev, data.cocktailId]);
                }
            })
            .catch(console.error);
    };

    const removeFavouriteCocktail = (cocktailId) => {
        if (!isBarman) return;
        fetch(`/api/favourites/remove/${cocktailId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(setSavedCocktailsId(prev => prev.filter(id => id !== cocktailId)))
            .catch(console.error);
    };

    return (
        <div className="menu-cards">
            {cocktails.map((cocktail) => (
                <Card
                    className="menu-card"
                    key={cocktail.id}
                    onClick={() => openModal(cocktail)}
                >
                    <CardActionArea>
                        <CardMedia component="div" className="menu-card-media">
                            <canvas
                                className="cocktail-drawing"
                                ref={(cocktailDrawer) => (canvasRef.current[cocktail.draw_file] = cocktailDrawer)}
                            />
                        </CardMedia>
                        <CardContent>
                            <canvas
                                className="favourites"
                                data-testid="favourites-canvas"
                                style={{ width: "20px", height: "20px" }}
                                ref={el => canvasRefsHeart.current[cocktail.id] = el}

                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (savedCocktailsId.includes(cocktail.id)) {
                                        removeFavouriteCocktail(cocktail.id)
                                    } else {
                                        addFavouriteCocktail(cocktail.id);
                                    }
                                }}
                            />
                            <Typography className="card-title" variant="h7" component="div">
                                {cocktail.name}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            ))}

            {selectedCocktail && (
                <RecipeCard open={open} onClose={closeModal} cocktail={selectedCocktail} />
            )}

        </div>
    )
}
export default CardsGrid;