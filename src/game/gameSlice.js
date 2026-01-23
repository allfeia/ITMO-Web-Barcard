import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cocktailId: null,
  cocktailData: null,
  mode: "easy",
  hintsEnabled: true,
  selectedIngredients: {}, // ингредиенты с пропорциями [{ id, name, quantity }]

  stages: {
    stage1: {
      stepsCount: 0,
      mistakes: 0,
      hintsUsed: 0,
    },
    stage2: {
      stepsCount: 0,
      mistakes: 0,
      hintsUsed: 0,
    },
    stage3: {
      stepsCount: 0,
      mistakes: 0,
      hintsUsed: 0,
    },
  },
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setCocktail(state, action) {
      const { id, data } = action.payload;

      if (state.cocktailId !== id) {
        state.cocktailId = id;
        state.cocktailData = data || null;
        state.selectedIngredients = {};

        Object.values(state.stages).forEach((stage) => {
          stage.mistakes = 0;
          stage.hintsUsed = 0;
          stage.stepsCount = 0;
        });
      }
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },

    toggleIngredient(state, action) {
      const ingredient = action.payload;
      const id = ingredient.id;

      if (state.selectedIngredients[id]) {
        delete state.selectedIngredients[id];
      } else {
        state.selectedIngredients[id] = {
          ...ingredient,
          amount: null,
        };
      }
    },
    setIngredientAmount(state, action) {
      const { id, amount } = action.payload;
      if (state.selectedIngredients[id]) {
        state.selectedIngredients[id].amount = amount;
      }
    },

    setStageStepsCount(state, action) {
      const { stage, stepsCount } = action.payload;
      state.stages[stage].stepsCount = stepsCount;
    },

    addStageMistake(state, action) {
      const { stage, count = 0 } = action.payload;
      state.stages[stage].mistakes += count;
    },

    addHintUsage(state, action) {
      const { stage } = action.payload;

      if (state.mode !== "hard") {
        state.stages[stage].hintsUsed += 1;
      }
    },

    resetStages(state) {
      Object.keys(state.stages).forEach((stage) => {
        state.stages[stage].mistakes = 0;
        state.stages[stage].hintsUsed = 0;
      });
    },

    resetGame() {
      return initialState;
    },
    resetLevel(state) {
      return {
        ...initialState,
        cocktailId: state.cocktailId,
        cocktailData: state.cocktailData,
      };
    },
  },
});

export const {
  setCocktail,
  setMode,
  toggleIngredient,
  setStageStepsCount,
  addStageMistake,
  addHintUsage,
  resetGame,
  resetLevel,
  setIngredientAmount,
} = gameSlice.actions;

export default gameSlice.reducer;
