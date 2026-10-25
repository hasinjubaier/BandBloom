import React from "react";
import { IELTSModule } from "@/types";

export interface GlobeOrbitProps {
  activeSkill: IELTSModule | null;
}

export function GlobeOrbit({ activeSkill }: GlobeOrbitProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      viewBox="0 0 1024 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#25A995" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF8A65" stopOpacity="0.35" />
        </linearGradient>

        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#25A995" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#25A995" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Orbit Ellipse */}
      <ellipse
        cx="512"
        cy="310"
        rx="410"
        ry="240"
        stroke="url(#orbitGrad)"
        strokeWidth="1.5"
        strokeDasharray="6 8"
        className="opacity-70"
      />

      {/* Inner Atmospheric Orbit Ellipse */}
      <ellipse
        cx="512"
        cy="310"
        rx="260"
        ry="160"
        stroke="#25A995"
        strokeWidth="1"
        strokeDasharray="4 6"
        className="opacity-40"
      />

      {/* Connecting Lines from Center/Orbit to 4 Cardinal Points */}
      {/* Top Node (Reading) */}
      <line
        x1="512"
        y1="190"
        x2="512"
        y2="105"
        stroke={activeSkill === "reading" ? "#3B82F6" : "#25A995"}
        strokeWidth={activeSkill === "reading" ? "2.5" : "1.5"}
        strokeDasharray={activeSkill === "reading" ? "none" : "3 4"}
        className="transition-all duration-300 opacity-60"
      />
      <circle
        cx="512"
        cy="105"
        r={activeSkill === "reading" ? "6" : "4"}
        fill={activeSkill === "reading" ? "#3B82F6" : "#25A995"}
        className="transition-all duration-300"
      />

      {/* Right Node (Listening) */}
      <line
        x1="630"
        y1="310"
        x2="745"
        y2="310"
        stroke={activeSkill === "listening" ? "#F59E0B" : "#25A995"}
        strokeWidth={activeSkill === "listening" ? "2.5" : "1.5"}
        strokeDasharray={activeSkill === "listening" ? "none" : "3 4"}
        className="transition-all duration-300 opacity-60"
      />
      <circle
        cx="745"
        cy="310"
        r={activeSkill === "listening" ? "6" : "4"}
        fill={activeSkill === "listening" ? "#F59E0B" : "#25A995"}
        className="transition-all duration-300"
      />

      {/* Bottom Node (Writing) */}
      <line
        x1="512"
        y1="430"
        x2="512"
        y2="515"
        stroke={activeSkill === "writing" ? "#8B5CF6" : "#25A995"}
        strokeWidth={activeSkill === "writing" ? "2.5" : "1.5"}
        strokeDasharray={activeSkill === "writing" ? "none" : "3 4"}
        className="transition-all duration-300 opacity-60"
      />
      <circle
        cx="512"
        cy="515"
        r={activeSkill === "writing" ? "6" : "4"}
        fill={activeSkill === "writing" ? "#8B5CF6" : "#25A995"}
        className="transition-all duration-300"
      />

      {/* Left Node (Speaking) */}
      <line
        x1="394"
        y1="310"
        x2="280"
        y2="310"
        stroke={activeSkill === "speaking" ? "#FF8A65" : "#25A995"}
        strokeWidth={activeSkill === "speaking" ? "2.5" : "1.5"}
        strokeDasharray={activeSkill === "speaking" ? "none" : "3 4"}
        className="transition-all duration-300 opacity-60"
      />
      <circle
        cx="280"
        cy="310"
        r={activeSkill === "speaking" ? "6" : "4"}
        fill={activeSkill === "speaking" ? "#FF8A65" : "#25A995"}
        className="transition-all duration-300"
      />
    </svg>
  );
}
