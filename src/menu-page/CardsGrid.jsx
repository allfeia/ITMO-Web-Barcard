import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";
import {useState} from "react";
import RecipeCard from "./RecipeCard.jsx";

function CardsGrid({ cocktails }) {

    const [open, setOpen] = useState(false);
    const [selectedCocktail, setSelectedCocktail] = useState(null);

    const openModal = (cocktail) => {
        setSelectedCocktail(cocktail)
        setOpen(true);
    }
    const closeModal = () => setOpen(false);

    return (
        <div className="menu-cards">
            {cocktails.map((cocktail) => (
                <Card
                    className="menu-card"
                    key={cocktail.id}
                    onClick={() => openModal(cocktail)}
                >
                    <CardActionArea>
                        <CardMedia component="div" className="menu-card-media" style={{"width": 175, "height":220}}>
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