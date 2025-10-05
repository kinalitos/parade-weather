import { Card } from "@/components/ui/card"
import { Shield, Wheat, FileText } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Climate Justice Dashboard",
    description:
      "Identifies vulnerable populations at risk and provides infrastructure risk assessment with actionable adaptation strategies.",
  },
  {
    icon: Wheat,
    title: "Agricultural Impact Intelligence",
    description:
      "Crop-specific analysis with detailed suitability scores and seasonal action plans for climate-smart agriculture.",
  },
  {
    icon: FileText,
    title: "Professional PDF Reports",
    description:
      "Enterprise-grade reports with NASA-inspired design, publication-quality visualizations, and customizable templates.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 bg-popover">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-balance">
            Transform NASA data into action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Comprehensive climate analysis platform combining satellite data with social vulnerability and food security
            insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-card border-border/50 hover:border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
