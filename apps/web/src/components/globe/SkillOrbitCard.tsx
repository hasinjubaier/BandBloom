import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SkillCardConfig, IELTSModule } from "@/types";

export interface SkillOrbitCardProps {
  skill: SkillCardConfig;
  title: string;
  description: string;
  ctaLabel: string;
  onHover?: (id: IELTSModule | null) => void;
  variant?: "desktop" | "mobile";
  index?: number;
  isVisible?: boolean;
  prefersReducedMotion?: boolean;
}

export function SkillOrbitCard({
  skill,
  title,
  description,
  ctaLabel,
  onHover,
  variant = "desktop",
  index = 0,
  isVisible = true,
  prefersReducedMotion = false,
}: SkillOrbitCardProps) {
  const Icon = skill.icon;

  if (variant === "desktop") {
    return (
      <div
        className={`absolute z-20 w-64 xl:w-72 ${skill.positionClass} transition-all duration-700 ${
          isVisible || prefersReducedMotion
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
        style={{
          transitionDelay: prefersReducedMotion ? "0ms" : `${250 + index * 120}ms`,
        }}
      >
        <Link
          href={skill.href}
          onMouseEnter={() => onHover?.(skill.id)}
          onMouseLeave={() => onHover?.(null)}
          onFocus={() => onHover?.(skill.id)}
          onBlur={() => onHover?.(null)}
          className={`group relative block p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#DCEBE7] dark:border-[#1E4D4A] ${skill.borderColor} shadow-[0_4px_20px_-4px_rgba(18,60,58,0.06),0_2px_6px_-1px_rgba(18,60,58,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)] ${skill.hoverGlow} transition-all duration-200 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 ${skill.focusRing} focus-visible:ring-offset-2 overflow-hidden`}
          aria-label={`${title} - ${description}`}
        >
          {/* Subtle Colored Top Edge Accent */}
          <div
            className={`absolute top-0 inset-x-0 h-[3px] rounded-t-2xl ${skill.topAccent}`}
            aria-hidden="true"
          />

          <div className="flex items-center gap-3.5 mb-2.5 pt-0.5">
            <div
              className={`w-10 h-10 rounded-xl ${skill.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-200`}
            >
              <Icon className={`w-5 h-5 ${skill.accentColor}`} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] transition-colors duration-200">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-3.5">
            {description}
          </p>

          <div className={`flex items-center gap-1.5 text-xs font-bold ${skill.ctaColor}`}>
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" aria-hidden="true" />
          </div>
        </Link>
      </div>
    );
  }

  // Mobile layout
  return (
    <Link
      href={skill.href}
      className={`group relative block p-4 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#DCEBE7] dark:border-[#1E4D4A] ${skill.borderColor} shadow-[0_4px_16px_-4px_rgba(18,60,58,0.06)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] ${skill.hoverGlow} transition-all duration-200 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 ${skill.focusRing} overflow-hidden`}
      aria-label={`${title} - ${description}`}
    >
      <div
        className={`absolute top-0 inset-x-0 h-[3px] rounded-t-2xl ${skill.topAccent}`}
        aria-hidden="true"
      />

      <div className="flex items-center gap-3 mb-2.5 pt-0.5">
        <div
          className={`w-9 h-9 rounded-xl ${skill.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
        >
          <Icon className={`w-4.5 h-4.5 ${skill.accentColor}`} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            {title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-3">
        {description}
      </p>

      <div className={`flex items-center gap-1.5 text-xs font-bold ${skill.ctaColor}`}>
        <span>{ctaLabel}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" aria-hidden="true" />
      </div>
    </Link>
  );
}
