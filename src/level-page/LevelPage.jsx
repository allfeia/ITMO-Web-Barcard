import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import drawOlive from "./Olive.js";
import "./LevelPage.css";
import WestIcon from '@mui/icons-material/West';

export default function LevelPage() {
    const navigate = useNavigate();

    const easyRef = useRef(null);
    const mediumRef = useRef(null);
    const hardRef = useRef(null);

    useEffect(() => {
        drawOlive(easyRef.current, 1);
        drawOlive(mediumRef.current, 2);
        drawOlive(hardRef.current, 3);
    }, []);

    return (
        <div className="page">
                <Button
                    className="back-btn"
                    variant="text"
                    onClick={() => navigate(-1)}
                    data-testid="back-button"
                >
                    <WestIcon className="learn-arrow" sx={{fontSize: "30px"}}/>
                </Button>
                <h1 className="title">
                    Выберите<br/>уровень
                </h1>
                <div className="level-block">
                    <div className="hint">С подсказками без штрафов</div>
                    <Button
                        variant="outlined"
                        className="level-btn olive-btn"
                        fullWidth
                        onClick={() => navigate("/game/easy")}
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
                        onClick={() => navigate("/game/medium")}
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
                        onClick={() => navigate("/game/hard")}
                    >
                        Сложный
                        <canvas ref={hardRef} className="olive-canvas" data-testid="olive-canvas"/>
                    </Button>
                </div>
            </div>
            );
            }
