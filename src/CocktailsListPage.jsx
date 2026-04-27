import TextField from "@mui/material/TextField";
import {InputAdornment} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useEffect, useState} from "react";
import CardsGrid from "./menu-page/CardsGrid.jsx";
import drawUserIcon from "./icons/userIcon.js";
import HelpIcon from '@mui/icons-material/Help';
import {useNavigate} from "react-router-dom";

function CocktailListPage({
                                             cocktails,
                                             title,
                                             barName = "",
                                             barSite = "",
                                             showAccountIcon = false,
                                             accountIconRef = null,
                                             onAccountClick = null
                                         }) {
    const [searchValue, setSearchValue] = useState("");
    const goTo = useNavigate();

    const filtered = cocktails.filter(c =>
        c.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    useEffect(() => {
        if (showAccountIcon && accountIconRef?.current) {
            drawUserIcon(accountIconRef.current, {
                color: "#333",
                filled: true
            });
        }
    }, [showAccountIcon, accountIconRef]);

    return (
        <div className="menu-template-container">
            {showAccountIcon ? (
                <canvas
                    className="account-icon"
                    data-testid="account-canvas"
                    ref={accountIconRef}
                    onClick={onAccountClick}
                />
            ) : (
                <HelpIcon
                    className="help-icon"
                    sx={{
                        position: "absolute",
                        right: "15px",
                        top: "8px",
                        size: "30px",
                        color: "#333"
                    }}
                    onClick={() => {goTo("/psyQuest")}}
                />
            )}

            <h1 className="menu-template-title">{title}</h1>

            <a className="bar-name" href={barSite}>{barName}</a>


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
                    }}
                />
            </div>

            {filtered.length > 0 ? (
                <CardsGrid cocktails={filtered} />
            ) : (
                <h2 className="no-cocktail-text">Такого коктейля нет :(</h2>
            )}
        </div>
    );
}
export default CocktailListPage;
