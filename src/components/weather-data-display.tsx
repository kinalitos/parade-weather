"use client"

import { Card } from "@/components/ui/card"
import { Thermometer, Snowflake, CloudRain, Wind, TrendingUp, Calendar, MapPin, Frown } from "lucide-react"

interface PointWeatherData {
  type: "point"
  location: {
    lat: number
    lon: number
  }
  target_date: {
    year: number
    month: number
    day: number
  }
  probabilities: {
    very_hot: number
    very_cold: number
    very_wet: number
    very_windy: number
  }
  trend: {
    very_hot_increasing: boolean
    change_per_decade: number
  }
  historical_baseline: {
    temp_max_avg: number
    precipitation_avg: number
  }
  years_analyzed: string
}

interface RegionWeatherData {
  type: "region"
  region: {
    bbox: {
      lat_min: number
      lat_max: number
      lon_min: number
      lon_max: number
    }
  }
  target_date: {
    year: number
    month: number
    day: number
  }
  probabilities: {
    very_hot: number
    very_cold: number
    very_wet: number
    very_windy: number
    very_uncomfortable: number
  }
  regional_stats: {
    temp_max_avg: number
    temp_max_range: {
      min: number
      max: number
    }
    precipitation_avg: number
  }
  trend: {
    very_hot_increasing: boolean
    change_per_decade: number
  }
  grid_points_analyzed: number
  years_analyzed: string
}

type WeatherData = PointWeatherData | RegionWeatherData

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
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      icon: Snowflake,
      label: "Very Cold",
      value: data.probabilities.very_cold,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      icon: CloudRain,
      label: "Very Wet",
      value: data.probabilities.very_wet,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      icon: Wind,
      label: "Very Windy",
      value: data.probabilities.very_windy,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    ...(isRegion
      ? [
          {
            icon: Frown,
            label: "Very Uncomfortable",
            value: (data as RegionWeatherData).probabilities.very_uncomfortable,
            color: "text-chart-5",
            bgColor: "bg-chart-5/10",
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Metadata Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 border-border bg-card">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <MapPin className="h-4 md:h-5 w-4 md:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {isRegion ? (
                <>
                  <p className="text-xs text-muted-foreground mb-1">Region Bounds</p>
                  <div className="font-mono text-xs text-foreground space-y-0.5">
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
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <div className="font-mono text-xs md:text-sm text-foreground break-all">
                    {(data as PointWeatherData).location.lat.toFixed(4)},{" "}
                    {(data as PointWeatherData).location.lon.toFixed(4)}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4 border-border bg-card">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Calendar className="h-4 md:h-5 w-4 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Target Date</p>
              <p className="font-mono text-base md:text-lg font-semibold text-foreground">
                {data.target_date.year}-{String(data.target_date.month).padStart(2, "0")}-
                {String(data.target_date.day).padStart(2, "0")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4 border-border bg-card">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <TrendingUp className="h-4 md:h-5 w-4 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Analysis Period</p>
              <p className="font-mono text-xs md:text-sm font-semibold text-foreground">{data.years_analyzed}</p>
              {isRegion && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(data as RegionWeatherData).grid_points_analyzed} grid points
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Probabilities Grid */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Weather Probabilities</h2>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${isRegion ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-3 md:gap-4`}
        >
          {weatherConditions.map((condition) => {
            const Icon = condition.icon
            return (
              <Card key={condition.label} className="p-3 md:p-4 border-border bg-card">
                <div className="space-y-2 md:space-y-3">
                  <div className={`p-2 rounded-lg ${condition.bgColor} w-fit`}>
                    <Icon className={`h-4 md:h-5 w-4 md:w-5 ${condition.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{condition.label}</p>
                    <p className="text-2xl md:text-3xl font-bold font-mono text-foreground">
                      {formatPercentage(condition.value)}
                    </p>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${condition.color.replace("text-", "bg-")} transition-all duration-500`}
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
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
          {isRegion ? "Regional Statistics" : "Historical Baseline"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {isRegion ? (
            <>
              <Card className="p-4 md:p-6 border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Avg Max Temperature</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground font-mono mb-2 md:mb-3">
                  {(data as RegionWeatherData).regional_stats.temp_max_avg}°C
                </p>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="text-muted-foreground">Range:</span>
                  <span className="font-mono text-foreground">
                    {(data as RegionWeatherData).regional_stats.temp_max_range.min}°C -{" "}
                    {(data as RegionWeatherData).regional_stats.temp_max_range.max}°C
                  </span>
                </div>
              </Card>

              <Card className="p-4 md:p-6 border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Avg Precipitation</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground font-mono">
                  {(data as RegionWeatherData).regional_stats.precipitation_avg}mm
                </p>
              </Card>
            </>
          ) : (
            <>
              <Card className="p-4 md:p-6 border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Avg Max Temperature</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground font-mono">
                  {(data as PointWeatherData).historical_baseline.temp_max_avg}°C
                </p>
              </Card>

              <Card className="p-4 md:p-6 border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Avg Precipitation</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground font-mono">
                  {(data as PointWeatherData).historical_baseline.precipitation_avg}mm
                </p>
              </Card>
            </>
          )}

          <Card className="p-4 md:p-6 border-border bg-card">
            <p className="text-xs text-muted-foreground mb-2">Climate Trend</p>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 md:h-5 w-4 md:w-5 text-primary" />
              <span className="text-base md:text-lg font-semibold text-foreground">
                {data.trend.very_hot_increasing ? "Increasing" : "Decreasing"}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{formatPercentage(data.trend.change_per_decade)}</span> per
              decade
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
