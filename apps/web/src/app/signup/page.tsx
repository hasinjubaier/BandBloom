"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // Direct new learners seamlessly into the customized IELTS onboarding experience
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#BFD8DB] dark:bg-[#0D2523] flex items-center justify-center p-4">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-3 border-[#159E98] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-[#123A5B] dark:text-[#F4FAF8]">
          Redirecting to BandBloom onboarding...
        </p>
      </div>
    </div>
  );
}
