"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  BrainCircuit,
  GraduationCap,
  Calculator,
  Menu,
  X,
  Compass,
  Clock,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { ScoreCalculatorModal } from "@/components/ui/ScoreCalculatorModal";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  const isBn = language === "bn";
  const isHomePage = pathname === "/";

  // Section links matching the actual landing page structure
  const navItems = [
    {
      id: "home",
      href: isHomePage ? "#home" : "/#home",
      label: isBn ? "মূলপাতা" : "Home",
    },
    {
      id: "how-it-works",
      href: isHomePage ? "#how-it-works" : "/#how-it-works",
      label: isBn ? "কীভাবে কাজ করে" : "How It Works",
    },
    {
      id: "free-lessons",
      href: isHomePage ? "#free-lessons" : "/#free-lessons",
      label: isBn ? "লেসন" : "Lessons",
    },
    {
      id: "weekly-mock-tests",
      href: isHomePage ? "#weekly-mock-tests" : "/#weekly-mock-tests",
      label: isBn ? "মক টেস্ট" : "Mock Tests",
    },
    {
      id: "study-plan",
      href: isHomePage ? "#study-plan" : "/#study-plan",
      label: isBn ? "স্টাডি প্ল্যান" : "Study Plan",
    },
    {
      id: "ai-tutor",
      href: isHomePage ? "#ai-tutor" : "/#ai-tutor",
      label: isBn ? "AI গৃহশিক্ষক" : "AI Tutor",
    },
  ];

  // Secondary student tools for mobile drawer
  const studentLinks = [
    { href: "/dashboard", label: t.nav.dashboard, icon: Compass },
    { href: "/study-plan", label: t.nav.studyPlan, icon: Clock },
    { href: "/mock-centre", label: t.nav.mockCentre, icon: GraduationCap },
    { href: "/tutor", label: t.nav.tutor, icon: BrainCircuit },
  ];

  // Track active section as learner scrolls
  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = [
      "home",
      "how-it-works",
      "free-lessons",
      "weekly-mock-tests",
      "study-plan",
      "ai-tutor",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }
      setActiveSection("home");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isActive = (id: string) => {
    if (isHomePage) {
      return activeSection === id;
    }
    return false;
  };

  return (
    <>
      <nav
        className="sticky top-0 z-40 bg-white/95 dark:bg-[#123C3A]/95 backdrop-blur-xl border-b border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] transition-colors duration-200"
        role="navigation"
        aria-label={isBn ? "প্রধান নেভিগেশন" : "Main Navigation"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6 xl:gap-8">
              <Link
                href={isHomePage ? "#home" : "/#home"}
                onClick={() => setActiveSection("home")}
                className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded-xl"
                aria-label={isBn ? "BandBloom মূলপাতা" : "BandBloom Home"}
              >
                <div className="w-9 h-9 rounded-xl bg-[#25A995] flex items-center justify-center text-white shadow-md shadow-[#25A995]/25 group-hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-[#123C3A] dark:text-[#F4FAF8]">
                    Band<span className="text-[#25A995]">Bloom</span>
                  </span>
                  <span className="text-[10px] tracking-wider text-[#3D6462] dark:text-[#FF8A65] font-semibold uppercase -mt-1 flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#25A995] animate-pulse"
                      aria-hidden="true"
                    />
                    IELTS SaaS
                  </span>
                </div>
              </Link>

              {/* Desktop Nav - 6 Landing Page Section Links */}
              <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.id);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setActiveSection(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] ${
                        active
                          ? "bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] border border-[#25A995]/30 font-semibold shadow-2xs"
                          : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]/60"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Controls (Desktop) */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Band Calculator trigger */}
              <button
                onClick={() => setCalcOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-medium text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white hover:border-[#25A995] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                title="IELTS Band Rounding Calculator"
                aria-label={isBn ? "IELTS ব্যান্ড ক্যালকুলেটর" : "IELTS Band Rounding Calculator"}
              >
                <Calculator className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
                <span>{isBn ? "ব্যান্ড ক্যালকুলেটর" : "Band Calc"}</span>
              </button>

              {/* Language Switcher */}
              <div
                className="flex items-center bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] rounded-lg p-0.5 text-xs"
                role="group"
                aria-label="Language selection"
              >
                <button
                  onClick={() => setLanguage("en")}
                  aria-pressed={language === "en"}
                  className={`px-2 py-1 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] ${
                    language === "en"
                      ? "bg-[#25A995] text-white shadow-xs"
                      : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A]"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("bn")}
                  aria-pressed={language === "bn"}
                  className={`px-2 py-1 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] ${
                    language === "bn"
                      ? "bg-[#25A995] text-white shadow-xs"
                      : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A]"
                  }`}
                >
                  বাংলা
                </button>
              </div>

              {/* Theme Toggle (Light / Dark) */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
                aria-label={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4 text-[#123C3A]" aria-hidden="true" />
                ) : (
                  <Sun className="w-4 h-4 text-[#FF8A65]" aria-hidden="true" />
                )}
              </button>

              {/* Start Free Primary CTA */}
              <Link
                href="/onboarding"
                className="px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#25A995]/25 border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
              >
                <span>{isBn ? "ফ্রি শুরু করুন" : "Start Free"}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile / Tablet Controls (< lg) */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4 text-[#123C3A]" aria-hidden="true" />
                ) : (
                  <Sun className="w-4 h-4 text-[#FF8A65]" aria-hidden="true" />
                )}
              </button>

              <button
                onClick={() => setCalcOpen(true)}
                className="p-2 text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                title="Band Calculator"
                aria-label="Open Band Calculator"
              >
                <Calculator className="w-5 h-5 text-[#25A995]" aria-hidden="true" />
              </button>

              <button
                onClick={() => setLanguage(language === "en" ? "bn" : "en")}
                className="px-2 py-1 bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] rounded text-xs font-semibold text-[#25A995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                aria-label="Toggle language"
              >
                {language === "en" ? "বাংলা" : "EN"}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
                aria-label={
                  mobileMenuOpen
                    ? isBn
                      ? "মেনু বন্ধ করুন"
                      : "Close navigation menu"
                    : isBn
                    ? "মেনু খুলুন"
                    : "Open navigation menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-menu"
            className="lg:hidden bg-white/98 dark:bg-[#123C3A]/98 border-b border-[#D4E8E3] dark:border-[#205653] px-4 pt-3 pb-5 space-y-4 shadow-lg backdrop-blur-xl"
          >
            {/* Section links */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#3D6462] dark:text-[#A0C5C1] px-2 mb-2">
                {isBn ? "ল্যান্ডিং পেজ সেকশন" : "Page Sections"}
              </p>
              {navItems.map((item) => {
                const active = isActive(item.id);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] font-semibold"
                        : "text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]/60 hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Start Free Button */}
            <div className="pt-2 border-t border-[#D4E8E3] dark:border-[#205653]">
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-sm font-semibold shadow-md shadow-[#25A995]/25 transition-all"
              >
                <span>{isBn ? "ফ্রি প্রস্তুতি শুরু করুন" : "Start Free Preparation"}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Student Portal Shortcuts */}
            <div className="border-t border-[#D4E8E3] dark:border-[#205653] pt-3 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#FF8A65] px-2 mb-1">
                {isBn ? "স্টুডেন্ট পোর্টাল" : "Student Portal"}
              </p>
              {studentLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] hover:text-[#25A995]"
                >
                  <item.icon className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <ScoreCalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </>
  );
};
