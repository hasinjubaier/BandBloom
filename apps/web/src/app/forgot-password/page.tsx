"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(data?.error || "Unable to send recovery instructions. Please try again later.");
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage("Unable to connect to the authentication service. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#BFD8DB] dark:bg-[#0D2523] flex items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors duration-200">
      <main className="w-full max-w-[560px] bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(18,58,91,0.15)] dark:shadow-none border border-white/80 dark:border-[#205653] p-8 sm:p-12 text-left">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group focus-visible:outline-none">
            <div className="w-10 h-10 relative shrink-0">
              <Image
                src="/logo-icon.webp"
                alt="BandBloom Logo Icon"
                width={80}
                height={66}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight leading-none text-[#123A5B] dark:text-[#F4FAF8]">
                Band<span className="text-[#159E98]">Bloom</span>
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-[1.5px] w-4 bg-[#159E98]" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#159E98] uppercase leading-none">
                  IELTS
                </span>
                <span className="h-[1.5px] w-4 bg-[#159E98]" aria-hidden="true" />
              </div>
            </div>
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#123A5B] dark:text-[#F4FAF8] tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm sm:text-base text-[#67839A] dark:text-[#A0C5C1] mt-2 mb-6">
          Enter the email address associated with your BandBloom account and we will send you a secure link to reset your password.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <span>Password reset instructions sent</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
              If an account matches <span className="font-semibold">{email}</span>, you will receive password reset instructions shortly. Please check your inbox and spam folder.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#159E98] hover:text-[#123A5B] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="recovery-email" className="block text-sm font-semibold text-[#123A5B] dark:text-[#F4FAF8]">
                Email address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-5 h-5 text-[#8AA4B7] absolute left-4 pointer-events-none" aria-hidden="true" />
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full h-[52px] pl-12 pr-4 bg-white border border-[#C9DDE7] rounded-[12px] text-[#123A5B] placeholder:text-[#8AA4B7] text-base focus:outline-none focus:border-[#159E98] focus:ring-2 focus:ring-[#159E98]/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] rounded-[12px] bg-[#159E98] hover:bg-[#128a85] active:bg-[#0f7a75] disabled:opacity-70 text-white font-semibold text-base shadow-md shadow-[#159E98]/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <span>Send reset link →</span>
              )}
            </button>

            <div className="pt-3 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#67839A] hover:text-[#123A5B] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
