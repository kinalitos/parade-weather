import { MapPin, Map } from "lucide-react"

export function AnalysisModesSection() {
  return (
    <section className="py-32 bg-soft-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-balance">Flexible analysis modes</h2>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            Choose between point-specific or regional analysis to match your assessment needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-[hsl(30,48%,74%)]/20 to-[hsl(42,85%,84%)]/20 border border-border/40 space-y-6">
            <div className="w-14 h-14 rounded-full bg-[hsl(30,48%,64%)]/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-[hsl(30,48%,54%)]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-medium">Point Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pinpoint climate risks for specific locations with precise coordinates. Perfect for site-specific
                assessments and local planning.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(30,48%,54%)]" />
                Exact location targeting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(30,48%,54%)]" />
                Historical trend analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(30,48%,54%)]" />
                Future risk projections
              </li>
            </ul>
          </div>

          <div className="p-10 rounded-2xl bg-gradient-to-br from-[hsl(217,28%,74%)]/30 to-[hsl(66,42%,85%)]/30 border border-border/40 space-y-6">
            <div className="w-14 h-14 rounded-full bg-[hsl(217,28%,74%)]/30 flex items-center justify-center">
              <Map className="w-7 h-7 text-[hsl(217,28%,54%)]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-medium">Regional Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive assessment for geographic areas. Draw custom regions or select administrative boundaries
                for broad impact studies.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(217,28%,54%)]" />
                Custom area selection
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(217,28%,54%)]" />
                Population impact analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(217,28%,54%)]" />
                Infrastructure vulnerability
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
