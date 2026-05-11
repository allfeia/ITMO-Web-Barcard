import {SCALE} from "../data/questions.js";

const getButtonStyle = (v, maxAbs) => {
    if (v === 0) {
        return {};
    }

    const intensity = Math.abs(v) / maxAbs; 

    if (v < 0) {
        return {
            backgroundColor: `rgba(240, 148, 57, ${0.25 + intensity * 0.75})`,
        };
    }

    return {
        backgroundColor: `rgba(159, 163, 236, ${0.25 + intensity * 0.75})`,
    };
};

export default function QuestionScreen({
                                           question,
                                           idx,
                                           total,
                                           selectedValue,
                                           onAnswer,
                                           onBack,
                                       }) {
    const progress = (idx / total) * 100;

    return (
        <div className="san-card san-fade-in">

            <div className="san-progress-wrap">
                <div className="san-progress-label">
                    <span>Вопрос {idx + 1} из {total}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="san-progress-track">
                    <div className="san-progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="san-q-row">
                <div className="san-pole">{question.left}</div>

                <div>
                    <div className="san-scale">
                        {SCALE.map((v) => (
                            <button
                                key={v}
                                className={[
                                    `san-rb ${v === 0 ? "san-rb-0" : ""} ${selectedValue === v ? "sel" : ""}`
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                style={getButtonStyle(v, Math.max(...SCALE.map(Math.abs)))}    
                                onClick={() => onAnswer(v)}
                            >
                                {Math.abs(v)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="san-pole san-pole-right">{question.right}</div>
            </div>

            <div className="san-divider" />
            <div className="san-btns">
                <button className="san-btn" onClick={onBack}>
                    ← Назад
                </button>
                <span className="san-answer-hint">
          {/*{selectedValue !== undefined*/}
          {/*    ? `Выбрано: ${selectedValue > 0 ? "+" : ""}${selectedValue}. Переход…`*/}
          {/*    : ""}*/}
        </span>
            </div>
        </div>
    );
}