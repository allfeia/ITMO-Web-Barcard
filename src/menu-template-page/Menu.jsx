import '../commonStyles.css'
import './menu-template-page.css'
import PersonIcon from '@mui/icons-material/Person';
import {useNavigate} from "react-router-dom";
import CardsGrid from "./CardsGrid.jsx";
import {useEffect, useState} from "react";
import TextField from "@mui/material/TextField";
import {InputAdornment} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListAltIcon from "@mui/icons-material/FilterListAlt";

function Menu() {
    const goTo = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const [cocktails, setCocktails] = useState([]);
    const barId = sessionStorage.getItem("barId");
    const isBarman = sessionStorage.getItem("isBarman");

    useEffect(() => {

        if (!barId) return;
        try {
            fetch(`/api/cocktail?barId=${barId}`)
                .then((res) => res.json())
                .then(data => setCocktails(data))
                .catch((err) => console.error(err));
        } catch (error) {
            console.error(error);
        }

    }, []);

    const filteredCocktails = cocktails.filter(c => c.name.toLowerCase().includes(searchValue.toLowerCase()));

    return (
        <div className="menu-template-container">
            {isBarman ? (
                <div className="account-icon">
                    <PersonIcon
                        sx={{fontSize: 35}}
                        onClick={() => goTo("/account")}
                    />
                </div>
            ) : null}
            <h1 className="menu-template-title">
                Выберете<br/>коктейль
            </h1>
            {/*поменять на ссылку, которая вытаскивается из бд*/}
            <h1 className="bar-name">Paloma Mexican Cantina</h1>
            <div className="cocktail-search-container">
                <TextField
                    className="cocktail-search"
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
                        endAdornment: (
                            <InputAdornment position="end">
                                <FilterListAltIcon />
                            </InputAdornment>
                        )
                    }}
                />
            </div>
            {filteredCocktails.length > 0 ? (
                <CardsGrid cocktails={filteredCocktails} />
            ) : (
                <h2 className="no-cocktail-text">Такого коктейля нет :(</h2>
            )}

        </div>
    )
}
export default Menu;