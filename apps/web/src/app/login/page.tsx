import React, { Suspense } from "react";
import type { Metadata } from "next";
import { LoginIllustration } from "@/components/auth/LoginIllustration";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | BandBloom IELTS",
  description:
    "Sign in to your BandBloom IELTS account to continue your computer-delivered mock test training, AI tutor feedback, and target band preparation.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#BFD8DB] dark:bg-[#0D2523] flex items-center justify-center p-3 sm:p-6 lg:p-10 xl:p-12 transition-colors duration-200">
      {/* Background Soft Glow Accents */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Main Centered Login Card */}
      <main className="relative z-10 w-full max-w-[1260px] min-h-[660px] lg:min-h-[720px] bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl lg:rounded-[28px] shadow-[0_20px_60px_-15px_rgba(18,58,91,0.15)] dark:shadow-none border border-white/80 dark:border-[#205653] overflow-hidden flex flex-col lg:flex-row my-auto">
        {/* Left Column: Branding, Illustration & Tagline (~53% width on desktop) */}
        <div className="w-full lg:w-[53%] p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E8EFF2] dark:border-[#205653] bg-white dark:bg-[#123C3A]">
          <LoginIllustration />
        </div>

        {/* Right Column: Login Form (~47% width on desktop) */}
        <div className="w-full lg:w-[47%] p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center bg-white dark:bg-[#123C3A]">
          <Suspense fallback={<div className="p-8 text-center text-sm text-[#67839A]">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
