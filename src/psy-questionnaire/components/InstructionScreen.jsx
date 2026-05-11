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
            {/* <div className="san-eyebrow">Инструкция</div> */}

            <h1 className="an-eyebrow">Инструкция</h1>

            <p className="san-body">
                Вам будет предложено 30 пар противоположных характеристик. 
                В каждой паре выберете цифру, которая ближе всего к слову, наиболее точно описывающему ваше настроение.
            </p>

            <div className="san-info-box">
                <strong style={{ color: "var(--color-text-primary)" }}>
                    Как понимать шкалу:
                </strong>
                <br />
                <br />
                3 — проявляется очень сильно
                <br />
                2 — проявляется умеренно
                <br />
                1 — проявляется слабо
                <br />
                0 — нейтрально, затрудняетесь определить
                <br />
                <br />
                После выбора ответа тест автоматически переходит к следующему вопросу.
                Если захотите изменить ответ, просто нажмите кнопку «Назад».
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