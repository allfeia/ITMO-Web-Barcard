import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {drawCocktailMap} from '../menu-cocktails/drawCocktailMap.js'
import RecipeCard from "./RecipeCard.jsx";

function CardsGrid({ cocktails }) {
    const canvasRef = useRef({});
    const [open, setOpen] = useState(false);
    const [selectedCocktail, setSelectedCocktail] = useState(null);

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
                                width="175" height="220"
                            />
                        </CardMedia>
                        <CardContent>
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