"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Satellite, Eye, EyeOff, Flame, Leaf, Droplets, Wind, Thermometer, Globe } from "lucide-react"

export interface SatelliteLayer {
  id: string
  name: string
  description: string
  layer_code: string
  icon: React.ReactNode
  category: "ATMOSPHERE" | "LAND" | "OCEAN" | "WEATHER" | "HAZARDS"
  opacity: number
  enabled: boolean
  nasa_source: string
  resolution: string
  update_frequency: string
}

interface SatelliteLayersPanelProps {
  selectedLayers: SatelliteLayer[]
  onLayersChange: (layers: SatelliteLayer[]) => void
  location?: {
    lat: number
    lon: number
  }
  targetDate: {
    year: number
    month: number
    day: number
  }
}

// Available NASA satellite layers with real layer codes
const AVAILABLE_LAYERS: SatelliteLayer[] = [
  {
    id: "modis_true_color",
    name: "MODIS True Color",
    description: "Natural color satellite imagery showing Earth as it appears to the human eye",
    layer_code: "MODIS_Terra_CorrectedReflectance_TrueColor",
    icon: <Globe className="h-4 w-4" />,
    category: "LAND",
    opacity: 0.8,
    enabled: true,
    nasa_source: "MODIS/Terra",
    resolution: "250m",
    update_frequency: "Daily"
  },
  {
    id: "viirs_true_color",
    name: "VIIRS True Color",
    description: "High-resolution true color imagery from VIIRS sensor, better for recent data",
    layer_code: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    icon: <Globe className="h-4 w-4" />,
    category: "LAND",
    opacity: 0.8,
    enabled: false,
    nasa_source: "VIIRS/Suomi NPP",
    resolution: "375m",
    update_frequency: "Daily"
  },
  {
    id: "modis_fires",
    name: "Active Fires",
    description: "Real-time detection of active fires and thermal anomalies",
    layer_code: "MODIS_Terra_Thermal_Anomalies_All",
    icon: <Flame className="h-4 w-4 text-red-500" />,
    category: "HAZARDS",
    opacity: 0.9,
    enabled: false,
    nasa_source: "MODIS/Terra",
    resolution: "1km",
    update_frequency: "Daily"
  },
  {
    id: "gpm_precipitation",
    name: "GPM Precipitation",
    description: "Global precipitation measurements from satellite radar",
    layer_code: "GPM_3IMERGHH_06_precipitation",
    icon: <Droplets className="h-4 w-4 text-blue-500" />,
    category: "WEATHER",
    opacity: 0.7,
    enabled: false,
    nasa_source: "GPM",
    resolution: "10km",
    update_frequency: "30 minutes"
  },
  {
    id: "modis_vegetation",
    name: "Vegetation Index",
    description: "NDVI showing vegetation health and density",
    layer_code: "MOD13A2_M_NDVI",
    icon: <Leaf className="h-4 w-4 text-green-500" />,
    category: "LAND",
    opacity: 0.6,
    enabled: false,
    nasa_source: "MODIS/Terra",
    resolution: "1km",
    update_frequency: "16 days"
  },
  {
    id: "omi_aerosol",
    name: "Air Quality (Aerosols)",
    description: "Atmospheric aerosol optical depth indicating air quality",
    layer_code: "OMI_Aura_Aerosols",
    icon: <Wind className="h-4 w-4 text-gray-500" />,
    category: "ATMOSPHERE",
    opacity: 0.6,
    enabled: false,
    nasa_source: "OMI/Aura",
    resolution: "13x24km",
    update_frequency: "Daily"
  },
  {
    id: "modis_land_surface_temp",
    name: "Land Surface Temperature",
    description: "Day and night land surface temperatures",
    layer_code: "MODIS_Terra_Land_Surface_Temp_Day",
    icon: <Thermometer className="h-4 w-4 text-orange-500" />,
    category: "LAND",
    opacity: 0.7,
    enabled: false,
    nasa_source: "MODIS/Terra",
    resolution: "1km",
    update_frequency: "Daily"
  },
  {
    id: "viirs_night_lights",
    name: "Night Lights",
    description: "Human activity and infrastructure visible at night",
    layer_code: "VIIRS_Black_Marble",
    icon: <Eye className="h-4 w-4 text-yellow-500" />,
    category: "LAND",
    opacity: 0.8,
    enabled: false,
    nasa_source: "VIIRS/Suomi NPP",
    resolution: "500m",
    update_frequency: "Monthly composite"
  }
]

