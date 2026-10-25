"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SKILLS_CONFIG } from "@/data/skillsConfig";
import { GlobeCanvas } from "@/components/globe/GlobeCanvas";
import { GlobeOrbit } from "@/components/globe/GlobeOrbit";
import { SkillOrbitCard } from "@/components/globe/SkillOrbitCard";
import { IELTSModule } from "@/types";

export function InteractiveGlobeSection() {
  const { t } = useLanguage();
  const [activeSkill, setActiveSkill] = useState<IELTSModule | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Check reduced motion & scroll-triggered entrance sequence
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const motionTimer = setTimeout(() => {
        setPrefersReducedMotion(mediaQuery.matches);
      }, 0);

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);

      // Intersection Observer for scroll-triggered entrance
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            }
          });
        },
        { threshold: 0.12 }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => {
        clearTimeout(motionTimer);
        mediaQuery.removeEventListener("change", handleChange);
        observer.disconnect();
      };
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ielts-skills-universe"
      aria-labelledby="globe-section-title"
      className="relative w-full py-16 lg:py-24 min-h-[850px] lg:min-h-[calc(100svh-2rem)] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-transparent via-[#25A995]/5 to-transparent transition-colors duration-300"
    >
      {/* Decorative ambient background glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#25A995]/8 dark:bg-[#25A995]/15 blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#FF8A65]/6 dark:bg-[#FF8A65]/10 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex flex-col items-center">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-10 lg:mb-14 transition-all duration-700 ${
            isVisible || prefersReducedMotion
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#25A995] text-xs font-semibold shadow-xs mb-4">
            <Globe className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
            <span>{t.globeSection.badge}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A65]" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2
            id="globe-section-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#123C3A] dark:text-[#F4FAF8] leading-[1.2] mb-4"
          >
            <span>{t.globeSection.titlePre}</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#25A995] via-[#38bdf8] to-[#FF8A65]">
              {t.globeSection.titleHighlight}
            </span>
          </h2>

          {/* Supporting Text */}
          <p className="text-[#3D6462] dark:text-[#A0C5C1] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t.globeSection.subtitle}
          </p>
        </div>

        {/* =========================================================================
            DESKTOP & TABLET ORBITAL COMPOSITION (lg:flex, hidden on mobile)
        ========================================================================= */}
        <div
          className={`relative w-full max-w-5xl h-[620px] hidden lg:flex items-center justify-center transition-all duration-1000 ${
            isVisible || prefersReducedMotion
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
        >
          {/* Orbital SVG Tracks & Connecting Rays */}
          <GlobeOrbit activeSkill={activeSkill} />

          {/* Centered 3D Earth Globe Canvas */}
          <div className="relative z-10 flex flex-col items-center">
            <GlobeCanvas size={390} />
          </div>

          {/* Four IELTS Skill Cards positioned symmetrically around the globe */}
          {SKILLS_CONFIG.map((skill, index) => (
            <SkillOrbitCard
              key={skill.id}
              skill={skill}
              title={t.globeSection[skill.titleKey]}
              description={t.globeSection[skill.descKey]}
              ctaLabel={t.globeSection.ctaLabel}
              onHover={setActiveSkill}
              variant="desktop"
              index={index}
              isVisible={isVisible}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* =========================================================================
            MOBILE & TABLET CLEAN RESPONSIVE STACK (flex on mobile/tablet, hidden on lg)
        ========================================================================= */}
        <div className="w-full flex flex-col items-center lg:hidden space-y-8">
          {/* Centered Compact 3D Globe */}
          <div className="flex flex-col items-center">
            <GlobeCanvas size={270} />
          </div>

          {/* 4 Skill Cards in a clean, readable 2x2 grid (or 1-col on small screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {SKILLS_CONFIG.map((skill) => (
              <SkillOrbitCard
                key={skill.id}
                skill={skill}
                title={t.globeSection[skill.titleKey]}
                description={t.globeSection[skill.descKey]}
                ctaLabel={t.globeSection.ctaLabel}
                variant="mobile"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
