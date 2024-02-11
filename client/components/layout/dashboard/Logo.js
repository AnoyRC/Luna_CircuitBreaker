"use client";

import { Button } from "@material-tailwind/react";

import { useDispatch } from "react-redux";
import { AlertOctagon } from "lucide-react";

import { Urbanist } from "next/font/google";
import { handleDialog } from "@/redux/slice/forgotPasskeySlice";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export default function Logo() {
  const dispatch = useDispatch();
  return (
    <Button
      className={
        "p-0 bg-transparent h-full w-full rounded-3xl " + urbanist.className
      }
      onClick={() => {
        dispatch(handleDialog());
      }}
    >
      <div className="border-[1px] border-cyan-500 hover:border-black h-full w-full hover:cursor-pointer bg-white transition duration-300 hover:bg-black rounded-3xl overflow-hidden group relative p-4 capitalize text-left">
        <p className="text-4xl font-bold text-cyan-500/70 group-hover:text-white/70 transition duration-300">
          Forgot Passkey?
        </p>

        <AlertOctagon
          className="absolute -bottom-11 -right-3 text-cyan-500/20 group-hover:text-white/20 transition duration-300 group-hover:translate-x-4"
          size={150}
        />
      </div>
    </Button>
  );
}
