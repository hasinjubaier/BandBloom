"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

export interface GlobeCanvasProps {
  className?: string;
  size?: number; // Target diameter in px
}

export function GlobeCanvas({ className = "", size = 390 }: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const motionTimer = setTimeout(() => {
        setPrefersReducedMotion(mediaQuery.matches);
      }, 0);

      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => {
        clearTimeout(motionTimer);
        mediaQuery.removeEventListener("change", listener);
      };
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Subtle perspective tilt (max 4 degrees) so labels stay readable
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);
    setTilt({
      x: -normY * 4,
      y: normX * 4,
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
      aria-label="BandBloom Seven Continents 3D Educational Globe"
    >
      {/* Subtle Cyan/Teal Atmospheric Glow */}
      <div
        className="absolute inset-4 rounded-full bg-[#25A995]/15 dark:bg-[#25A995]/25 blur-3xl pointer-events-none transition-opacity duration-700"
        style={{
          opacity: isHovered ? 0.9 : 0.6,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-10 rounded-full bg-[#38bdf8]/10 dark:bg-[#38bdf8]/20 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating Globe Container */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out ${
          prefersReducedMotion ? "" : "animate-[globeFloat_7s_ease-in-out_infinite]"
        }`}
        style={{
          transform: prefersReducedMotion
            ? undefined
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1.0})`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Optimized High-Resolution Seven-Continents 3D Globe with Next/Image */}
        <Image
          src="/BandBloom_Seven_Continents_Globe_8K.webp"
          alt="BandBloom Seven Continents 3D Educational Globe displaying North America, South America, Europe, Africa, Asia, Australia & Oceania, and Antarctica with landmarks"
          width={1024}
          height={1024}
          sizes={`(max-width: 1024px) 270px, ${size}px`}
          className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 drop-shadow-[0_12px_28px_rgba(18,60,58,0.18)] dark:drop-shadow-[0_16px_36px_rgba(0,0,0,0.6)]"
          loading="lazy"
          decoding="async"
        />

        {/* Soft atmospheric perimeter highlight */}
        <div
          className="absolute inset-[1.5%] rounded-full border border-white/20 dark:border-white/10 shadow-[inset_0_0_20px_rgba(37,169,149,0.25)] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Natural Bottom Shadow grounded beneath the globe */}
      <div
        className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-7 bg-radial from-[#123C3A]/25 dark:from-black/50 via-[#123C3A]/10 to-transparent blur-md rounded-full pointer-events-none transition-all duration-300 ${
          prefersReducedMotion ? "" : "animate-[shadowBreathe_7s_ease-in-out_infinite]"
        }`}
        style={{
          transform: `translateX(-50%) scale(${isHovered ? 0.96 : 1.0})`,
        }}
        aria-hidden="true"
      />

      <style jsx>{`
        @keyframes globeFloat {
          0%, 100% {
            transform: translateY(0px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1.0});
          }
          50% {
            transform: translateY(-6px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1.0});
          }
        }
        @keyframes shadowBreathe {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.75;
          }
          50% {
            transform: translateX(-50%) scale(0.94);
            opacity: 0.55;
          }
        }
      `}</style>
    </div>
  );
}
