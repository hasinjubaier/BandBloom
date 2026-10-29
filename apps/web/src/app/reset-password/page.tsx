"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    if (!token) {
      setErrorMessage(
        "Missing password reset token. Please request a new reset link."
      );
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(
          data?.error ||
            "Unable to reset your password. The link may be expired or already used."
        );
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(data?.redirectTo || "/login");
      }, 2500);
    } catch {
      setErrorMessage(
        "Unable to connect to the authentication service. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-[560px] bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(18,58,91,0.15)] dark:shadow-none border border-white/80 dark:border-[#205653] p-8 sm:p-12 text-left">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus-visible:outline-none"
        >
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
        Set new password
      </h1>
      <p className="text-sm sm:text-base text-[#67839A] dark:text-[#A0C5C1] mt-2 mb-6">
        Create a secure password for your BandBloom account. It must be at least 8 characters.
      </p>

      {/* Missing token alert */}
      {!token && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm space-y-2"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Missing or invalid reset token</span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            This password reset link is incomplete or missing a valid token. Please request a new password recovery link.
          </p>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="inline-flex items-center text-xs font-semibold text-[#159E98] hover:text-[#123A5B] dark:hover:text-white transition-colors"
            >
              Request a new reset link &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccess ? (
        <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm space-y-3">
          <div className="flex items-center gap-2 font-semibold text-base">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Password updated successfully!</span>
          </div>
          <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
            Your password has been changed. You will be redirected to the sign in page in a moment...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-[#159E98] hover:bg-[#12837E] text-white text-sm font-semibold transition-colors"
            >
              Sign in now
            </Link>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="new-password"
              className="block text-xs font-semibold text-[#123A5B] dark:text-[#F4FAF8] uppercase tracking-wider mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading || !token}
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-[#CBD5E1] dark:border-[#205653] bg-white dark:bg-[#0D2523] text-[#123A5B] dark:text-[#F4FAF8] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#159E98] text-sm transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#67839A] hover:text-[#123A5B] dark:hover:text-[#F4FAF8] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold text-[#123A5B] dark:text-[#F4FAF8] uppercase tracking-wider mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                disabled={isLoading || !token}
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-[#CBD5E1] dark:border-[#205653] bg-white dark:bg-[#0D2523] text-[#123A5B] dark:text-[#F4FAF8] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#159E98] text-sm transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#67839A] hover:text-[#123A5B] dark:hover:text-[#F4FAF8] transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token || newPassword.length < 8}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#159E98] hover:bg-[#12837E] active:bg-[#0F6F6B] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(21,158,152,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" aria-hidden="true" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Back to Login */}
      <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-[#205653] flex items-center justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#159E98] hover:text-[#123A5B] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full bg-[#BFD8DB] dark:bg-[#0D2523] flex items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors duration-200">
      <Suspense
        fallback={
          <div className="w-full max-w-[560px] bg-white dark:bg-[#123C3A] rounded-2xl p-12 text-center text-[#67839A]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#159E98]" />
            <p className="mt-3 text-sm">Loading password recovery...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

