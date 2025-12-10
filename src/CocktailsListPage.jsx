import TextField from "@mui/material/TextField";
import {InputAdornment} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListAltIcon from "@mui/icons-material/FilterListAlt";
import {useEffect, useState} from "react";
import CardsGrid from "./menu-page/CardsGrid.jsx";
import drawUserIcon from "./icons/userIcon.js";

function CocktailListPage({
                                             cocktails,
                                             title,
                                             showBarLink = false,
                                             barName = "",
                                             barSite = "",
                                             showAccountIcon = false,
                                             accountIconRef = null,
                                             onAccountClick = null
                                         }) {
    const [searchValue, setSearchValue] = useState("");

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
            {showAccountIcon && (
                <canvas
                    className="account-icon"
                    data-testid="account-canvas"
                    ref={accountIconRef}
                    onClick={onAccountClick}
                />
            )}

            <h1 className="menu-template-title">{title}</h1>

            {showBarLink && (
                <a className="bar-name" href={barSite}>{barName}</a>
            )}

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
                        // endAdornment: (
                        //     <InputAdornment position="end">
                        //         <FilterListAltIcon />
                        //     </InputAdornment>
                        // )
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
