import { Building2, Users, Tractor, GraduationCap, Shield } from "lucide-react"

export function TargetAudiencesSection() {
  const audiences = [
    {
      icon: Building2,
      title: "Government Agencies",
      description: "Emergency planning, climate adaptation strategies, and policy development",
    },
    {
      icon: Users,
      title: "NGOs & Communities",
      description: "Vulnerable population protection and community resilience programs",
    },
    {
      icon: Tractor,
      title: "Agricultural Sector",
      description: "Crop planning, food security assessments, and farming optimization",
    },
    {
      icon: GraduationCap,
      title: "Research Institutions",
      description: "Climate impact studies, academic research, and scientific analysis",
    },
    {
      icon: Shield,
      title: "Insurance Companies",
      description: "Risk assessment, premium modeling, and actuarial analysis",
    },
  ]

  return (
    <section className="py-32 bg-background-4">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-balance">
            Built for multiple stakeholders
          </h2>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            Serving diverse organizations with tailored insights for their specific climate analysis needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {audiences.slice(0, 3).map((audience, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-card3 border border-border/40 space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <audience.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">{audience.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{audience.description}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-6">
          {audiences.slice(3).map((audience, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-card3 border border-border/40 space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <audience.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">{audience.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{audience.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
