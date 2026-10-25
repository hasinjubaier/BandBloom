import React from "react";

export type IELTSModule = "reading" | "listening" | "writing" | "speaking";

export interface SkillCardConfig {
  id: IELTSModule;
  titleKey: "readingTitle" | "listeningTitle" | "writingTitle" | "speakingTitle";
  descKey: "readingDesc" | "listeningDesc" | "writingDesc" | "speakingDesc";
  icon: React.ElementType;
  href: string;
  accentColor: string;
  iconBg: string;
  borderColor: string;
  hoverGlow: string;
  topAccent: string;
  ctaColor: string;
  focusRing: string;
  orbitPosition: "top" | "right" | "bottom" | "left";
  positionClass: string;
  // Lab-specific enrichment
  exerciseCount: number;
  practiceModes: string[];
  levels: string[];
  keyTopics: { en: string; bn: string }[];
}

export type TargetBand = 6.5 | 7.0 | 7.5 | 8.0 | 8.5;
