"use client";
import { LunaSavingManager } from "@/lib/abis/AddressManager";
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";
import { useSelector } from "react-redux";

export default function TxMini({ tx }) {
  const walletAddress = useSelector((state) => state.user.user.pubKey);
  const ethPrice = useSelector((state) => state.data.ethPrice);

  if (tx.to === null) return;
  return (
    <div
      className="flex w-full mt-4 rounded-2xl h-[70px] bg-white border-blue-500/70 hover:shadow-lg hover:cursor-pointer transition duration-300 border-[1px]"
      onClick={() => {
        window.open(`https://sepolia.scrollscan.dev/tx/${tx.hash}`, "_blank");
      }}
    >
      <div className=" flex h-full w-full items-center justify-between px-2">
        <p className="text-black/50 text-sm font-bold">
          {tx.to !== LunaSavingManager.toLowerCase() ? (
            tx.to === walletAddress.toLowerCase() ? (
              <ArrowDownLeft
                className="inline-block text-green-500/70 mr-2"
                size={45}
              ></ArrowDownLeft>
            ) : (
              <ArrowUpRight
                className="inline-block text-red-500/70 mr-2"
                size={45}
              ></ArrowUpRight>
            )
          ) : (
            <PiggyBank
              className="inline-block text-blue-500/70 mr-2"
              size={45}
            ></PiggyBank>
          )}
        </p>
        <p className="font-bold text-3xl text-black/70 mr-3">
          ${((tx.value / 10 ** 18) * ethPrice).toFixed(0)}
        </p>
      </div>
    </div>
  );
}
