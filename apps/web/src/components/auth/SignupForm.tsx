"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function SignupForm() {
  const router = useRouter();

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleInfoMessage, setGoogleInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inline field touched states for smooth feedback
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false);

  // Real-time mismatch check
  const passwordsMismatch =
    touchedConfirmPassword &&
    confirmPassword.length > 0 &&
    password.length > 0 &&
    password !== confirmPassword;

  // Validation
  const validateForm = (): boolean => {
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (trimmedName.length < 2) {
      setErrorMessage("Full name must be at least 2 characters long.");
      return false;
    }

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
      setErrorMessage("Please create a password.");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return false;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      setErrorMessage("Password must contain both letters and numbers.");
      return false;
    }

    if (!confirmPassword) {
      setErrorMessage("Please confirm your password.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please ensure both passwords are identical.");
      return false;
    }

    if (!agreedToTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy to continue.");
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
      // Send registration payload through secure server endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          agreedToTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Registration failed. Please check your information and try again.");
        return;
      }

      setSuccessMessage(data.message || "Account created successfully! Preparing your onboarding...");

      // Store student name in sessionStorage for friendly welcome in onboarding
      if (typeof window !== "undefined") {
        sessionStorage.setItem("bandbloom_new_student_name", fullName.trim());
      }

      setTimeout(() => {
        router.push(data.redirectTo || "/onboarding");
      }, 750);
    } catch {
      setErrorMessage("Network connection error. Please verify your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleSignup = () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setGoogleInfoMessage(null);
    router.push("/api/auth/google?next=/onboarding");
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col justify-center">
      {/* Heading */}
      <div className="mb-5 sm:mb-6 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#123A5B] tracking-tight leading-tight">
          Create your account
        </h1>
        <p className="text-sm sm:text-base lg:text-[18px] text-[#67839A] mt-2 font-normal leading-relaxed">
          Join BandBloom and take the next step towards your IELTS goal.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-2.5 animate-fadeIn"
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
          className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-2.5 animate-fadeIn"
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
          className="mb-4 p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 text-sky-800 dark:text-sky-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{googleInfoMessage}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
        {/* Full Name Field */}
        <div className="space-y-1 text-left">
          <label htmlFor="fullName" className="block text-sm font-semibold text-[#123A5B]">
            Full name
          </label>
          <div className="relative flex items-center">
            <User
              className="w-5 h-5 text-[#8AA4B7] absolute left-4 pointer-events-none transition-colors"
              aria-hidden="true"
            />
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              aria-required="true"
              className="w-full h-[50px] sm:h-[52px] pl-12 pr-4 bg-white border border-[#C9DDE7] rounded-[12px] text-[#123A5B] placeholder:text-[#8AA4B7] text-base focus:outline-none focus:border-[#159E98] focus:ring-2 focus:ring-[#159E98]/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Email Address Field */}
        <div className="space-y-1 text-left">
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
              className="w-full h-[50px] sm:h-[52px] pl-12 pr-4 bg-white border border-[#C9DDE7] rounded-[12px] text-[#123A5B] placeholder:text-[#8AA4B7] text-base focus:outline-none focus:border-[#159E98] focus:ring-2 focus:ring-[#159E98]/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1 text-left">
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              aria-required="true"
              className="w-full h-[50px] sm:h-[52px] pl-12 pr-12 bg-white border border-[#C9DDE7] rounded-[12px] text-[#123A5B] placeholder:text-[#8AA4B7] text-base focus:outline-none focus:border-[#159E98] focus:ring-2 focus:ring-[#159E98]/20 transition-all shadow-2xs"
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

        {/* Confirm Password Field */}
        <div className="space-y-1 text-left">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#123A5B]">
            Confirm password
          </label>
          <div className="relative flex items-center">
            <Lock
              className="w-5 h-5 text-[#8AA4B7] absolute left-4 pointer-events-none transition-colors"
              aria-hidden="true"
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setTouchedConfirmPassword(true);
              }}
              placeholder="Confirm your password"
              required
              aria-required="true"
              className={`w-full h-[50px] sm:h-[52px] pl-12 pr-12 bg-white border rounded-[12px] text-[#123A5B] placeholder:text-[#8AA4B7] text-base focus:outline-none focus:ring-2 transition-all shadow-2xs ${
                passwordsMismatch
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-[#C9DDE7] focus:border-[#159E98] focus:ring-[#159E98]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 p-1 text-[#8AA4B7] hover:text-[#123A5B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] rounded-md transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {passwordsMismatch && (
            <p className="text-xs text-rose-600 mt-1 pl-1">
              Passwords do not match.
            </p>
          )}
        </div>

        {/* Terms of Service & Privacy Policy Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group text-left">
            <input
              type="checkbox"
              id="agreedToTerms"
              name="agreedToTerms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              aria-required="true"
              className="w-4 h-4 mt-0.5 rounded border-[#C9DDE7] text-[#159E98] focus:ring-[#159E98] focus:ring-offset-0 accent-[#159E98] cursor-pointer shrink-0"
            />
            <span className="text-xs sm:text-[13px] text-[#67839A] leading-normal">
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#159E98] hover:text-[#123A5B] underline underline-offset-2 transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#159E98] hover:text-[#123A5B] underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        {/* Primary Create Account Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] sm:h-[52px] rounded-[12px] bg-[#159E98] hover:bg-[#128a85] active:bg-[#0f7a75] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-base shadow-md shadow-[#159E98]/20 transition-all flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] focus-visible:ring-offset-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create account</span>
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

        {/* Alternative Signup Divider */}
        <div className="relative py-1.5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#DDE7ED]" />
          </div>
          <div className="relative bg-white px-3 sm:px-4">
            <span className="text-xs sm:text-[13px] font-medium text-[#8AA4B7]">
              or sign up with
            </span>
          </div>
        </div>

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
          className="w-full h-[50px] sm:h-[52px] rounded-[12px] bg-white hover:bg-[#F9FCFC] active:bg-[#F0F6F7] border border-[#C9DDE7] hover:border-[#8AA4B7] disabled:opacity-70 text-[#123A5B] font-semibold text-sm sm:text-base shadow-2xs transition-all flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] focus-visible:ring-offset-2 cursor-pointer"
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

        {/* Existing Account Link */}
        <p className="pt-1.5 text-center text-sm text-[#67839A]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#159E98] hover:text-[#123A5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] rounded px-1 py-0.5"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
