"use client";

import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slice/userSlice";
import signupReducer from "./slice/signupSlice";
import dataReducer from "./slice/dataSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    signup: signupReducer,
    data: dataReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
