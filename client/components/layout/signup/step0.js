"use client";
import { Urbanist } from "next/font/google";
import { Input, Button } from "@material-tailwind/react";
import { Info, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setName, setStep } from "@/redux/slice/signupSlice";
import { useState, useRef, useEffect } from "react";
import useLuna from "@/hooks/useLuna";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export default function Step0() {
  const dispatch = useDispatch();
  const name = useSelector((state) => state.signup.name);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const inputRef = useRef(null);
  var timeout = null;
  const { isValidLuna } = useLuna();

  const handleName = (e) => {
    if (e.target.value.length > 20) {
      dispatch(
        setName(e.target.value.slice(0, 20).replace(/[^a-zA-Z0-9]/g, ""))
      );
    } else {
      dispatch(setName(e.target.value.replace(/[^a-zA-Z0-9]/g, "")));
    }
  };

  const checkLuna = async () => {
    if (name.length < 3) return;
    if (name.length > 20) return;

    const isUsed = await isValidLuna(name);

    setIsUsed(isUsed);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.addEventListener("keydown", function () {
      clearTimeout(timeout);

      timeout = setTimeout(function () {
        setIsTyping(false);
      }, 1000);

      setIsTyping(true);
    });
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLoading(true);
    } else {
      checkLuna();
    }
  }, [isTyping, name]);

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex w-full">
          <Input
            label="Choose your Domain"
            size="lg"
            className={urbanist.className + " rounded-r-none"}
            labelProps={{
              className: "after:rounded-tr-none",
            }}
            value={name}
            onChange={(e) => handleName(e)}
            ref={inputRef}
          />
          <Button
            ripple={false}
            variant="text"
            color="blue-gray"
            className={
              "flex items-center rounded-l-none border border-l-0 border-blue-gray-200 bg-blue-gray-500/10 normal-case px-3 text-sm py-0 " +
              urbanist.className
            }
          >
            @luna
          </Button>
        </div>

        {isLoading && name.length > 3 && (
          <p className="mt-2 text-sm flex text-gray-500">
            <Loader2 size={20} className="inline mr-1 animate-spin " />
            Checking availability...
          </p>
        )}

        {!isLoading && isUsed && (
          <p className="mt-2 text-sm flex text-red-500">
            <Info size={20} className="inline mr-1" />
            This domain is already taken.
          </p>
        )}

        {!isLoading && !isUsed && name.length > 3 && (
          <p className="mt-2 text-sm flex text-green-500">
            <Info size={20} className="inline mr-1" />
            This domain is available.
          </p>
        )}
      </div>

      <Button
        variant="gradient"
        fullWidth
        className={urbanist.className + " mt-1"}
        onClick={() => {
          dispatch(setStep(1));
        }}
        disabled={name.length < 3 || name.length > 20 || isLoading || isUsed}
      >
        Next
      </Button>
    </>
  );
}
