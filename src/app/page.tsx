import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { NasaDataSection } from "@/components/nasa-data-section"
import { AnalysisModesSection } from "@/components/analysis-modes-section"
import { RiskAssessmentSection } from "@/components/risk-assessment-section"
import { PdfReportsSection } from "@/components/pdf-reports-section"
import { TargetAudiencesSection } from "@/components/target-audiences-section"
import { ImpactExamplesSection } from "@/components/impact-examples-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <NasaDataSection />
      <AnalysisModesSection />
      <RiskAssessmentSection />
      <PdfReportsSection />
      <TargetAudiencesSection />
      <ImpactExamplesSection />
      <CTASection />
      <Footer />
    </main>
  )
}
