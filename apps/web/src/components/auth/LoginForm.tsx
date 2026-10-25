"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleInfoMessage, setGoogleInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation
  const validateForm = (): boolean => {
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. learner@example.com).");
      return false;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return false;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGoogleInfoMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Invalid credentials. Please try again.");
        return;
      }

      setSuccessMessage(data.message || "Sign in successful! Redirecting to your dashboard...");
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("bandbloom_remember_email", email.trim());
      }
      setTimeout(() => {
        router.push(data.redirectTo || "/dashboard");
      }, 500);
    } catch {
      setErrorMessage("An unexpected network error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setErrorMessage(null);

    // Simulate provider handshake
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Clear and informative provider status
    setGoogleInfoMessage(
      "Google OAuth is currently unconfigured in this deployment environment. Missing GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET credentials."
    );
    setIsGoogleLoading(false);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col justify-center">
      {/* Heading */}
      <div className="mb-6 lg:mb-8 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#123A5B] tracking-tight leading-tight">
          Welcome back
        </h1>
        <p className="text-base sm:text-lg lg:text-[19px] text-[#67839A] mt-2 font-normal">
          Continue your IELTS preparation
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-2.5 animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google Provider Status Notification */}
      {googleInfoMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 text-sky-800 dark:text-sky-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{googleInfoMessage}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
        {/* Email Address Field */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="email" className="block text-sm font-semibold text-[#123A5B]">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail
              className="w-5 h-5 text-[#8AA4B7] absolute left-4 pointer-events-none transition-colors"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              aria-required="true"
              className="w-full h-[52px] sm:h-[54px] pl-12 pr-4 bg-white border border-[#C9DDE7] rounded-[12px] text-[#123A5B] placeholder:text-[#8AA4B7] text-base focus:outline-none focus:border-[#159E98] focus:ring-2 focus:ring-[#159E98]/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="password" className="block text-sm font-semibold text-[#123A5B]">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock
              className="w-5 h-5 text-[#8AA4B7] absolute left-4 pointer-events-none transition-colors"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              aria-required="true"
              className="w-full h-[52px] sm:h-[54px] pl-12 pr-12 bg-white border border-[#C9DDE7] rounded-[12px] text-[#123A5B] placeholder:text-[#8AA4B7] text-base focus:outline-none focus:border-[#159E98] focus:ring-2 focus:ring-[#159E98]/20 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-1 text-[#8AA4B7] hover:text-[#123A5B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] rounded-md transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me and Forgot Password Row */}
        <div className="flex items-center justify-between pt-0.5 text-sm">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#C9DDE7] text-[#159E98] focus:ring-[#159E98] focus:ring-offset-0 accent-[#159E98] cursor-pointer"
            />
            <span className="text-sm font-medium text-[#67839A] group-hover:text-[#123A5B] transition-colors">
              Remember me
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#159E98] hover:text-[#123A5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] rounded transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Primary Sign In Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] sm:h-[54px] rounded-[12px] bg-[#159E98] hover:bg-[#128a85] active:bg-[#0f7a75] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-base shadow-md shadow-[#159E98]/20 transition-all flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] focus-visible:ring-offset-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <span
                  className="text-lg leading-none transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </>
            )}
          </button>
        </div>

        {/* Alternative Sign-In Divider */}
        <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#DDE7ED]" />
          </div>
          <div className="relative bg-white px-3 sm:px-4">
            <span className="text-xs sm:text-[13px] font-medium text-[#8AA4B7]">
              or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full h-[52px] sm:h-[54px] rounded-[12px] bg-white hover:bg-[#F9FCFC] active:bg-[#F0F6F7] border border-[#C9DDE7] hover:border-[#8AA4B7] disabled:opacity-70 text-[#123A5B] font-semibold text-sm sm:text-base shadow-2xs transition-all flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] focus-visible:ring-offset-2 cursor-pointer"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#159E98]" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Account Creation Link */}
        <p className="pt-2 text-center text-sm text-[#67839A]">
          New to BandBloom?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#159E98] hover:text-[#123A5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] rounded px-1 py-0.5"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
