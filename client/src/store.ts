import {
  AnyAction,
  applyMiddleware,
  // configureStore,
  ThunkAction,
  createStore,
} from "@reduxjs/toolkit";
import logger from "redux-logger";
import thunk from "redux-thunk";

import reducer from "./reducers";
import { myMiddleware } from "./middlewares";

// export const store = createStore(reducer);
// export const store = configureStore({ reducer });

const middlewares = [thunk, myMiddleware, logger];
export const store = createStore(reducer, applyMiddleware(...middlewares));

// Infer the RootState and AppDispatch types from thestore itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// to avoid repetition
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
