"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";

export default function PhoneAuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    try {
      await authApi.requestOtp(phone);
      setStep("otp");
      toast.success("OTP sent to your phone");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = otp.join("");
    if (token.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOtp(phone, token);
      toast.success("Verified successfully!");
      router.push("/chat");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  if (step === "otp") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => setStep("phone")}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center pr-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Verify Phone
            </h1>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Enter the 6-digit code sent to {phone}
        </p>

        <form onSubmit={handleVerifyOtp}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-12 h-14 text-center text-lg font-bold rounded-2xl glass bg-white/40 dark:bg-black/20 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-bruce-500/50 transition-all"
              />
            ))}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Verify Code
          </Button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-3xl p-8 shadow-xl"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-bruce-400 to-bruce-600 flex items-center justify-center mb-4 shadow-lg shadow-bruce-500/25">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Phone Login
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          We&apos;ll send you a verification code
        </p>
      </div>

      <form onSubmit={handleRequestOtp} className="space-y-4">
        <Input
          id="phone"
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" loading={loading} className="w-full mt-2">
          Send Code
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/login"
            className="text-bruce-500 hover:text-bruce-600 font-medium"
          >
            Back to email login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
