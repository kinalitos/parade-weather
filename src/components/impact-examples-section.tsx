import { MapPin, Wheat, Building } from "lucide-react"

export function ImpactExamplesSection() {
  const examples = [
    {
      icon: MapPin,
      title: "Community Protection",
      location: "Miami, Florida",
      impact:
        "Officials identify heat-vulnerable neighborhoods and plan cooling center locations based on risk maps. Community leaders develop targeted outreach programs.",
      metrics: ["15+ neighborhoods assessed", "3 cooling centers planned", "5,000+ residents protected"],
    },
    {
      icon: Wheat,
      title: "Food Security",
      location: "Iowa Agricultural Region",
      impact:
        "Farmers optimize planting schedules using crop suitability analysis. Food security organizations assess drought risks for vulnerable regions.",
      metrics: ["20% yield improvement", "30-day early warnings", "500+ farms supported"],
    },
    {
      icon: Building,
      title: "Policy Development",
      location: "Urban Planning Departments",
      impact:
        "City planners use vulnerability assessments for infrastructure investment. Climate adaptation funds prioritize communities using risk scores.",
      metrics: ["$50M+ allocated", "10 cities engaged", "100K+ residents impacted"],
    },
  ]

  return (
    <section id="impact" className="py-32 bg-[hsl(66,42%,90%)]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-balance">Real-world impact stories</h2>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            See how organizations worldwide are using Climate Forecast Pro to protect communities and build resilience.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {examples.map((example, index) => (
            <div key={index} className="p-8 rounded-2xl bg-[hsl(42,85%,89%)] border border-border/40 space-y-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <example.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xl font-medium">{example.title}</h3>
                  <p className="text-sm text-muted-foreground">{example.location}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{example.impact}</p>
              </div>
              <div className="pt-4 border-t border-border/40 space-y-2">
                {example.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
