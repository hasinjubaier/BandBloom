import type { Metadata } from "next";
import { SignupIllustration } from "@/components/auth/SignupIllustration";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create an Account | BandBloom IELTS",
  description:
    "Join BandBloom and take the next step towards your IELTS goal. Prepare with authentic computer-delivered mock tests, personalized AI tutor feedback, and structured band score preparation.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full bg-[#BFD8DB] dark:bg-[#0D2523] flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-10 transition-colors duration-200">
      {/* Background Soft Glow Accents */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Main Centered Signup Card */}
      <main className="relative z-10 w-full max-w-[1320px] min-h-[700px] lg:min-h-[760px] bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl lg:rounded-[28px] shadow-[0_20px_60px_-15px_rgba(18,58,91,0.15)] dark:shadow-none border border-white/80 dark:border-[#205653] overflow-hidden flex flex-col lg:flex-row my-auto">
        {/* Left Column: Branding, Educational Illustration & Supporting Message (~52% width) */}
        <div className="w-full lg:w-[52%] p-6 sm:p-8 lg:p-12 xl:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E8EFF2] dark:border-[#205653] bg-white dark:bg-[#123C3A]">
          <SignupIllustration />
        </div>

        {/* Right Column: Complete Registration Form (~48% width) */}
        <div className="w-full lg:w-[48%] p-6 sm:p-8 lg:p-12 xl:p-14 flex flex-col justify-center bg-white dark:bg-[#123C3A]">
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
