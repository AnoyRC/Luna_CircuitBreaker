"use client";

import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slice/userSlice";
import signupReducer from "./slice/signupSlice";
import dataReducer from "./slice/dataSlice";
import transferReducer from "./slice/transferSlice";
import modalReducer from "./slice/modalSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    signup: signupReducer,
    data: dataReducer,
    transfer: transferReducer,
    modal: modalReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
