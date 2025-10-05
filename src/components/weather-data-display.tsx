"use client"

import { Card } from "@/components/ui/card"
import { Thermometer, Snowflake, CloudRain, Wind, TrendingUp, Calendar, MapPin, Frown } from "lucide-react"
import { PointWeatherData, RegionWeatherData, WeatherData } from "@/types";

interface WeatherDataDisplayProps {
  data: WeatherData
}

export function WeatherDataDisplay({ data }: WeatherDataDisplayProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(0)}%`

  const isRegion = data.type === "region"

  const weatherConditions = [
    {
      icon: Thermometer,
      label: "Very Hot",
      value: data.probabilities.very_hot,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      barColor: "bg-red-500",
    },
    {
      icon: Snowflake,
      label: "Very Cold",
      value: data.probabilities.very_cold,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      barColor: "bg-blue-500",
    },
    {
      icon: CloudRain,
      label: "Very Wet",
      value: data.probabilities.very_wet,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      barColor: "bg-cyan-500",
    },
    {
      icon: Wind,
      label: "Very Windy",
      value: data.probabilities.very_windy,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
      barColor: "bg-gray-500",
    },
    ...(isRegion
      ? [
          {
            icon: Frown,
            label: "Very Uncomfortable",
            value: (data as RegionWeatherData).probabilities.very_uncomfortable,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            barColor: "bg-orange-500",
          },
        ]
      : []),
  ]

  console.log(data.target_date)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Metadata Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
        <Card className="p-2 md:p-4 border-border bg-card">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 shrink-0">
              <MapPin className="h-3.5 md:h-5 w-3.5 md:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {isRegion ? (
                <>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Region</p>
                  <div className="font-mono text-[10px] md:text-xs text-foreground space-y-0.5">
                    <div className="truncate">
                      Lat: {(data as RegionWeatherData).region.bbox.lat_min.toFixed(2)} →{" "}
                      {(data as RegionWeatherData).region.bbox.lat_max.toFixed(2)}
                    </div>
                    <div className="truncate">
                      Lon: {(data as RegionWeatherData).region.bbox.lon_min.toFixed(2)} →{" "}
                      {(data as RegionWeatherData).region.bbox.lon_max.toFixed(2)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Location</p>
                  <div className="font-mono text-[10px] md:text-xs text-foreground break-all">
                    {(data as PointWeatherData).location.lat.toFixed(4)},{" "}
                    {(data as PointWeatherData).location.lon.toFixed(4)}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-2 md:p-4 border-border bg-card">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 shrink-0">
              <Calendar className="h-3.5 md:h-5 w-3.5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Target Date</p>
              <p className="font-mono text-sm md:text-lg font-semibold text-foreground">
                {data.target_date.year}-{String(data.target_date.month).padStart(2, "0")}-
                {String(data.target_date.day).padStart(2, "0")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2 md:p-4 border-border bg-card">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 shrink-0">
              <TrendingUp className="h-3.5 md:h-5 w-3.5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Analysis Period</p>
              <p className="font-mono text-[10px] md:text-sm font-semibold text-foreground">{data.years_analyzed}</p>
              {isRegion && (
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                  {(data as RegionWeatherData).grid_points_analyzed} grid points
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Probabilities Grid */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-4">Weather Probabilities</h2>
        <div
          className={`grid grid-cols-2 ${isRegion ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-2 md:gap-4`}
        >
          {weatherConditions.map((condition, index) => {
            const Icon = condition.icon
            const isLastCard = index === weatherConditions.length - 1 && isRegion
            return (
              <Card key={condition.label} className={`p-2 md:p-4 border-border bg-card ${isLastCard ? 'col-span-2 lg:col-span-1' : ''}`}>
                <div className="space-y-1.5 md:space-y-3">
                  <div className={`p-1.5 md:p-2 rounded-lg ${condition.bgColor} w-fit`}>
                    <Icon className={`h-3.5 md:h-5 w-3.5 md:w-5 ${condition.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">{condition.label}</p>
                    <p className="text-xl md:text-3xl font-bold font-mono text-foreground">
                      {formatPercentage(condition.value)}
                    </p>
                  </div>
                  <div className="h-1 md:h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${condition.barColor} transition-all duration-500`}
                      style={{ width: `${condition.value * 100}%` }}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-4">
          {isRegion ? "Regional Statistics" : "Historical Baseline"}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {isRegion ? (
            <>
              <Card className="p-3 md:p-6 border-border bg-card">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">Avg Max Temp</p>
                <p className="text-2xl md:text-4xl font-bold text-foreground font-mono mb-1 md:mb-3">
                  {(data as RegionWeatherData).regional_stats.temp_max_avg}°C
                </p>
                <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm">
                  <span className="text-muted-foreground">Range:</span>
                  <span className="font-mono text-foreground">
                    {(data as RegionWeatherData).regional_stats.temp_max_range.min}°C -{" "}
                    {(data as RegionWeatherData).regional_stats.temp_max_range.max}°C
                  </span>
                </div>
              </Card>

              <Card className="p-3 md:p-6 border-border bg-card">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">Avg Precipitation</p>
                <p className="text-2xl md:text-4xl font-bold text-foreground font-mono">
                  {(data as RegionWeatherData).regional_stats.precipitation_avg}mm
                </p>
              </Card>
            </>
          ) : (
            <>
              <Card className="p-3 md:p-6 border-border bg-card">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">Avg Max Temp</p>
                <p className="text-2xl md:text-4xl font-bold text-foreground font-mono">
                  {(data as PointWeatherData).historical_baseline.temp_max_avg}°C
                </p>
              </Card>

              <Card className="p-3 md:p-6 border-border bg-card">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">Avg Precipitation</p>
                <p className="text-2xl md:text-4xl font-bold text-foreground font-mono">
                  {(data as PointWeatherData).historical_baseline.precipitation_avg}mm
                </p>
              </Card>
            </>
          )}

          <Card className="p-3 md:p-6 border-border bg-card col-span-2 lg:col-span-1">
            <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">Climate Trend</p>
            {data.trend ? (
              <>
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <TrendingUp className="h-3.5 md:h-5 w-3.5 md:w-5 text-primary" />
                  <span className="text-sm md:text-lg font-semibold text-foreground">
                    {data.trend.very_hot_increasing ? "Increasing" : "Decreasing"}
                  </span>
                </div>
                <p className="text-[10px] md:text-sm text-muted-foreground">
                  <span className="font-mono text-foreground">{formatPercentage(data.trend.change_per_decade)}</span> per
                  decade
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No trend data available</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
