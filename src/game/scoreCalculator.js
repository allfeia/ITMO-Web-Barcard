export const calculateStageScore = (stageKey, mode, stageData) => {
    const basePointsMap = {
        stage1: 25,
        stage2: 35,
        stage3: 40,
    };

    const modeMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
    };

    const base = basePointsMap[stageKey];
    const multiplier = modeMultiplier[mode];
    let score = base * multiplier;

    const steps = stageData.stepsCount || 1;          // защита от 0
    const mistakes = stageData.mistakes || 0;
    const hints = stageData.hintsUsed || 0;

    if (mode === 'easy') {
        const limit = steps * 1.5;
        if (mistakes + hints > limit) {
            return 0;
        }
        if (hints === 0) {
            score += 10;
        }
        return Math.round(score);
    }

    if (mode === 'medium') {
        const maxPossible = steps + steps; // ошибки + подсказки
        const penaltyFactor = (mistakes + hints) / maxPossible;
        score *= (1 - 0.4 * penaltyFactor);

        if (hints === 0) {
            score += 15;
        }
        return Math.round(score);
    }

    if (mode === 'hard') {
        // подсказки в hard невозможны → hints === 0 всегда
        const maxErrors = Math.max(steps - 1, 1);
        const penaltyFactor = mistakes / maxErrors;
        score *= (1 - 0.6 * penaltyFactor);

        return Math.round(score);
    }

    return Math.round(score);
};