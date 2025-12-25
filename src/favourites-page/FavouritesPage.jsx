import WestIcon from "@mui/icons-material/West";
import {useNavigate} from "react-router-dom";
import './favourities-page.css';
import '../commonStyles.css';
import CocktailListPage from "../CocktailsListPage.jsx";
import {useAuth} from "../authContext/useAuth.js";
import {useEffect, useState} from "react";

function FavouritesPage() {

    const goTo = useNavigate();
    const [savedCocktails, setSavedCocktails] = useState([]);

    const { barId, barName, barSite, savedCocktailsId } = useAuth();

    useEffect(() => {
        if (!barId || !savedCocktailsId) return;

        fetch("/api/favourites", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                savedCocktailsId: savedCocktailsId,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setSavedCocktails(data);
                console.log("Полученные коктейли:", data);
            })
            .catch((err) => console.error("Ошибка загрузки избранного:", err));
    }, [savedCocktailsId]);

    return (
        <div className="favourites-container">
            <WestIcon
                className="back-arrow-fav"
                sx={{ fontSize: "30px" }}
                onClick={() => goTo('/account')}
            />
            {savedCocktails.length === 0 ? (
                <h2 className="empty-favourites">Сохранений нет</h2>
            ) : (
                <CocktailListPage
                    cocktails={savedCocktails}
                    title="Избранное"
                    showBarLink={true}
                    barName={barName}
                    barSite={barSite}
                />
            )}

        </div>
    )
}
export default FavouritesPage;