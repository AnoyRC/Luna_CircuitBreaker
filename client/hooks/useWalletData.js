"use client";
import { ethers } from "ethers";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setBalance,
  setEthPrice,
  setMarketData,
  setTransactions,
} from "@/redux/slice/dataSlice";

export default function useWalletData() {
  const dispatch = useDispatch();
  const fetchBalance = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const balance = await provider.getBalance(address);
      dispatch(setBalance(ethers.utils.formatEther(balance)));
    } catch (e) {
      dispatch(setBalance(0));
    }
  };

  const fetchPrice = async () => {
    try {
      const res = await axios.get(
        "https://optimism.blockscout.com/api/v2/stats/charts/market"
      );
      dispatch(setEthPrice(res.data.chart_data[0].closing_price));
      dispatch(setMarketData(res.data.chart_data));
    } catch (e) {
      dispatch(setEthPrice(0));
    }
  };

  const fetchTransactions = async (address) => {
    try {
      const res = await axios.get(
        `https://api-sepolia.scrollscan.com/api?module=account&action=txlist&address=${address}&page=1&offset=20`
      );

      console.log(res.data);
      dispatch(setTransactions(res.data.result));
    } catch (e) {
      dispatch(setTransactions([]));
    }
  };

  return { fetchBalance, fetchPrice, fetchTransactions };
}
