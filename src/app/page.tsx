"use client"

import { useState } from "react"
import { MapView } from "@/components/map-view"
import { WeatherDataDisplay } from "@/components/weather-data-display"
import { DataExport } from "@/components/data-export"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { PointWeatherData, RegionWeatherData, WeatherData } from "@/types";

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectionMode, setSelectionMode] = useState<"point" | "region">("region")
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lon: number } | null>(null)
  const [selectedRegion, setSelectedRegion] = useState({
    lat_min: 51.48,
    lat_max: 51.52,
    lon_min: -0.15,
    lon_max: -0.05,
  })
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1)

  const fetchWeatherData = async () => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (selectionMode === "point" && selectedPoint) {
      const mockPointData: PointWeatherData = {
        type: "point",
        location: selectedPoint,
        target_date: {
          year: targetYear,
          month: 7,
          day: 15,
        },
        probabilities: {
          very_hot: 0.42,
          very_cold: 0.0,
          very_wet: 0.15,
          very_windy: 0.1,
        },
        trend: {
          very_hot_increasing: true,
          change_per_decade: 0.08,
        },
        historical_baseline: {
          temp_max_avg: 28.5,
          precipitation_avg: 2.8,
        },
        years_analyzed: "1981-2024",
      }
      setWeatherData(mockPointData)
    } else {
      const mockRegionData: RegionWeatherData = {
        type: "region",
        region: {
          bbox: selectedRegion,
        },
        target_date: {
          year: targetYear,
          month: 7,
          day: 15,
        },
        probabilities: {
          very_hot: 0.45,
          very_cold: 0.0,
          very_wet: 0.18,
          very_windy: 0.12,
          very_uncomfortable: 0.35,
        },
        regional_stats: {
          temp_max_avg: 29.8,
          temp_max_range: {
            min: 27.2,
            max: 32.1,
          },
          precipitation_avg: 3.5,
        },
        trend: {
          very_hot_increasing: true,
          change_per_decade: 0.09,
        },
        grid_points_analyzed: 16,
        years_analyzed: "1981-2024",
      }
      setWeatherData(mockRegionData)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Climate Forecast</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Regional weather probability analysis</p>
            </div>
            <Button
              onClick={fetchWeatherData}
              disabled={loading}
              className="h-9 md:h-10 px-4 md:px-6 font-medium w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Fetch Forecast"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <MapView
            selectionMode={selectionMode}
            onSelectionModeChange={setSelectionMode}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            targetYear={targetYear}
            onYearChange={setTargetYear}
          />
        </div>
      </div>

      {/* Data Dashboard */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        {weatherData ? (
          <div className="space-y-6">
            <DataExport data={weatherData} />
            <WeatherDataDisplay data={weatherData} />
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 md:py-20">
            <div className="text-center space-y-3 px-4">
              <div className="text-4xl md:text-6xl opacity-20">📊</div>
              <p className="text-muted-foreground text-base md:text-lg">No forecast data loaded</p>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Select a {selectionMode === "point" ? "location" : "region"} on the map above and click "Fetch Forecast"
                to analyze climate probabilities
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
