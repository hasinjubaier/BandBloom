import React from "react";
import Link from "next/link";
import { ChevronRight, Layers, Award } from "lucide-react";
import { SkillCardConfig } from "@/types";

export interface SkillCardProps {
  skill: SkillCardConfig;
  title: string;
  description: string;
  ctaText: string;
  isBn?: boolean;
}

export function SkillCard({
  skill,
  title,
  description,
  ctaText,
  isBn = false,
}: SkillCardProps) {
  const Icon = skill.icon;

  return (
    <div
      className={`bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] ${skill.borderColor} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden`}
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 inset-x-0 h-[3px] ${skill.topAccent}`} aria-hidden="true" />

      <div>
        {/* Top Header with Icon and Exercise Count Badge */}
        <div className="flex items-center justify-between mb-5">
          <div
            className={`w-12 h-12 rounded-xl ${skill.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs`}
          >
            <Icon className={`w-6 h-6 ${skill.accentColor}`} aria-hidden="true" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1]">
            <Layers className="w-3 h-3 text-[#25A995]" aria-hidden="true" />
            <span>{skill.exerciseCount}+ {isBn ? "অনুশীলন" : "Exercises"}</span>
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-2 group-hover:text-[#25A995] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-4">
          {description}
        </p>

        {/* Distinct Feature: Practice Modes & Focus Topics */}
        <div className="space-y-1.5 mb-5 pt-3 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
          <div className="text-[11px] font-semibold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
            <span>{isBn ? "প্রধান মডিউল ফোকাস:" : "Key Lab Focus:"}</span>
          </div>
          <ul className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] space-y-1 pl-1">
            {skill.keyTopics.slice(0, 2).map((topic, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[#25A995] font-bold">•</span>
                <span className="truncate">{isBn ? topic.bn : topic.en}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lab CTA Link */}
      <Link
        href={skill.href}
        className={`inline-flex items-center justify-between gap-1.5 text-xs font-bold ${skill.ctaColor} pt-3 border-t border-[#D4E8E3] dark:border-[#205653] hover:opacity-85 transition-opacity`}
      >
        <span>{ctaText}</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
      </Link>
    </div>
  );
}
