import {SCALE} from "../data/questions.js";

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
                    <div className="san-scale-labels">
                        {SCALE.map((v) => (
                            <div className="san-scale-label" key={v}>{v}</div>
                        ))}
                    </div>
                    <div className="san-scale">
                        {SCALE.map((v) => (
                            <button
                                key={v}
                                className={[
                                    "san-rb",
                                    v === 0 ? "zero" : "",
                                    selectedValue === v ? "sel" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() => onAnswer(v)}
                            >
                                {v === 0 ? "·" : ""}
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
          {selectedValue !== undefined
              ? `Выбрано: ${selectedValue > 0 ? "+" : ""}${selectedValue}. Переход…`
              : ""}
        </span>
            </div>
        </div>
    );
}