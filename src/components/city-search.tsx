"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Loader2, MapPin } from "lucide-react"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  boundingbox: [string, string, string, string]
}

interface CitySearchProps {
  onCitySelect?: (result: {
    name: string
    lat: number
    lon: number
    bbox: {
      lat_min: number
      lat_max: number
      lon_min: number
      lon_max: number
    }
  }) => void
}

export function CitySearch({ onCitySelect }: CitySearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchCities = useCallback(async (searchQuery: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: "json",
          limit: "5",
          addressdetails: "1",
        }),
        {
          headers: {
            "User-Agent": "parade-weather-app",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch cities")
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCities(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, searchCities])

  const handleSelectCity = (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    const [latMin, latMax, lonMin, lonMax] = result.boundingbox.map(parseFloat)

    onCitySelect?.({
      name: result.display_name,
      lat,
      lon,
      bbox: {
        lat_min: latMin,
        lat_max: latMax,
        lon_min: lonMin,
        lon_max: lonMax,
      },
    })

    setQuery("")
    setResults([])
  }

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results Dropdown */}
      {(results.length > 0 || error) && (
        <Card className="absolute z-50 w-full mt-2 p-0 overflow-hidden shadow-lg">
          {error ? (
            <div className="p-3 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectCity(result)}
                  className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {result.display_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <div>
                          Coordinates: {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                        </div>
                        <div>
                          Bbox: [{result.boundingbox.map(v => parseFloat(v).toFixed(2)).join(", ")}]
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
