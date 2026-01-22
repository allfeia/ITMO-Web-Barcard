import { combineReducers } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";

const rootReducer = combineReducers({
  game: gameReducer,
});

export default rootReducer;
