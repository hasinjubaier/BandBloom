"use client";

import { useState, useEffect, useCallback } from "react";
import { useExam } from "@/context/ExamContext";
import { TargetBand } from "@/types";

export const VALID_TARGET_BANDS: TargetBand[] = [6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

export function useTargetBand() {
  const { profile, updateProfile } = useExam();
  const [selectedTargetBand, setSelectedTargetBand] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncBand = () => {
      const saved = localStorage.getItem("bandbloom_target_band");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && (VALID_TARGET_BANDS as number[]).includes(parsed)) {
          setSelectedTargetBand(parsed);
          return;
        }
      }

      if (
        profile?.targetBand &&
        (VALID_TARGET_BANDS as number[]).includes(profile.targetBand) &&
        localStorage.getItem("bandbloom_has_chosen_goal")
      ) {
        setSelectedTargetBand(profile.targetBand);
      }
    };

    const timer = setTimeout(syncBand, 0);

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ band: number }>;
      if (
        customEvent.detail?.band &&
        (VALID_TARGET_BANDS as number[]).includes(customEvent.detail.band)
      ) {
        setSelectedTargetBand(customEvent.detail.band);
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
      setSelectedTargetBand(band);
      updateProfile({ targetBand: band });
      if (typeof window !== "undefined") {
        localStorage.setItem("bandbloom_target_band", String(band));
        localStorage.setItem("bandbloom_has_chosen_goal", "true");
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
  };
}
