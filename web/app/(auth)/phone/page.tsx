"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Phone, ArrowRight, Shield, ArrowLeft, MessageCircle } from "lucide-react";
import { auth, RecaptchaVerifier } from "@/lib/firebase";
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { createClient } from "@/lib/supabase/client";

export default function PhoneAuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaRef.current?.hasChildNodes()) {
      const w = window as unknown as Record<string, unknown>;
      w.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      const verifier = (window as unknown as Record<string, unknown>).recaptchaVerifier as RecaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmation(result);
      setStep("otp");
      toast.success("Code sent to your phone");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send code";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6 || !confirmation) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmation.confirm(token);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "token",
        token: idToken,
      });
      if (error) throw error;

      toast.success("Verified!");
      router.push("/chat");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code";
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
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-bruce-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-bruce-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-strong rounded-[2rem] p-8 sm:p-10 shadow-float relative overflow-hidden">
        <div id="recaptcha-container" />

        <AnimatePresence mode="wait">
          {step === "otp" ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setStep("phone")}
                  className="p-2 -ml-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex-1 text-center pr-8">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Verify Phone
                  </h1>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center shadow-glow">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                Enter the 6-digit code sent to
                <br />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {phone}
                </span>
              </p>

              <form onSubmit={handleVerifyOtp}>
                <div className="flex justify-center gap-2.5 mb-6">
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
                      className="w-12 h-14 text-center text-lg font-bold rounded-2xl bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-bruce-500/30 focus:border-bruce-400 transition-all duration-200"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-bruce-400 to-bruce-700 flex items-center justify-center mb-4 shadow-glow">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Phone Login
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                  We&apos;ll send you a free verification code
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-bruce-500 transition-colors" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-glass pl-11"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-bruce-500 hover:text-bruce-600 font-medium transition-colors"
                >
                  Back to email login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
