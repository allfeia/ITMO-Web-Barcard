import { Questions } from "../questions.js";
import { S_KEYS, A_KEYS, N_KEYS } from "../keys.js";

export function rawScore(val, pl) {
    return pl ? 4 - val : 4 + val;
}

export function computeResults(answers) {
    const scored = {};

    Questions.forEach((q) => {
        if (answers[q.id] !== undefined) {
            scored[q.id] = rawScore(answers[q.id], q.pl);
        }
    });

    const avg = (keys) =>
        +(keys.reduce((sum, k) => sum + (scored[k] || 0), 0) / 10).toFixed(2);

    return {
        samochuvstvie: avg(S_KEYS),
        aktivnost: avg(A_KEYS),
        nastroenie: avg(N_KEYS),
        scored,
    };
}

export function getStatus(score) {
    if (score >= 5.0)
        return { text: "Норма",           fill: "#0F6E56", bg: "#E1F5EE", textColor: "#085041" };
    if (score > 4.0)
        return { text: "Благоприятное",  fill: "#1D9E75", bg: "#E1F5EE", textColor: "#085041" };
    if (score === 4.0)
        return { text: "Нейтральное",    fill: "#888780", bg: "#F1EFE8", textColor: "#444441" };
    return   { text: "Неблагоприятное",fill: "#D85A30", bg: "#FAECE7", textColor: "#4A1B0C" };
}