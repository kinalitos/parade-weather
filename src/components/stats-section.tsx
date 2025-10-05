export function StatsSection() {
  const stats = [
    { value: "8+", label: "NASA data sources" },
    { value: "250m", label: "Highest resolution" },
    { value: "1981-2024", label: "Historical data range" },
    { value: "Global", label: "Coverage area" },
  ]

  return (
    <section className="py-24 background transition-all duration-400">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-light tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
