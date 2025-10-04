"use client"

import { useState, useEffect } from "react"
import { WeatherDataDisplay } from "@/components/weather-data-display"
import { DataExport } from "@/components/data-export"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { WeatherData } from "@/types"
import { fetchWeatherData as fetchWeatherDataAPI } from "@/services/weather-api"
import { WeatherMap } from "@/components/map/weather-map"
import { useWeatherSearchParams } from "@/hooks/use-weather-params"

export function HomePage() {
  const { params, updateParams } = useWeatherSearchParams()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)

  // Get user's location on mount if no location in URL
  useEffect(() => {
    // Only get location if in point mode and no lat/lon set
    if (params.mode === "point" && !params.lat && !params.lon) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateParams({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            })
          },
          (error) => {
            console.log("Could not get user location:", error)
            // Fallback to default location (San Francisco)
            updateParams({
              lat: 37.7749,
              lon: -122.4194,
            })
          }
        )
      } else {
        // Fallback if geolocation not available
        updateParams({
          lat: 37.7749,
          lon: -122.4194,
        })
      }
    }
  }, []) // Empty dependency array - only run once on mount

  const fetchWeatherData = async () => {
    // Don't fetch if in point mode and no point selected
    if (params.mode === "point" && !params.lat && !params.lon) {
      return
    }

    setLoading(true)

    try {
      const data = await fetchWeatherDataAPI({
        mode: params.mode,
        point: params.mode === "point" && params.lat && params.lon
          ? { lat: params.lat, lon: params.lon }
          : undefined,
        region: {
          lat_min: params.lat_min,
          lat_max: params.lat_max,
          lon_min: params.lon_min,
          lon_max: params.lon_max,
        },
        targetYear: params.year,
        month: params.month,
        day: params.day,
      })
      console.log("Fetched weather data:", data)
      setWeatherData(data)
    } catch (error) {
      console.error("Failed to fetch weather data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch when URL params change
  useEffect(() => {
    void fetchWeatherData()
  }, [params.mode, params.lat, params.lon, params.lat_min, params.lat_max, params.lon_min, params.lon_max, params.year, params.month, params.day])

  const handleImportData = (importedData: WeatherData) => {
    // Update URL params based on imported data
    if (importedData.type === "point") {
      updateParams({
        mode: "point",
        lat: importedData.location.lat,
        lon: importedData.location.lon,
        year: importedData.target_date.year,
        month: importedData.target_date.month,
        day: importedData.target_date.day,
      })
    } else if (importedData.type === "region") {
      updateParams({
        mode: "region",
        lat_min: importedData.region.bbox.lat_min,
        lat_max: importedData.region.bbox.lat_max,
        lon_min: importedData.region.bbox.lon_min,
        lon_max: importedData.region.bbox.lon_max,
        year: importedData.target_date.year,
        month: importedData.target_date.month,
        day: importedData.target_date.day,
      })
    }
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
                  <Loader2 className="h-4 w-4 animate-spin"/>
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
                <RefreshCw className="h-4 w-4"/>
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
            selectionMode={params.mode}
            onSelectionModeChange={(mode) => updateParams({ mode })}
            selectedPoint={params.lat && params.lon ? { lat: params.lat, lon: params.lon } : null}
            onPointSelect={(point) => updateParams({ lat: point.lat, lon: point.lon })}
            selectedRegion={{
              lat_min: params.lat_min,
              lat_max: params.lat_max,
              lon_min: params.lon_min,
              lon_max: params.lon_max,
            }}
            onRegionSelect={(region) => updateParams({
              lat_min: region.lat_min,
              lat_max: region.lat_max,
              lon_min: region.lon_min,
              lon_max: region.lon_max,
            })}
            targetDate={{
              year: params.year,
              month: params.month,
              day: params.day,
            }}
            onDateChange={(date) => updateParams({
              year: date.year,
              month: date.month,
              day: date.day,
            })}
            zoom={params.zoom}
            onZoomChange={(zoom) => updateParams({ zoom })}
          />
        </div>
      </div>

      {/* Data Dashboard */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 md:py-20">
            <div className="text-center space-y-3 px-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/>
              <p className="text-muted-foreground text-base md:text-lg">Fetching weather data...</p>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Analyzing climate probabilities for your selection
              </p>
            </div>
          </div>
        ) : weatherData ? (
          <div className="space-y-6">
            <DataExport data={weatherData} onImport={handleImportData}/>
            <WeatherDataDisplay data={weatherData}/>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 md:py-20">
            <div className="text-center space-y-3 px-4">
              <div className="text-4xl md:text-6xl opacity-20">📊</div>
              <p className="text-muted-foreground text-base md:text-lg">No forecast data loaded</p>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Select a {params.mode === "point" ? "location" : "region"} on the map above
                to analyze climate probabilities
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
