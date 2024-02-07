import { createSlice } from "@reduxjs/toolkit";

const signupSlice = createSlice({
  name: "signup",
  initialState: {
    step: 0,
    name: "",
    passkey: null,
    pubkeyx: "",
    isLoading: false,
  },

  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setPasskey: (state, action) => {
      state.passkey = action.payload;
    },
    setPubkeyx: (state, action) => {
      state.pubkeyx = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setStep, setName, setPasskey, setPubkeyx, setIsLoading } =
  signupSlice.actions;

export default signupSlice.reducer;
