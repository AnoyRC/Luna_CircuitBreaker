import { createSlice } from "@reduxjs/toolkit";

const dataSlice = createSlice({
  name: "data",

  initialState: {
    ethPrice: 0,
    balance: "-.--",
    marketData: [],
    transactions: [],
    savings: null,
    paymentAmount: 0,
    nfts: [],
  },

  reducers: {
    setEthPrice: (state, actions) => {
      state.ethPrice = actions.payload;
    },

    setBalance: (state, actions) => {
      state.balance = actions.payload;
    },

    setMarketData: (state, actions) => {
      state.marketData = actions.payload;
    },

    setTransactions: (state, actions) => {
      state.transactions = actions.payload;
    },

    setSavings: (state, actions) => {
      state.savings = actions.payload;
    },

    setPaymentAmount: (state, actions) => {
      state.paymentAmount = actions.payload;
    },

    setNfts: (state, actions) => {
      state.nfts = actions.payload;
    },
  },
});

export const {
  setEthPrice,
  setBalance,
  setMarketData,
  setTransactions,
  setSavings,
  setPaymentAmount,
  setNfts,
} = dataSlice.actions;

export default dataSlice.reducer;