export function SatelliteLayersPanel({ selectedLayers, onLayersChange, location, targetDate }: SatelliteLayersPanelProps) {
  const [layers, setLayers] = useState<SatelliteLayer[]>(() => {
    // Initialize with available layers, preserving any existing selection
    return AVAILABLE_LAYERS.map(layer => {
      const existing = selectedLayers.find(l => l.id === layer.id)
      return existing || layer
    })
  })

  const updateLayer = (layerId: string, updates: Partial<SatelliteLayer>) => {
    const updatedLayers = layers.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    )
    setLayers(updatedLayers)
    onLayersChange(updatedLayers.filter(layer => layer.enabled))
  }

  const toggleLayer = (layerId: string) => {
    updateLayer(layerId, { enabled: !layers.find(l => l.id === layerId)?.enabled })
  }

  const updateOpacity = (layerId: string, opacity: number) => {
    updateLayer(layerId, { opacity })
  }

  const groupedLayers = layers.reduce((groups, layer) => {
    if (!groups[layer.category]) {
      groups[layer.category] = []
    }
    groups[layer.category].push(layer)
    return groups
  }, {} as Record<string, SatelliteLayer[]>)

  const categoryInfo = {
    ATMOSPHERE: { name: "Atmospheric Data", description: "Air quality, aerosols, and atmospheric composition" },
    LAND: { name: "Land Surface", description: "Vegetation, temperature, and surface features" },
    OCEAN: { name: "Ocean Data", description: "Sea surface temperature and ocean conditions" },
    WEATHER: { name: "Weather & Climate", description: "Precipitation, clouds, and weather patterns" },
    HAZARDS: { name: "Natural Hazards", description: "Fires, floods, and environmental threats" }
  }

  const enabledCount = layers.filter(l => l.enabled).length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          NASA Satellite Layers
          <Badge variant="outline">{enabledCount} Active</Badge>
        </CardTitle>
        <CardDescription>
          Select multiple NASA Earth observation layers to enhance your climate analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              const updatedLayers = layers.map(layer => ({ ...layer, enabled: false }))
              setLayers(updatedLayers)
              onLayersChange([])
            }}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide All
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              const hazardLayers = layers.map(layer => ({
                ...layer,
                enabled: layer.category === "HAZARDS" || layer.category === "WEATHER"
              }))
              setLayers(hazardLayers)
              onLayersChange(hazardLayers.filter(l => l.enabled))
            }}
          >
            <Flame className="h-4 w-4 mr-2" />
            Show Hazards
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              const landLayers = layers.map(layer => ({
                ...layer,
                enabled: layer.category === "LAND"
              }))
              setLayers(landLayers)
              onLayersChange(landLayers.filter(l => l.enabled))
            }}
          >
            <Leaf className="h-4 w-4 mr-2" />
            Land Analysis
          </Button>
        </div>

        <Separator />

        {/* Layer Categories */}
        {Object.entries(groupedLayers).map(([category, categoryLayers]) => (
          <div key={category} className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">{categoryInfo[category as keyof typeof categoryInfo]?.name}</h4>
              <p className="text-xs text-muted-foreground">
                {categoryInfo[category as keyof typeof categoryInfo]?.description}
              </p>
            </div>
            
            <div className="space-y-3 pl-2">
              {categoryLayers.map((layer) => (
                <div key={layer.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id={layer.id}
                        checked={layer.enabled}
                        onCheckedChange={() => toggleLayer(layer.id)}
                      />
                      <div className="flex items-center gap-2">
                        {layer.icon}
                        <Label htmlFor={layer.id} className="text-sm font-medium">
                          {layer.name}
                        </Label>
                      </div>
                    </div>
                    
                    {layer.enabled && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">
                          {Math.round(layer.opacity * 100)}%
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={layer.opacity}
                          onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
                          className="w-16 h-2 bg-gray-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="pl-8">
                    <p className="text-xs text-muted-foreground mb-1">
                      {layer.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📡 {layer.nasa_source}</span>
                      <span>📏 {layer.resolution}</span>
                      <span>🔄 {layer.update_frequency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {Object.keys(groupedLayers).indexOf(category) < Object.keys(groupedLayers).length - 1 && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
        
        {/* Information Panel */}
        {enabledCount > 0 && (
          <>
            <Separator />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Satellite className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    {enabledCount} layer{enabledCount > 1 ? 's' : ''} active
                  </p>
                  <p className="text-blue-700 text-xs mt-1">
                    Satellite imagery for {targetDate.year}-{targetDate.month.toString().padStart(2, '0')}-{targetDate.day.toString().padStart(2, '0')} 
                    {location && ` at ${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}