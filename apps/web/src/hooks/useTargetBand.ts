"use client";

import { useState, useEffect, useCallback } from "react";
import { useExam } from "@/context/ExamContext";
import { TargetBand } from "@/types";

export const VALID_TARGET_BANDS: readonly TargetBand[] = [6.5, 7.0, 7.5, 8.0, 8.5, 9.0] as const;

export function useTargetBand() {
  const { profile, updateProfile } = useExam();
  const [selectedTargetBand, setSelectedTargetBand] = useState<number | null>(null);
  const [isUnsupported, setIsUnsupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncBand = () => {
      // 1. If authenticated and profile has a targetBand, it is authoritative
      if (profile?.targetBand !== undefined && profile.targetBand !== null) {
        if ((VALID_TARGET_BANDS as readonly number[]).includes(profile.targetBand)) {
          setSelectedTargetBand(profile.targetBand);
          setIsUnsupported(false);
          localStorage.setItem("bandbloom_target_band", String(profile.targetBand));
          return;
        } else {
          // Unsupported value stored in profile - do not silently rewrite
          setSelectedTargetBand(null);
          setIsUnsupported(true);
          return;
        }
      }

      // 2. Anonymous visitor - read choice from localStorage
      const saved = localStorage.getItem("bandbloom_target_band");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && (VALID_TARGET_BANDS as readonly number[]).includes(parsed)) {
          setSelectedTargetBand(parsed);
          setIsUnsupported(false);
          return;
        } else {
          // Unsupported value in localStorage - do not silently rewrite
          setSelectedTargetBand(null);
          setIsUnsupported(true);
          return;
        }
      }

      setSelectedTargetBand(null);
      setIsUnsupported(false);
    };

    const timer = setTimeout(syncBand, 0);

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ band: number }>;
      const band = customEvent.detail?.band;
      if (
        band &&
        (VALID_TARGET_BANDS as readonly number[]).includes(band)
      ) {
        setSelectedTargetBand(band);
        setIsUnsupported(false);
      } else {
        syncBand();
      }
    };

    window.addEventListener("bandbloom:target_band_changed", handleCustomChange);
    window.addEventListener("storage", syncBand);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("bandbloom:target_band_changed", handleCustomChange);
      window.removeEventListener("storage", syncBand);
    };
  }, [profile?.targetBand]);

  const selectBand = useCallback(
    (band: number) => {
      if (!(VALID_TARGET_BANDS as readonly number[]).includes(band as TargetBand)) {
        console.warn(`[useTargetBand] Unsupported band rejected: ${band}`);
        setIsUnsupported(true);
        return;
      }
      setSelectedTargetBand(band);
      setIsUnsupported(false);
      updateProfile({ targetBand: band });
      if (typeof window !== "undefined") {
        localStorage.setItem("bandbloom_target_band", String(band));
        window.dispatchEvent(
          new CustomEvent("bandbloom:target_band_changed", { detail: { band } })
        );
      }
    },
    [updateProfile]
  );

  return {
    selectedTargetBand,
    availableBands: VALID_TARGET_BANDS,
    selectBand,
    isUnsupported,
  };
}
