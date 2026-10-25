"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export function LoginIllustration() {
  return (
    <div className="flex flex-col justify-between h-full w-full">
      {/* Top: BandBloom IELTS Brand Logo */}
      <div className="flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159E98] rounded-xl p-1 transition-transform hover:scale-[1.02]"
          aria-label="BandBloom IELTS Homepage"
        >
          {/* Logo Icon (Stacked Books + Sprout) */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 relative shrink-0">
            <Image
              src="/logo-icon.webp"
              alt="BandBloom Logo Icon"
              width={96}
              height={80}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* Wordmark: BandBloom and — IELTS — */}
          <div className="flex flex-col justify-center">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-none text-[#123A5B]">
              Band<span className="text-[#159E98]">Bloom</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="h-[1.5px] w-5 bg-[#159E98]/70" aria-hidden="true" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#159E98] uppercase leading-none">
                IELTS
              </span>
              <span className="h-[1.5px] w-5 bg-[#159E98]/70" aria-hidden="true" />
            </div>
          </div>
        </Link>
      </div>

      {/* Middle: Educational Illustration */}
      <div className="my-auto py-6 sm:py-8 flex items-center justify-center">
        <div className="relative w-full max-w-[420px] aspect-[403/247] flex items-center justify-center">
          <Image
            src="/login-illustration.webp"
            alt="International student preparing for IELTS with laptop, headphones, study materials, and globe"
            width={806}
            height={494}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
            className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* Bottom: Tagline */}
      <div className="text-center pt-2 pb-1">
        <h2 className="text-2xl sm:text-[26px] lg:text-[28px] font-bold text-[#123A5B] tracking-tight leading-tight">
          Your IELTS journey starts here.
        </h2>
      </div>
    </div>
  );
}
