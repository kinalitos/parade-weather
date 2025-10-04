"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Square, Search } from "lucide-react"

interface MapViewProps {
  selectionMode: "point" | "region"
  onSelectionModeChange: (mode: "point" | "region") => void
  selectedPoint: { lat: number; lon: number } | null
  onPointSelect: (point: { lat: number; lon: number }) => void
  selectedRegion: {
    lat_min: number
    lat_max: number
    lon_min: number
    lon_max: number
  }
  onRegionSelect: (region: { lat_min: number; lat_max: number; lon_min: number; lon_max: number }) => void
  targetYear: number
  onYearChange: (year: number) => void
}

export function MapView({
  selectionMode,
  onSelectionModeChange,
  selectedPoint,
  onPointSelect,
  selectedRegion,
  onRegionSelect,
  targetYear,
  onYearChange,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lon: -0.1278 }) // London default

  const pixelToLatLon = (x: number, y: number, rect: DOMRect) => {
    // Simple projection centered on mapCenter
    const lon = mapCenter.lon + (x / rect.width - 0.5) * 0.5
    const lat = mapCenter.lat - (y / rect.height - 0.5) * 0.3
    return { lat, lon }
  }

  const latLonToPixel = (lat: number, lon: number, rect: DOMRect) => {
    const x = ((lon - mapCenter.lon) / 0.5 + 0.5) * rect.width
    const y = ((mapCenter.lat - lat) / 0.3 + 0.5) * rect.height
    return { x, y }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (selectionMode === "point") {
      const { lat, lon } = pixelToLatLon(x, y, rect)
      onPointSelect({ lat, lon })
    } else {
      setStartPoint({ x, y })
      setIsDrawing(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || selectionMode === "point") return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCurrentPoint({ x, y })
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !mapRef.current || selectionMode === "point") return

    const rect = mapRef.current.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    const start = pixelToLatLon(startPoint.x, startPoint.y, rect)
    const end = pixelToLatLon(endX, endY, rect)

    onRegionSelect({
      lat_min: Math.min(start.lat, end.lat),
      lat_max: Math.max(start.lat, end.lat),
      lon_min: Math.min(start.lon, end.lon),
      lon_max: Math.max(start.lon, end.lon),
    })

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }

  const getRectangleStyle = () => {
    if (!startPoint || !currentPoint) return {}

    const left = Math.min(startPoint.x, currentPoint.x)
    const top = Math.min(startPoint.y, currentPoint.y)
    const width = Math.abs(currentPoint.x - startPoint.x)
    const height = Math.abs(currentPoint.y - startPoint.y)

    return { left, top, width, height }
  }

  const handleSearch = () => {
    const query = searchQuery.toLowerCase()
    // Simple location database for demo
    const locations: Record<string, { lat: number; lon: number }> = {
      london: { lat: 51.5074, lon: -0.1278 },
      paris: { lat: 48.8566, lon: 2.3522 },
      "new york": { lat: 40.7128, lon: -74.006 },
      tokyo: { lat: 35.6762, lon: 139.6503 },
      sydney: { lat: -33.8688, lon: 151.2093 },
      berlin: { lat: 52.52, lon: 13.405 },
      madrid: { lat: 40.4168, lon: -3.7038 },
      rome: { lat: 41.9028, lon: 12.4964 },
    }

    for (const [name, coords] of Object.entries(locations)) {
      if (query.includes(name)) {
        setMapCenter(coords)
        return
      }
    }
  }

  const currentYear = new Date().getFullYear()
  const maxYear = currentYear + 50

  return (
    <Card className="overflow-hidden border-border">
      <div className="bg-secondary/30 px-3 md:px-4 py-3 border-b border-border">
        <div className="flex flex-col gap-3">
          {/* First row: Mode selector and Year */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
              <div className="flex items-center gap-2 w-full xs:w-auto">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Mode:</Label>
                <div className="flex gap-1 bg-background rounded-lg p-1 flex-1 xs:flex-initial">
                  <Button
                    size="sm"
                    variant={selectionMode === "point" ? "default" : "ghost"}
                    onClick={() => onSelectionModeChange("point")}
                    className="h-7 px-2 md:px-3 text-xs flex-1 xs:flex-initial"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Point
                  </Button>
                  <Button
                    size="sm"
                    variant={selectionMode === "region" ? "default" : "ghost"}
                    onClick={() => onSelectionModeChange("region")}
                    className="h-7 px-2 md:px-3 text-xs flex-1 xs:flex-initial"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Region
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full xs:w-auto">
                <Label htmlFor="year" className="text-xs text-muted-foreground whitespace-nowrap">
                  Year:
                </Label>
                <Input
                  id="year"
                  type="number"
                  min={currentYear + 1}
                  max={maxYear}
                  value={targetYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="h-7 w-20 md:w-24 text-xs"
                />
              </div>
            </div>

            {/* Search box */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48 md:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-7 pl-7 text-xs"
                />
              </div>
              <Button size="sm" onClick={handleSearch} className="h-7 px-3 text-xs">
                Go
              </Button>
            </div>
          </div>

          {/* Selection info */}
          <div className="text-xs">
            {selectionMode === "point" && selectedPoint ? (
              <p className="text-muted-foreground break-all">
                Selected Point:{" "}
                <span className="font-mono text-foreground">
                  [{selectedPoint.lat.toFixed(4)}, {selectedPoint.lon.toFixed(4)}]
                </span>
              </p>
            ) : selectionMode === "region" ? (
              <p className="text-muted-foreground break-all">
                Selected Region:{" "}
                <span className="font-mono text-foreground">
                  [{selectedRegion.lat_min.toFixed(2)}, {selectedRegion.lon_min.toFixed(2)}] to [
                  {selectedRegion.lat_max.toFixed(2)}, {selectedRegion.lon_max.toFixed(2)}]
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false)
          setStartPoint(null)
          setCurrentPoint(null)
        }}
        className={`relative h-[300px] md:h-[400px] lg:h-[500px] bg-muted overflow-hidden select-none ${
          selectionMode === "point" ? "cursor-crosshair" : "cursor-crosshair"
        }`}
        style={{
          backgroundImage: `url(/placeholder.svg?height=500&width=1200&query=openstreetmap+style+world+map)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {selectionMode === "point" &&
          selectedPoint &&
          mapRef.current &&
          (() => {
            const rect = mapRef.current.getBoundingClientRect()
            const { x, y } = latLonToPixel(selectedPoint.lat, selectedPoint.lon, rect)
            return (
              <div className="absolute w-4 h-4 -ml-2 -mt-2 pointer-events-none" style={{ left: x, top: y }}>
                <div className="w-full h-full bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
              </div>
            )
          })()}

        {selectionMode === "region" &&
          mapRef.current &&
          (() => {
            const rect = mapRef.current.getBoundingClientRect()
            const topLeft = latLonToPixel(selectedRegion.lat_max, selectedRegion.lon_min, rect)
            const bottomRight = latLonToPixel(selectedRegion.lat_min, selectedRegion.lon_max, rect)
            return (
              <div
                className="absolute border-2 border-primary bg-primary/10 pointer-events-none shadow-lg"
                style={{
                  left: topLeft.x,
                  top: topLeft.y,
                  width: bottomRight.x - topLeft.x,
                  height: bottomRight.y - topLeft.y,
                }}
              />
            )
          })()}

        {isDrawing && startPoint && currentPoint && (
          <div
            className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
            style={{
              ...getRectangleStyle(),
              position: "absolute",
            }}
          />
        )}
      </div>
    </Card>
  )
}
