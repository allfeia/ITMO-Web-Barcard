import {getStatus} from "../data/utils/scoring.js";

export default function ScoreRow({ label, score }) {
    const st = getStatus(score);

    const pct = ((score - 1) / 6) * 100;

    return (
        <div className="san-result-item">
            <div className="san-result-head">
                <span className="san-result-name">{label}</span>

                <div className="san-result-right">
                    <span className="san-result-score">{score.toFixed(1)}</span>
                    <span
                        className="san-badge"
                        style={{ background: st.bg, color: st.textColor }}
                    >
            {st.text}
          </span>
                </div>
            </div>

            <div className="san-bar-track">
                <div
                    className="san-bar-fill"
                    style={{ width: `${pct}%`, background: st.fill }}
                />
            </div>
        </div>
    );
}