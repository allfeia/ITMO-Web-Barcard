import WestIcon from "@mui/icons-material/West";
import {useNavigate} from "react-router-dom";
import './favourities-page.css';
import '../commonStyles.css';
import CocktailListPage from "../CocktailsListPage.jsx";
import {useAuth} from "../authContext/useAuth.js";
import React, {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import { useApiFetch } from "../apiFetch.js";

function FavouritesPage() {

    const goTo = useNavigate();
    const apiFetch = useApiFetch();
    const [savedCocktails, setSavedCocktails] = useState([]);

    const { barId, barName, barSite, savedCocktailsId } = useAuth();

    useEffect(() => {
        if (!barId || !savedCocktailsId) return;

        apiFetch("/api/favourites", {
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
            <Button
                className="back-btn"
                variant="text"
                onClick={() => goTo(-1)}
                data-testid="back-button"
                style={{ cursor: 'pointer' }}
            >
                <WestIcon className="learn-arrow" sx={{fontSize: "30px"}}/>
            </Button>
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