import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",

  initialState: {
    user: {
      pubKey: "0x11c88aCb3256A65D8A16e91E386f94D03769e0e7",
      username: "Anoy@luna",
      password: "",
    },
  },

  reducers: {
    updatePubkey: (state, action) => {
      state.user.pubKey = action.payload;
    },

    updateUsername: (state, action) => {
      state.user.username = action.payload;
    },
  },
});

export const { updatePubkey, updateUsername } = userSlice.actions;

export default userSlice.reducer;
