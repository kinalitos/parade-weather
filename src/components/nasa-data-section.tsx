import { Layers } from "lucide-react"

export function NasaDataSection() {
  const dataSources = [
    {
      name: "MODIS Terra/Aqua",
      description: "Land surface temperature and vegetation indices",
      resolution: "250m - 1km",
    },
    {
      name: "VIIRS",
      description: "High-resolution true color imagery and night lights",
      resolution: "375m - 750m",
    },
    {
      name: "GPM",
      description: "Global precipitation measurements",
      resolution: "10km",
    },
    {
      name: "OMI",
      description: "Atmospheric composition and air quality",
      resolution: "13km x 24km",
    },
    {
      name: "NASA POWER API",
      description: "Historical climate data and projections (1981-2024)",
      resolution: "0.5° x 0.5°",
    },
    {
      name: "NASA Worldview",
      description: "Real-time satellite imagery integration",
      resolution: "Variable",
    },
  ]

  return (
    <section id="nasa-data" className="py-32 bg-[hsl(42,85%,93%)]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Layers className="w-4 h-4" />
            NASA Satellite Integration
          </div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-balance">
            Multi-layer Earth observation data
          </h2>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            Access 8+ different NASA data sources with resolutions from 250m to 24km for comprehensive climate analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {dataSources.map((source, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-[hsl(66,42%,95%)] border border-border/40 hover:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{source.name}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{source.resolution}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{source.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
