"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

export const LANDING_SECTION_IDS = [
  "home",
  "how-it-works",
  "free-lessons",
  "weekly-mock-tests",
  "study-plan",
  "ai-tutor",
] as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[number];

export function isPageReload(): boolean {
  if (typeof window === "undefined") return false;

  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0) {
    const navTiming = navEntries[0] as PerformanceNavigationTiming;
    return navTiming.type === "reload";
  }

  const perfNav = (
    window.performance as unknown as { navigation?: { type?: number } }
  )?.navigation;
  if (perfNav && typeof perfNav.type === "number") {
    return perfNav.type === 1;
  }

  return false;
}

export function useLandingNavigation() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [activeSection, setActiveSection] = useState<string>("home");
  const isInitialMount = useRef(true);

  // 1. Calculate active section based on current scroll position
  const calculateActiveSection = useCallback((): string => {
    if (typeof window === "undefined") return "home";

    // Near the top of the page, always anchor to "home"
    if (window.scrollY < 120) {
      return "home";
    }

    // If near the bottom of the document, activate the last section
    const scrollHeight = document.documentElement.scrollHeight;
    const windowBottom = window.innerHeight + window.scrollY;
    if (windowBottom >= scrollHeight - 60) {
      return LANDING_SECTION_IDS[LANDING_SECTION_IDS.length - 1];
    }

    const scrollAnchor = window.scrollY + 180;
    for (let i = LANDING_SECTION_IDS.length - 1; i >= 0; i--) {
      const el = document.getElementById(LANDING_SECTION_IDS[i]);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (scrollAnchor >= top) {
          return LANDING_SECTION_IDS[i];
        }
      }
    }

    return "home";
  }, []);

  // 2. Lifecycle: Handle page reload vs. direct section hash navigation
  useEffect(() => {
    if (!isHomePage) return;

    const reloadDetected = isPageReload();

    if (reloadDetected) {
      // REQUIREMENT C: On real browser reload of landing page:
      // - Disable browser scroll restoration to prevent jump down
      // - Strip stale hash fragment (#ai-tutor) from URL
      // - Scroll cleanly to top (0, 0)
      // - Set active navigation item to Home
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      if (window.location.hash) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", cleanUrl);
      }

      window.scrollTo(0, 0);
      setActiveSection("home");

      const raf = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        setActiveSection("home");
        if ("scrollRestoration" in window.history) {
          window.history.scrollRestoration = "auto";
        }
      });

      return () => cancelAnimationFrame(raf);
    } else {
      // Normal navigation / cross-route navigation
      if (window.location.hash) {
        const targetId = window.location.hash.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth" });
          setActiveSection(targetId);
        }
      } else {
        // Initial active calculation if not at top
        const initialActive = calculateActiveSection();
        setActiveSection(initialActive);
      }
    }
  }, [isHomePage, calculateActiveSection]);

  // 3. Scroll spy: Keep active section synchronized with user's scroll position
  useEffect(() => {
    if (!isHomePage) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const newActive = calculateActiveSection();
          setActiveSection(newActive);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Run once on mount to synchronize
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!isPageReload()) {
        handleScroll();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage, calculateActiveSection]);

  // 4. Action: Navigate to Home
  const handleHomeClick = useCallback(
    (e?: React.MouseEvent) => {
      if (isHomePage) {
        if (e) e.preventDefault();
        // Remove hash fragment while preserving pathname and query params
        if (window.location.hash) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveSection("home");
      } else {
        // Navigating from another route
        setActiveSection("home");
      }
    },
    [isHomePage]
  );

  // 5. Action: Navigate to specific landing section
  const handleSectionClick = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (isHomePage) {
        if (e) e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}#${id}`
          );
          setActiveSection(id);
        }
      } else {
        // From another route, let Next.js link navigate to /#id
        setActiveSection(id);
      }
    },
    [isHomePage]
  );

  return {
    isHomePage,
    activeSection,
    setActiveSection,
    handleHomeClick,
    handleSectionClick,
  };
}
