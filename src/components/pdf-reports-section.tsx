import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PdfReportsSection() {
  const reportTypes = [
    {
      name: "Executive Summary",
      theme: "Purple",
      description: "High-level strategic insights for leadership and decision-makers",
      features: ["Risk level indicators", "Key metrics summary", "Strategic recommendations"],
    },
    {
      name: "Technical Assessment",
      theme: "Blue",
      description: "Detailed scientific analysis for researchers and technical teams",
      features: ["NASA source attribution", "Statistical tables", "Trend analysis"],
    },
    {
      name: "Community Report",
      theme: "Red",
      description: "Climate justice focus for community leaders and advocacy groups",
      features: ["Vulnerable populations", "Infrastructure risks", "Action plans"],
    },
    {
      name: "Agricultural Analysis",
      theme: "Green",
      description: "Food security insights for farming stakeholders and planners",
      features: ["Crop suitability scores", "Seasonal recommendations", "Yield projections"],
    },
  ]

  return (
    <section id="reports" className="py-32 bg-soft-background-3">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Professional Reporting
          </div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-balance">Enterprise-grade PDF reports</h2>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            Generate publication-quality reports in seconds with NASA-inspired design and comprehensive data
            visualization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {reportTypes.map((report, index) => (
            <div key={index} className="p-8 rounded-2xl bg-background-5 border border-border/40 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-medium">{report.name}</h3>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{report.theme}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
              <ul className="space-y-2">
                {report.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
