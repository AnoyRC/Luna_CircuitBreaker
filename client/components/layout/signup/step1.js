"use client";

import { Urbanist } from "next/font/google";
import { useDispatch, useSelector } from "react-redux";
import { setStep } from "@/redux/slice/signupSlice";
import { Input, Button } from "@material-tailwind/react";
import { Fingerprint, Info, Loader2 } from "lucide-react";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export default function Step1() {
  const dispatch = useDispatch();

  return (
    <>
      <Button
        color="white"
        className="w-full flex h-[5.7rem] px-3 border-[1px] bg-white border-black rounded-xl"
      >
        <div className="flex items-center h-full bg-black/90 rounded-lg w-16 justify-center">
          <Fingerprint className="h-5 w-5 text-white" />
        </div>

        <div
          className={
            "flex flex-col ml-3 text-start h-full justify-center normal-case w-56 " +
            urbanist.className
          }
        >
          <h1 className="text-xl">Add a passkey</h1>
          <p className="text-xs font-normal text-gray-500">
            This will be used to execute transactions
          </p>
        </div>
      </Button>

      <Button
        variant="gradient"
        fullWidth
        className={urbanist.className + " mt-1"}
        onClick={() => {
          dispatch(setStep(2));
        }}
        // disabled={}
      >
        Next
      </Button>
    </>
  );
}
