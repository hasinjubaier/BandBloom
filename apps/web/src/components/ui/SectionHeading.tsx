import React from "react";

export interface SectionHeadingProps {
  badge?: {
    icon?: React.ElementType;
    label: string;
    subIcon?: React.ElementType;
  };
  titlePre?: string;
  titleHighlight?: string;
  titlePost?: string;
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
}

export function SectionHeading({
  badge,
  titlePre,
  titleHighlight,
  titlePost,
  title,
  subtitle,
  align = "center",
  id,
  className = "",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const BadgeIcon = badge?.icon;
  const BadgeSubIcon = badge?.subIcon;

  return (
    <div className={`max-w-3xl ${alignClass} mb-12 sm:mb-14 ${className}`}>
      {badge && (
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#25A995] text-xs font-semibold shadow-xs mb-4 ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />}
          <span>{badge.label}</span>
          {BadgeSubIcon && <BadgeSubIcon className="w-3.5 h-3.5 text-[#FF8A65]" aria-hidden="true" />}
        </div>
      )}

      {title ? (
        <h2
          id={id}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#123C3A] dark:text-[#F4FAF8] leading-[1.2] mb-3.5"
        >
          {title}
        </h2>
      ) : (
        <h2
          id={id}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#123C3A] dark:text-[#F4FAF8] leading-[1.2] mb-3.5"
        >
          {titlePre && <span>{titlePre} </span>}
          {titleHighlight && (
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#25A995] to-[#FF8A65]">
              {titleHighlight}
            </span>
          )}
          {titlePost && <span> {titlePost}</span>}
        </h2>
      )}

      {subtitle && (
        <p className="text-[#3D6462] dark:text-[#A0C5C1] text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
