"use client"

import { useState, useEffect } from "react"
import { WeatherDataDisplay } from "@/components/weather-data-display"
import { DataExport } from "@/components/data-export"
import { ClimateJusticeDashboard } from "@/components/climate-justice-dashboard"
import { AgriculturalImpact } from "@/components/agricultural-impact"
import { SatelliteLayersPanel, SatelliteLayer } from "@/components/satellite-layers-panel"
import { PDFReportGenerator } from "@/components/pdf-report-generator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, Shield, Wheat, Satellite, BarChart3 } from "lucide-react"
import { WeatherData, RegionData } from "@/types"
import { fetchWeatherData as fetchWeatherDataAPI } from "@/services/weather-api"
import { WeatherMap } from "@/components/map/weather-map"
import { useWeatherSearchParams } from "@/hooks/use-weather-params"
import { APP_NAME } from "@/lib/constants"
import { CitySearch } from "@/components/city-search"

export function HomePage() {
  const { params, updateParams } = useWeatherSearchParams()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [satelliteLayers, setSatelliteLayers] = useState<SatelliteLayer[]>([])
  const [loading, setLoading] = useState(false)
  const [locationReady, setLocationReady] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Get user's location on mount - REQUIRED
  useEffect(() => {
    // Only get location if no location in URL
    if (!params.lat && !params.lon && !params.lat_min) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude

            // Create a small bbox around the user's location (approx 0.02 degrees ~ 2km)
            const offset = 0.01

            updateParams({
              mode: "point",
              lat,
              lon,
              lat_min: lat - offset,
              lat_max: lat + offset,
              lon_min: lon - offset,
              lon_max: lon + offset,
            })
            setLocationReady(true)
          },
          (error) => {
            console.error("Geolocation error:", error, error.code)
            let errorMessage = "Unable to get your location"

            if (error.code === error.PERMISSION_DENIED) {
              errorMessage = "Location access was denied. Please enable it in your browser settings and refresh the page."
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMessage = "Location information is unavailable. Please try again."
            } else if (error.code === error.TIMEOUT) {
              errorMessage = "Location request timed out. Please try again."
            }

            setLocationError(errorMessage)
            setLocationReady(true)
          },
          {
            enableHighAccuracy: false,
            timeout: 10000, // 10 seconds
            maximumAge: 0
          }
        )
      } else {
        setLocationError("Geolocation is not supported by your browser")
        setLocationReady(true)
      }
    } else {
      setLocationReady(true)
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
        lat_min: importedData.region!.bbox.lat_min,
        lat_max: importedData.region!.bbox.lat_max,
        lon_min: importedData.region!.bbox.lon_min,
        lon_max: importedData.region!.bbox.lon_max,
        year: importedData.target_date.year,
        month: importedData.target_date.month,
        day: importedData.target_date.day,
      })
    }
  }

  const handleModeChange = (mode: "point" | "region") => {
    if (mode === "region" && params.lat && params.lon) {
      // Switching from point to region: create a bbox around the current point
      const offset = 0.01 // approx 1-2km
      updateParams({
        mode,
        lat_min: params.lat - offset,
        lat_max: params.lat + offset,
        lon_min: params.lon - offset,
        lon_max: params.lon + offset,
      })
    } else if (mode === "point") {
      // Switching from region to point: use center of region as point
      const centerLat = (params.lat_min + params.lat_max) / 2
      const centerLon = (params.lon_min + params.lon_max) / 2
      updateParams({
        mode,
        lat: centerLat,
        lon: centerLon,
      })
    } else {
      updateParams({ mode })
    }
  }

  // Show loading screen while getting location
  if (!locationReady) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/>
          <p className="text-lg text-foreground">Requesting location access...</p>
          <p className="text-sm text-muted-foreground max-w-md">
            Please allow location access to use Climate Forecast
          </p>
        </div>
      </main>
    )
  }

  // Show error screen if location was denied
  if (locationError) {
    const useDefaultLocation = () => {
      // Use San Francisco as fallback
      const lat = 37.7749
      const lon = -122.4194
      const offset = 0.01

      updateParams({
        mode: "point",
        lat,
        lon,
        lat_min: lat - offset,
        lat_max: lat + offset,
        lon_min: lon - offset,
        lon_max: lon + offset,
      })
      setLocationError(null)
      setLocationReady(true)
    }

    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="text-6xl opacity-20">📍</div>
          <p className="text-lg text-foreground">{locationError}</p>
          <p className="text-sm text-muted-foreground max-w-md">
            You can retry or continue with a default location
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button onClick={useDefaultLocation}>
              Use Default Location
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{APP_NAME}</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">NASA-powered climate analysis with community impact assessment and professional reporting</p>
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
        
          {/* City Search */}
          <div className="mb-4 max-w-md">
            <CitySearch
              onCitySelect={(city) => {
                updateParams({
                  mode: "point",
                  lat: city.lat,
                  lon: city.lon,
                  lat_min: city.bbox.lat_min,
                  lat_max: city.bbox.lat_max,
                  lon_min: city.bbox.lon_min,
                  lon_max: city.bbox.lon_max,
                })
              }}
            />
          </div>

          <WeatherMap
            selectionMode={params.mode}
            onSelectionModeChange={handleModeChange}
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
            heatmapData={
              weatherData?.type === "region"
                ? weatherData.region.grid_points
                : undefined
            }
            worldviewLayer={weatherData?.worldview_layer}
          />
        </div>
      </div>

      {/* Data Dashboard with Tabs */}
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
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="climate-justice" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Communities</span>
                </TabsTrigger>
                <TabsTrigger value="agriculture" className="flex items-center gap-2">
                  <Wheat className="h-4 w-4" />
                  <span className="hidden sm:inline">Agriculture</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="space-y-6">
              <WeatherDataDisplay data={weatherData}/>
            </TabsContent>
            
            <TabsContent value="climate-justice" className="space-y-6">
              <ClimateJusticeDashboard 
                weatherData={weatherData}
                location={{
                  lat: params.mode === "point" && params.lat ? params.lat : (params.lat_min + params.lat_max) / 2,
                  lon: params.mode === "point" && params.lon ? params.lon : (params.lon_min + params.lon_max) / 2,
                  name: "Selected Location"
                }}
              />
            </TabsContent>
            
            <TabsContent value="agriculture" className="space-y-6">
              <AgriculturalImpact 
                weatherData={weatherData}
                location={{
                  lat: params.mode === "point" && params.lat ? params.lat : (params.lat_min + params.lat_max) / 2,
                  lon: params.mode === "point" && params.lon ? params.lon : (params.lon_min + params.lon_max) / 2,
                  name: "Selected Location"
                }}
              />
            </TabsContent>
            
            <TabsContent value="satellite" className="space-y-6">
              <SatelliteLayersPanel 
                selectedLayers={satelliteLayers}
                onLayersChange={setSatelliteLayers}
                location={{
                  lat: params.mode === "point" && params.lat ? params.lat : (params.lat_min + params.lat_max) / 2,
                  lon: params.mode === "point" && params.lon ? params.lon : (params.lon_min + params.lon_max) / 2
                }}
                targetDate={{
                  year: params.year,
                  month: params.month,
                  day: params.day
                }}
              />
            </TabsContent>
            
            <TabsContent value="export" className="space-y-6">
              <PDFReportGenerator 
                weatherData={weatherData}
                location={{
                  lat: params.mode === "point" && params.lat ? params.lat : (params.lat_min + params.lat_max) / 2,
                  lon: params.mode === "point" && params.lon ? params.lon : (params.lon_min + params.lon_max) / 2,
                  name: "Selected Location"
                }}
              />
              <div className="pt-6">
                <DataExport data={weatherData} onImport={handleImportData}/>
              </div>
            </TabsContent>
          </Tabs>
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
