import { createSlice } from "@reduxjs/toolkit";

const forgotPasskeySlice = createSlice({
  name: "forgotPasskey",

  initialState: {
    dialog: false,
    steps: 0,
    isLoading: false,
    passkey: null,
    proof: null,
  },

  reducers: {
    setSteps: (state, action) => {
      state.steps = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setProof: (state, action) => {
      state.proof = action.payload;
    },
    handleDialog: (state, action) => {
      state.dialog = !state.dialog;
    },
    setPasskey: (state, action) => {
      state.passkey = action.payload;
    },
  },
});

export const { setSteps, setIsLoading, setProof, handleDialog, setPasskey } =
  forgotPasskeySlice.actions;

export default forgotPasskeySlice.reducer;
