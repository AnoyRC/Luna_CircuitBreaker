"use client";

import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slice/userSlice";
import signupReducer from "./slice/signupSlice";
import dataReducer from "./slice/dataSlice";
import transferReducer from "./slice/transferSlice";
import modalReducer from "./slice/modalSlice";
import savingsReducer from "./slice/savingSlice";
import changeEmailReducer from "./slice/changeEmailSlice";
import forgotPasskeyReducer from "./slice/forgotPasskeySlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    signup: signupReducer,
    data: dataReducer,
    transfer: transferReducer,
    modal: modalReducer,
    savings: savingsReducer,
    changeEmail: changeEmailReducer,
    forgotPasskey: forgotPasskeyReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
