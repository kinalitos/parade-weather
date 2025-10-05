import { Flame, Droplets, Wind, CloudRain } from "lucide-react"

export function RiskAssessmentSection() {
  const risks = [
    {
      icon: Flame,
      title: "Extreme Heat",
      description: "Heat stress analysis and vulnerable population impacts",
      color: "from-[hsl(30,48%,74%)]/20 to-[hsl(42,85%,84%)]/20",
      iconBg: "bg-[hsl(30,48%,64%)]/20",
      iconColor: "text-[hsl(30,48%,44%)]",
    },
    {
      icon: Droplets,
      title: "Flood Risk",
      description: "Heavy precipitation and infrastructure threat assessment",
      color: "from-[hsl(217,28%,84%)]/30 to-[hsl(217,28%,74%)]/30",
      iconBg: "bg-[hsl(217,28%,74%)]/30",
      iconColor: "text-[hsl(217,28%,44%)]",
    },
    {
      icon: Wind,
      title: "Wind Damage",
      description: "High wind probability and structural risk evaluation",
      color: "from-[hsl(66,42%,90%)]/40 to-[hsl(66,42%,85%)]/40",
      iconBg: "bg-[hsl(66,42%,85%)]/40",
      iconColor: "text-[hsl(66,42%,50%)]",
    },
    {
      icon: CloudRain,
      title: "Drought Monitoring",
      description: "Water stress and agricultural impact implications",
      color: "from-[hsl(54,100%,94%)]/40 to-[hsl(42,85%,89%)]/40",
      iconBg: "bg-[hsl(54,100%,88%)]/40",
      iconColor: "text-[hsl(51,95%,36%)]",
    },
  ]

  return (
    <section className="py-32 bg-soft-barckgound-2">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-balance">Comprehensive risk assessment</h2>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            Evaluate multiple climate hazards with probabilistic forecasting and scientific accuracy based on
            peer-reviewed models.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {risks.map((risk, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl bg-gradient-to-br ${risk.color} border border-border/40 space-y-4`}
            >
              <div className={`w-12 h-12 rounded-full ${risk.iconBg} flex items-center justify-center`}>
                <risk.icon className={`w-6 h-6 ${risk.iconColor}`} />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">{risk.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{risk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
