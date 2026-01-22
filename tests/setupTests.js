import "@testing-library/jest-dom";
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../src/game/store';
import {configureStore} from "@reduxjs/toolkit";
import rootReducer from "../src/game/rootReducer.js";

const mockInitialState = {
    game: {
        cocktailId: null,
        cocktailData: null,
        mode: 'easy',
        selectedIngredients: {},
        stages: {
            stage1: { stepsCount: 5, mistakes: 0, hintsUsed: 0, score: 0 },
            stage2: { stepsCount: 4, mistakes: 0, hintsUsed: 0, score: 0 },
            stage3: { stepsCount: 10, mistakes: 0, hintsUsed: 0, score: 0 },
        },
        gameOver: false,
        gameOverReason: null,
    },
};

export function renderWithProvider(ui, options = {}) {
    return render(
        <Provider store={store}>
            {ui}
        </Provider>,
        options
    );
}

export function renderWithCustomState(ui, customState = {}, options = {}) {
    const testStore = configureStore({
        reducer: rootReducer,
        preloadedState: {
            game: { ...mockInitialState.game, ...customState },
        },
    });

    return render(
        <Provider store={testStore}>
            {ui}
        </Provider>,
        options
    );
}