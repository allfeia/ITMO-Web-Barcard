import { configureStore } from '@reduxjs/toolkit'
import gameReducer from '../../src/game/gameSlice'

export function createTestStore(preloadedState) {
    return configureStore({
        reducer: {
            game: gameReducer,
        },
        preloadedState,
    })
}
