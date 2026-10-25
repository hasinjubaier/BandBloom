"use client";

import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SKILLS_CONFIG } from "@/data/skillsConfig";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillCard } from "@/components/ui/SkillCard";

export function SkillLabsSection() {
  const { language, t } = useLanguage();
  const isBn = language === "bn";

  return (
    <section id="skill-labs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20">
      <SectionHeading
        badge={{
          icon: BookOpen,
          label: isBn ? "ইন্টারেক্টিভ লার্নিং ল্যাবস" : "Interactive Skill Labs",
          subIcon: Sparkles,
        }}
        title={t.features.heading}
        subtitle={t.features.subheading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SKILLS_CONFIG.map((skill) => {
          let ctaText = "Open Lab";
          if (skill.id === "reading") ctaText = isBn ? "রিডিং ল্যাব শুরু করুন" : "Open Reading Lab";
          if (skill.id === "listening") ctaText = isBn ? "লিসেনিং ল্যাব শুরু করুন" : "Open Listening Lab";
          if (skill.id === "writing") ctaText = isBn ? "রাইটিং ল্যাব শুরু করুন" : "Open Writing Lab";
          if (skill.id === "speaking") ctaText = isBn ? "স্পিকিং ল্যাব শুরু করুন" : "Open Speaking Lab";

          return (
            <SkillCard
              key={skill.id}
              skill={skill}
              title={t.features[skill.titleKey]}
              description={t.features[skill.descKey]}
              ctaText={ctaText}
              isBn={isBn}
            />
          );
        })}
      </div>
    </section>
  );
}
