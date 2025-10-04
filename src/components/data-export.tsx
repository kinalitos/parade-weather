"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Copy, FileJson, FileSpreadsheet, Upload, Check } from "lucide-react"

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

interface DataExportProps {
  data: WeatherData
  onImport?: (data: WeatherData) => void
}

export function DataExport({ data, onImport }: DataExportProps) {
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState("")
  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedCsv, setCopiedCsv] = useState(false)

  const convertToCSV = (data: WeatherData): string => {
    const isRegion = data.type === "region"
    const rows: string[] = []

    // Header
    rows.push("Field,Value")

    // Type
    rows.push(`Type,${data.type}`)

    // Location/Region
    if (isRegion) {
      const regionData = data as RegionWeatherData
      rows.push(`Latitude Min,${regionData.region.bbox.lat_min}`)
      rows.push(`Latitude Max,${regionData.region.bbox.lat_max}`)
      rows.push(`Longitude Min,${regionData.region.bbox.lon_min}`)
      rows.push(`Longitude Max,${regionData.region.bbox.lon_max}`)
    } else {
      const pointData = data as PointWeatherData
      rows.push(`Latitude,${pointData.location.lat}`)
      rows.push(`Longitude,${pointData.location.lon}`)
    }

    // Target Date
    rows.push(`Target Year,${data.target_date.year}`)
    rows.push(`Target Month,${data.target_date.month}`)
    rows.push(`Target Day,${data.target_date.day}`)

    // Probabilities
    rows.push(`Probability Very Hot,${data.probabilities.very_hot}`)
    rows.push(`Probability Very Cold,${data.probabilities.very_cold}`)
    rows.push(`Probability Very Wet,${data.probabilities.very_wet}`)
    rows.push(`Probability Very Windy,${data.probabilities.very_windy}`)
    if (isRegion) {
      rows.push(`Probability Very Uncomfortable,${(data as RegionWeatherData).probabilities.very_uncomfortable}`)
    }

    // Statistics
    if (isRegion) {
      const regionData = data as RegionWeatherData
      rows.push(`Avg Max Temperature,${regionData.regional_stats.temp_max_avg}`)
      rows.push(`Temperature Range Min,${regionData.regional_stats.temp_max_range.min}`)
      rows.push(`Temperature Range Max,${regionData.regional_stats.temp_max_range.max}`)
      rows.push(`Avg Precipitation,${regionData.regional_stats.precipitation_avg}`)
      rows.push(`Grid Points Analyzed,${regionData.grid_points_analyzed}`)
    } else {
      const pointData = data as PointWeatherData
      rows.push(`Historical Temp Max Avg,${pointData.historical_baseline.temp_max_avg}`)
      rows.push(`Historical Precipitation Avg,${pointData.historical_baseline.precipitation_avg}`)
    }

    // Trend
    rows.push(`Very Hot Increasing,${data.trend.very_hot_increasing}`)
    rows.push(`Change Per Decade,${data.trend.change_per_decade}`)
    rows.push(`Years Analyzed,${data.years_analyzed}`)

    return rows.join("\n")
  }

  const downloadJSON = () => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `weather-forecast-${data.type}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    const csvString = convertToCSV(data)
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `weather-forecast-${data.type}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyJSON = async () => {
    const jsonString = JSON.stringify(data, null, 2)
    await navigator.clipboard.writeText(jsonString)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const copyCSV = async () => {
    const csvString = convertToCSV(data)
    await navigator.clipboard.writeText(csvString)
    setCopiedCsv(true)
    setTimeout(() => setCopiedCsv(false), 2000)
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText)

      // Basic validation
      if (!parsed.type || (parsed.type !== "point" && parsed.type !== "region")) {
        throw new Error("Invalid data type");
      }

      if (onImport) {
        onImport(parsed as WeatherData);
      }

      setImportText("")
      setShowImport(false)
    } catch (error) {
      alert("Invalid JSON format. Please check your input.")
    }
  }

  return (
    <Card className="p-4 md:p-6 border-border bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-foreground">Export Data</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Download or copy forecast data</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)} className="w-full sm:w-auto">
          <Upload className="h-4 w-4 mr-2" />
          {showImport ? "Hide Import" : "Import JSON"}
        </Button>
      </div>

      {showImport && (
        <div className="mb-4 space-y-2">
          <Textarea
            placeholder="Paste JSON data here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="min-h-[120px] font-mono text-xs"
          />
          <Button onClick={handleImport} size="sm" className="w-full sm:w-auto">
            Import Data
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <Button onClick={downloadJSON} variant="outline" size="sm" className="justify-start bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          <FileJson className="h-4 w-4 mr-2" />
          <span className="text-xs md:text-sm">Download JSON</span>
        </Button>

        <Button onClick={downloadCSV} variant="outline" size="sm" className="justify-start bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <span className="text-xs md:text-sm">Download CSV</span>
        </Button>

        <Button onClick={copyJSON} variant="outline" size="sm" className="justify-start bg-transparent">
          {copiedJson ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          <FileJson className="h-4 w-4 mr-2" />
          <span className="text-xs md:text-sm">{copiedJson ? "Copied!" : "Copy JSON"}</span>
        </Button>

        <Button onClick={copyCSV} variant="outline" size="sm" className="justify-start bg-transparent">
          {copiedCsv ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <span className="text-xs md:text-sm">{copiedCsv ? "Copied!" : "Copy CSV"}</span>
        </Button>
      </div>
    </Card>
  )
}
