import {Button} from "@mui/material";
import React from "react";
import WestIcon from "@mui/icons-material/West";
import {useNavigate} from "react-router-dom";

export default function InstructionScreen({ onStart }) {
    const goTo = useNavigate();

    return (
        <div className="san-card san-fade-in">
            <Button
                className="back-btn"
                variant="text"
                onClick={() => goTo(-1)}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{fontSize: "30px"}}/>
            </Button>
            <div className="san-eyebrow">Инструкция</div>

            <h1 className="san-h1">Перед началом теста</h1>

            <p className="san-body">
                Вам предлагается описать своё состояние прямо сейчас с
                помощью 30 пар противоположных характеристик. В каждой паре выберите
                цифру, соответствующую степени выраженности нужного признака.
            </p>

            <div className="san-info-box">
                <strong style={{ color: "var(--color-text-primary)" }}>
                    Как читать шкалу:
                </strong>
                <br />
                Левое слово ←{" "}
                <strong>−3 &nbsp;−2 &nbsp;−1</strong> · <strong>0</strong> ·{" "}
                <strong>1 &nbsp;2 &nbsp;3</strong> → Правое слово
                <br />
                <br />
                −3 / −2 / −1 — выражен левый признак (слабо → сильно)
                <br />
                0 — нейтрально, затрудняетесь определить
                <br />
                1 / 2 / 3 — выражен правый признак (слабо → сильно)
                <br />
                <br />
                После выбора ответа тест автоматически переходит к следующему вопросу.
                Вернуться назад можно кнопкой «Назад».
            </div>

            <Button
                variant="contained"
                className="san-btn"
                onClick={onStart}
            >
                Начать
            </Button>
        </div>
    );
}