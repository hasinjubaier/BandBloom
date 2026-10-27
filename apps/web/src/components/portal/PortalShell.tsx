"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  PlayCircle,
  FileCheck2,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  Bot,
  SpellCheck,
  Bookmark,
  GraduationCap,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Calculator,
  Sun,
  Moon,
  Target,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ScoreCalculatorModal } from "@/components/ui/ScoreCalculatorModal";
import { formatTestType } from "@/lib/dashboard-utils";

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [student, setStudent] = useState<{
    fullName: string;
    email: string;
    targetBand: number;
    testType: string;
    targetDate: string;
  }>({
    fullName: "Learner",
    email: "student@bandbloom.com",
    targetBand: 7.5,
    testType: "academic",
    targetDate: "2026-12-15",
  });

  // Fetch real profile on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data && data.profile) {
          setStudent({
            fullName: data.profile.fullName || "Learner",
            email: data.profile.email || "",
            targetBand: data.profile.targetBand || 7.5,
            testType: data.profile.testType || "academic",
            targetDate: data.profile.targetDate || "2026-12-15",
          });
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json().catch(() => null);

      if (!res.ok || (data && !data.success)) {
        setLogoutError(data?.error || "Failed to sign out cleanly. Please try again.");
        setIsLoggingOut(false);
        return;
      }

      // Respect server redirect destination (defaulting to "/")
      const targetDestination = data?.redirectTo || "/";
      if (typeof window !== "undefined") {
        window.location.href = targetDestination;
      } else {
        router.push(targetDestination);
      }
    } catch {
      setLogoutError("Network error while signing out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  // 14 Core Navigation Items
  const navSections = [
    {
      group: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
        {
          label: "Study Plan",
          href: "/study-plan",
          icon: CalendarCheck,
          active: pathname === "/study-plan",
        },
        {
          label: "Practice Hub",
          href: "/practice",
          icon: PlayCircle,
          active: pathname === "/practice",
        },
        {
          label: "Mock Test Centre",
          href: "/mock-centre",
          icon: FileCheck2,
          active: pathname.startsWith("/mock-centre"),
        },
      ],
    },
    {
      group: "Core IELTS Skills",
      items: [
        {
          label: "Reading",
          href: "/skills/reading",
          icon: BookOpen,
          active: pathname === "/skills/reading",
        },
        {
          label: "Listening",
          href: "/skills/listening",
          icon: Headphones,
          active: pathname === "/skills/listening",
        },
        {
          label: "Writing",
          href: "/skills/writing",
          icon: Edit3,
          active: pathname === "/skills/writing",
        },
        {
          label: "Speaking",
          href: "/skills/speaking",
          icon: Mic,
          active: pathname === "/skills/speaking",
        },
      ],
    },
    {
      group: "AI & Learning Tools",
      items: [
        {
          label: "AI Tutor",
          href: "/tutor",
          icon: Bot,
          active: pathname === "/tutor",
        },
        {
          label: "Vocabulary",
          href: "/vocabulary",
          icon: SpellCheck,
          active: pathname === "/vocabulary",
        },
        {
          label: "Mistake Notebook",
          href: "/notebook",
          icon: Bookmark,
          active: pathname === "/notebook",
        },
        {
          label: "Lessons",
          href: "/lessons",
          icon: GraduationCap,
          active: pathname === "/lessons",
        },
        {
          label: "Results & Progress",
          href: "/results",
          icon: Award,
          active: pathname.startsWith("/results"),
        },
      ],
    },
    {
      group: "Account",
      items: [
        {
          label: "Settings",
          href: "/settings",
          icon: Settings,
          active: pathname === "/settings",
        },
      ],
    },
  ];

  // Derive Current Page Title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Student Dashboard";
    if (pathname === "/study-plan") return "Personalized Study Plan";
    if (pathname === "/practice") return "Adaptive Practice Hub";
    if (pathname.startsWith("/mock-centre")) return "Mock Test Centre";
    if (pathname === "/skills/reading") return "Reading Skill Module";
    if (pathname === "/skills/listening") return "Listening Skill Module";
    if (pathname === "/skills/writing") return "Writing Skill Module";
    if (pathname === "/skills/speaking") return "Speaking Skill Module";
    if (pathname === "/tutor") return "AI Band Tutor";
    if (pathname === "/vocabulary") return "Academic Vocabulary Bank";
    if (pathname === "/notebook") return "Mistake Notebook";
    if (pathname === "/lessons") return "Interactive Lessons";
    if (pathname.startsWith("/results")) return "Diagnostic Results & Progress";
    if (pathname === "/settings") return "Account & Target Settings";
    return "BandBloom IELTS";
  };

  return (
    <div className="min-h-screen bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#123C3A] dark:text-[#F4FAF8] flex flex-col antialiased transition-colors duration-200">
      <div className="flex flex-1 w-full relative">
        {/* ========================================================================= */}
        {/* Desktop Sidebar (Fixed 260px on lg+) */}
        {/* ========================================================================= */}
        <aside
          className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#123C3A] border-r border-[#D4E8E3] dark:border-[#205653] fixed inset-y-0 left-0 z-30 select-none shadow-xs"
          aria-label="Student Portal Navigation"
        >
          {/* Sidebar Top: Logo & Track */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#D4E8E3] dark:border-[#205653]">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded-xl"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Image
                  src="/logo.webp"
                  alt="BandBloom IELTS Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#123C3A] dark:text-[#F4FAF8] leading-tight">
                  Band<span className="text-[#25A995]">Bloom</span>
                </span>
                <span className="text-[10px] tracking-wider text-[#3D6462] dark:text-[#FF8A65] font-semibold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25A995]" />
                  Student Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
            {navSections.map((sec) => (
              <div key={sec.group} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#67839A] dark:text-[#A0C5C1]">
                  {sec.group}
                </div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        item.active
                          ? "bg-[#25A995] text-white shadow-xs shadow-[#25A995]/20 font-bold"
                          : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          item.active ? "text-white" : "text-[#25A995]"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer: Target Band Badge & Logout */}
          <div className="p-3 border-t border-[#D4E8E3] dark:border-[#205653] space-y-2 bg-[#F9FCFB] dark:bg-[#0E2F2D]">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#25A995]/15 flex items-center justify-center text-[#25A995] font-bold text-xs">
                  {student.targetBand.toFixed(1)}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Target Band
                  </div>
                  <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                    {formatTestType(student.testType)}
                  </div>
                </div>
              </div>
              <Target className="w-4 h-4 text-[#25A995]" aria-hidden="true" />
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* Mobile Navigation Drawer (Overlay on < lg) */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Panel */}
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#123C3A] flex flex-col h-full shadow-2xl z-10 border-r border-[#D4E8E3] dark:border-[#205653]">
              <div className="h-16 flex items-center justify-between px-5 border-b border-[#D4E8E3] dark:border-[#205653]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-[#D4E8E3]">
                    <Image
                      src="/logo.webp"
                      alt="BandBloom Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <span className="font-bold text-sm text-[#123C3A] dark:text-[#F4FAF8]">
                    BandBloom IELTS
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#67839A] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {navSections.map((sec) => (
                  <div key={sec.group} className="space-y-1">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#67839A] dark:text-[#A0C5C1]">
                      {sec.group}
                    </div>
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                            item.active
                              ? "bg-[#25A995] text-white shadow-xs font-bold"
                              : "text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-[#D4E8E3] dark:border-[#205653] space-y-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 disabled:opacity-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Main Content Area (Offset by sidebar on desktop) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#123C3A]/95 backdrop-blur-xl border-b border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] truncate">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right: Quick Tools, Target Badge, User Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Target Band Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#174A48] border border-[#25A995]/30 text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                <Target className="w-3.5 h-3.5 text-[#25A995]" />
                <span>Target {student.targetBand.toFixed(1)}</span>
              </div>

              {/* Band Calculator trigger */}
              <button
                onClick={() => setCalcModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-medium text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995] transition-colors"
                title="IELTS Band Rounding Calculator"
              >
                <Calculator className="w-3.5 h-3.5 text-[#25A995]" />
                <span className="hidden md:inline">Calculator</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] transition-colors"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4 text-[#123C3A]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#FF8A65]" />
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                  aria-expanded={userDropdownOpen}
                  aria-label="User profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#25A995] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                    {student.fullName ? student.fullName.charAt(0) : "L"}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] leading-tight">
                      {student.fullName}
                    </span>
                    <span className="text-[10px] text-[#67839A] dark:text-[#A0C5C1] truncate max-w-[120px]">
                      {student.email}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#67839A] hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl shadow-xl py-2 z-50 text-xs animate-fadeIn">
                    <div className="px-4 py-2 border-b border-[#D4E8E3] dark:border-[#205653]">
                      <p className="font-bold text-[#123C3A] dark:text-[#F4FAF8] truncate">
                        {student.fullName}
                      </p>
                      <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] truncate">
                        {student.email}
                      </p>
                    </div>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] text-[#3D6462] dark:text-[#A0C5C1]"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      href="/study-plan"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] text-[#3D6462] dark:text-[#A0C5C1]"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>IELTS Target Band</span>
                    </Link>

                    <div className="border-t border-[#D4E8E3] dark:border-[#205653] my-1" />

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left disabled:opacity-50 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {logoutError && (
              <div
                role="alert"
                className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center justify-between"
              >
                <span>{logoutError}</span>
                <button
                  onClick={() => setLogoutError(null)}
                  className="text-xs font-bold underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>

      {/* Global Band Calculator Modal */}
      <ScoreCalculatorModal
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
      />
    </div>
  );
}
