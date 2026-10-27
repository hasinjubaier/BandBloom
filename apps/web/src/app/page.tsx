import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FreeLessonsSampleSection } from "@/components/landing/FreeLessonsSampleSection";
import { MidpointCTASection } from "@/components/landing/MidpointCTASection";
import { WeeklyMockTestsSection } from "@/components/landing/WeeklyMockTestsSection";
import { StudyPlanProgressSection } from "@/components/landing/StudyPlanProgressSection";
import { AITutorFeedbackSection } from "@/components/landing/AITutorFeedbackSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";

export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen landing-grid-container overflow-hidden">
      {/* Decorative Subtle Glowing Grid Background Layer */}
      <div className="landing-glow-layer" aria-hidden="true">
        {/* Soft Ambient Luminous Glow Blooms */}
        <div className="landing-glow-top" />
        <div className="landing-glow-mid-right" />
        <div className="landing-glow-mid-left" />
        <div className="landing-glow-bottom" />
        {/* Continuous Soft Grid Pattern */}
        <div className="landing-grid-pattern" />
        {/* Subtle Edge Tonal Variation */}
        <div className="landing-grid-vignette" />
      </div>

      {/* Foreground Landing Content */}
      <div className="relative z-10 flex flex-col gap-20 pb-24">
        <HeroSection />
        <HowItWorksSection />
        <FreeLessonsSampleSection />
        <MidpointCTASection />
        <WeeklyMockTestsSection />
        <StudyPlanProgressSection />
        <AITutorFeedbackSection />
        <FinalCTASection />
      </div>
    </div>
  );
}

