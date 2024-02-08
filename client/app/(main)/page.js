"use client";
import {
  Card,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Typography,
  Button,
  CardHeader,
} from "@material-tailwind/react";
import Image from "next/image";
import { Urbanist } from "next/font/google";
import { AtSign, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Info, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import useLuna from "@/hooks/useLuna";
import { updatePubkey, updateUsername } from "@/redux/slice/userSlice";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export default function Page() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  var timeout = null;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemember, setIsRemember] = useState(false);
  const [previousDomain, setPreviousDomain] = useState("");
  const dispatch = useDispatch();
  const { isValidLuna, getLunaAddress } = useLuna();

  const checkLuna = async () => {
    if (domain.length < 4) return;

    const isUsed = await isValidLuna(domain);

    setIsUsed(isUsed);
    setIsLoading(false);
  };

  const manageSignIn = async () => {
    setIsProcessing(true);
    if (isUsed) {
      const lunaAddress = await getLunaAddress(domain);
      dispatch(updatePubkey(lunaAddress));
      dispatch(updateUsername(domain));
      if (isRemember) {
        localStorage.setItem("domain", domain + "@luna");
      }
    }
    setIsProcessing(false);
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
  }, [isTyping, domain]);

  useEffect(() => {
    const previousDomain = localStorage.getItem("domain");

    if (previousDomain) {
      if (previousDomain.length < 3 || !previousDomain.includes("@luna"))
        return;

      setDomain(previousDomain.split("@luna")[0]);
      setPreviousDomain(previousDomain);
      setIsRemember(true);
    }
  }, []);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      <Image
        src="/main/bg.jpg"
        alt="Celestial"
        width={1500}
        height={1080}
        className="absolute -right-1/3 md:-bottom-1/2 -bottom-32"
      />
      <Card className="w-96 shadow-none bg-transparent">
        <CardHeader className="bg-transparent flex justify-center shadow-none">
          <Image
            src="/main/logo.png"
            alt="Celestial"
            width={140}
            height={140}
            className="mb-3"
          />
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {previousDomain && (
            <>
              <p className="text-center font-light">
                Previously logged in with
                {previousDomain && (
                  <span className="font-bold"> {previousDomain}</span>
                )}
              </p>

              <p
                className="font-bold -mt-4 text-blue-500/70 hover:underline hover:cursor-pointer text-center"
                onClick={() => {
                  localStorage.removeItem("domain");
                  setDomain("");
                  setPreviousDomain("");
                  setIsRemember(false);
                }}
              >
                Not you?{" "}
              </p>
            </>
          )}

          <div
            className="flex flex-col w-full"
            style={{
              display: previousDomain ? "none" : "flex",
            }}
          >
            <div className="flex w-full">
              <Input
                label="Domain"
                size="lg"
                className={urbanist.className + " rounded-r-none"}
                labelProps={{
                  className: "after:rounded-tr-none",
                }}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
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
            {isLoading && domain.length > 3 && (
              <p className="mt-2 text-sm flex text-gray-500">
                <Loader2 size={20} className="inline mr-1 animate-spin " />
                Checking availability...
              </p>
            )}

            {domain.length !== 0 && domain.length < 4 && (
              <p className="mt-2 text-sm flex text-gray-500">
                <Info size={20} className="inline mr-1" />
                Enter a valid domain
              </p>
            )}

            {!isLoading && !isUsed && domain.length > 3 && (
              <p className="mt-2 text-sm flex text-red-500">
                <Info size={20} className="inline mr-1" />
                This domain is not registered
              </p>
            )}
          </div>

          {!previousDomain && (
            <div className="-ml-2.5 -my-3">
              <Checkbox
                label="Remember Me"
                value={isRemember}
                onChange={(e) => setIsRemember(e.target.checked)}
              />
            </div>
          )}
        </CardBody>
        <CardFooter className="pt-0 -mt-2">
          <Button
            variant="gradient"
            fullWidth
            className={urbanist.className + " flex items-center justify-center"}
            onClick={() => {
              manageSignIn();
              toast.success("Signed in successfully!");
            }}
            disabled={domain.length < 4 || isLoading || !isUsed || isProcessing}
          >
            {isProcessing ? (
              <Loader2 size={20} className="inline mr-1 animate-spin " />
            ) : (
              "Open Luna"
            )}
          </Button>
          <Typography
            variant="small"
            className={"mt-4 flex justify-center " + urbanist.className}
          >
            Don&apos;t have a Luna?
            <Typography
              as="a"
              href="/signup"
              variant="small"
              color="blue-gray"
              className={"ml-1 font-bold " + urbanist.className}
            >
              Sign up
            </Typography>
          </Typography>
        </CardFooter>
      </Card>
    </div>
  );
}
