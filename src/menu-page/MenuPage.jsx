import '../commonStyles.css'
import './menu-page.css'
import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useAuth} from "../authContext/useAuth.js";
import CocktailListPage from "../CocktailsListPage.jsx";

function MenuPage() {
    const goTo = useNavigate();

    const [cocktails, setCocktails] = useState([]);

    const canvasRefUser = useRef(null);
    const { barId, isBarman, barName, barSite } = useAuth();

    useEffect(() => {
        if (!barId) return;

        fetch(`/api/cocktail?barId=${barId}`)
            .then((res) => res.json())
            .then(data => {
                setCocktails(data);
                console.log("Полученные коктейли:", data);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <CocktailListPage
            cocktails={cocktails}
            title="Выберите коктейль"
            barName={barName}
            barSite={barSite}
            showAccountIcon={isBarman}
            accountIconRef={canvasRefUser}
            onAccountClick={() => goTo("/account")}
        />
    )
}
export default MenuPage;