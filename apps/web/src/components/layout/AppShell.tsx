"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { DisclaimerBanner } from "./DisclaimerBanner";

export interface AppShellProps {
  children: React.ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
  const pathname = usePathname();
  const isExamRoute = pathname?.startsWith("/mock-centre/exam");

  // In full-screen CD-IELTS computer exam simulation, render a distraction-free layout
  // with no marketing Navbar, no DisclaimerBanner, and no marketing Footer.
  if (isExamRoute) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <DisclaimerBanner />
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <div className="h-9 bg-[#FFF6F3] dark:bg-[#0A1C1B] border-b border-[#FF8A65]/30" />
          <div className="h-16 bg-white dark:bg-[#123C3A] border-b border-[#D4E8E3] dark:border-[#205653]" />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      }
    >
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
