import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import drawOlive from "./Olive.js";
import "./LevelPage.css";
import WestIcon from '@mui/icons-material/West';
import {useDispatch, useSelector} from "react-redux";
import {resetGame, setMode} from "../../game/gameSlice.js";

export default function LevelPage() {
    const goTo = useNavigate();

    const easyRef = useRef(null);
    const mediumRef = useRef(null);
    const hardRef = useRef(null);

    useEffect(() => {
        drawOlive(easyRef.current, 1);
        drawOlive(mediumRef.current, 2);
        drawOlive(hardRef.current, 3);
    }, []);

    const dispatch = useDispatch();

    const selectLevel = (mode) => {
        window.ym(106396717,'reachGoal','chosen_level', {level: mode});
        dispatch(setMode(mode));
        goTo("/ingredients");
    }

    const mode = useSelector(state => state.game.mode);
    console.log("Текущий режим:", mode);


    return (
        <div className="page">
            <Button
                className="back-btn"
                variant="text"
                onClick={() => {
                    goTo(-1)
                    dispatch(resetGame());
                }}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{fontSize: "30px"}}/>
            </Button>
            <div className="page-content">
                <h1 className="title">
                    Выберите<br/>уровень
                </h1>
                <div className="level-block">
                    <div className="hint">С подсказками без штрафов</div>
                    <Button
                        variant="outlined"
                        className="level-btn olive-btn"
                        fullWidth
                        onClick={() => selectLevel("easy")}
                    >
                        Легкий
                        <canvas ref={easyRef} className="olive-canvas" data-testid="olive-canvas"/>
                    </Button>
                </div>
                <div className="level-block">
                    <div className="hint">С подсказками и штрафами</div>
                    <Button
                        variant="outlined"
                        className="level-btn olive-btn"
                        fullWidth
                        onClick={() => selectLevel("medium")}
                    >
                        Средний
                        <canvas ref={mediumRef} className="olive-canvas" data-testid="olive-canvas"/>
                    </Button>
                </div>
                <div className="level-block">
                    <div className="hint">Без подсказок и штрафами за ошибки</div>
                    <Button
                        variant="outlined"
                        className="level-btn olive-btn"
                        fullWidth
                        onClick={() => selectLevel("hard")}
                    >
                        Сложный
                        <canvas ref={hardRef} className="olive-canvas" data-testid="olive-canvas"/>
                    </Button>
                </div>
            </div>
        </div>
            );
            }
