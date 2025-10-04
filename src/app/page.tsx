"use client"

import { useState, useEffect } from "react"
import { WeatherDataDisplay } from "@/components/weather-data-display"
import { DataExport } from "@/components/data-export"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { WeatherData } from "@/types"
import { fetchWeatherData as fetchWeatherDataAPI } from "@/services/weather-api"
import { WeatherMap } from "@/components/map/weather-map";

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
  const [targetDate, setTargetDate] = useState({
    year: new Date().getFullYear() + 1,
    month: 7,
    day: 15,
  })

  const fetchWeatherData = async () => {
    // Don't fetch if in point mode and no point selected
    if (selectionMode === "point" && !selectedPoint) {
      return
    }

    setLoading(true)

    try {
      const data = await fetchWeatherDataAPI({
        mode: selectionMode,
        point: selectedPoint || undefined,
        region: selectedRegion,
        target_year: targetDate.year,
        target_month: targetDate.month,
        target_day: targetDate.day,
      })
      setWeatherData(data)
    } catch (error) {
      console.error("Failed to fetch weather data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch when selection or date changes
  useEffect(() => {
    fetchWeatherData()
  }, [selectionMode, selectedPoint, selectedRegion, targetDate])

  const handleImportData = (importedData: WeatherData) => {
    // Update map selection based on imported data
    if (importedData.type === "point") {
      setSelectionMode("point")
      setSelectedPoint(importedData.location)
    } else if (importedData.type === "region") {
      setSelectionMode("region")
      setSelectedRegion(importedData.region.bbox)
    }

    // Update target date from imported data (this will trigger auto-fetch via useEffect)
    setTargetDate(importedData.target_date)
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
            <div className="flex items-center gap-2">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
              <Button
                onClick={fetchWeatherData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <WeatherMap
            selectionMode={selectionMode}
            onSelectionModeChange={setSelectionMode}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            targetDate={targetDate}
            onDateChange={setTargetDate}
          />
        </div>
      </div>

      {/* Data Dashboard */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 md:py-20">
            <div className="text-center space-y-3 px-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground text-base md:text-lg">Fetching weather data...</p>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Analyzing climate probabilities for your selection
              </p>
            </div>
          </div>
        ) : weatherData ? (
          <div className="space-y-6">
            <DataExport data={weatherData} onImport={handleImportData} />
            <WeatherDataDisplay data={weatherData} />
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 md:py-20">
            <div className="text-center space-y-3 px-4">
              <div className="text-4xl md:text-6xl opacity-20">📊</div>
              <p className="text-muted-foreground text-base md:text-lg">No forecast data loaded</p>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Select a {selectionMode === "point" ? "location" : "region"} on the map above
                to analyze climate probabilities
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
