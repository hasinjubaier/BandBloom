import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveGlobeSection } from "@/components/landing/InteractiveGlobeSection";
import { SkillLabsSection } from "@/components/landing/SkillLabsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FreeLessonsSection } from "@/components/landing/FreeLessonsSection";
import { WeeklyMockTestsSection } from "@/components/landing/WeeklyMockTestsSection";
import { StudyPlanProgressSection } from "@/components/landing/StudyPlanProgressSection";
import { ComputerDeliveredSection } from "@/components/landing/ComputerDeliveredSection";
import { AITutorFeedbackSection } from "@/components/landing/AITutorFeedbackSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20 pb-24">
      <HeroSection />
      <InteractiveGlobeSection />
      <SkillLabsSection />
      <HowItWorksSection />
      <FreeLessonsSection />
      <WeeklyMockTestsSection />
      <StudyPlanProgressSection />
      <ComputerDeliveredSection />
      <AITutorFeedbackSection />
      <FinalCTASection />
    </div>
  );
}
