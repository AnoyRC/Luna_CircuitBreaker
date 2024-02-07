import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",

  initialState: {
    user: {
      pubKey: "0x0000000000000000000000000000000000000000",
      username: "Null@luna",
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
