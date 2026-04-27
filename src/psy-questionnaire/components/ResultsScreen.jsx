import ScoreRow from "./ScoreRow.jsx";
import WestIcon from "@mui/icons-material/West";
import {Button} from "@mui/material";
import {useNavigate} from "react-router-dom";
import ReplayIcon from '@mui/icons-material/Replay';

function ResultsScreen({
                                          results,
                                          onSave,
                                          onRestart,
                                          saving,
                                          saveStatus,
                                      }) {
    const { samochuvstvie, aktivnost, nastroenie } = results;
    const overall = ((samochuvstvie + aktivnost + nastroenie) / 3).toFixed(2);
    const goTo = useNavigate();

    const isDisabled = saving || saveStatus === "success";

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
            <div className="san-eyebrow">Результаты</div>

            <h1 className="san-h1">Ваши показатели</h1>

            <p className="san-body">
                Средний балл шкалы - 4,0. Выше 4 - благоприятное состояние,
                ниже 4 - неблагоприятное. Диапазон 5,0-5,5 считается нормой.
            </p>

            <div className="san-divider" />

            <ScoreRow label="Самочувствие" score={samochuvstvie} />
            <ScoreRow label="Активность"   score={aktivnost}     />
            <ScoreRow label="Настроение"   score={nastroenie}    />

            <p className="san-neutral-note">
                Среднее по всем шкалам: {overall}
            </p>

            <div className="san-divider" />
            <div className="san-btns">
                <button
                    className="san-btn"
                    onClick={onRestart}
                >
                    <ReplayIcon sx={{fontSize: "18px"}} />
                </button>

                <button
                    className="san-btn"
                    onClick={onSave}
                    disabled={isDisabled}
                >
                    {saving
                        ? "Сохранение..."
                        : saveStatus === "success"
                            ? "Сохранено"
                            : "Сохранить"}
                </button>
            </div>
        </div>
    );
}
export default ResultsScreen;