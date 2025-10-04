import { useState, useMemo } from 'react'
import { LatLngBounds } from "leaflet";
// import { LatLngBounds } from 'leaflet'

export type LayerType = string // More flexible than union type

interface LayerConfig {
  url: string
  bounds: LatLngBounds
}

interface LayerData extends LayerConfig {
  opacity: number
  visible: boolean
}

interface LayerState {
  opacity: number
  visible: boolean
}

interface UseMapLayersConfig {
  layers: Record<string, LayerConfig | null>
  initialVisibility?: Record<string, boolean>
  initialOpacity?: Record<string, number>
  defaultOpacity?: number
  defaultVisibility?: boolean
}

export function useMapLayers({
  layers,
  initialVisibility = {},
  initialOpacity = {},
  defaultOpacity = 0.7,
  defaultVisibility = true
}: UseMapLayersConfig) {
  // Initialize state with defaults for all layer keys
  const layerKeys = Object.keys(layers)

  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(() => {
    const visibility: Record<string, boolean> = {}
    layerKeys.forEach(key => {
      visibility[key] = initialVisibility[key] ?? defaultVisibility
    })
    return visibility
  })

  const [layerOpacity, setLayerOpacity] = useState<Record<string, number>>(() => {
    const opacity: Record<string, number> = {}
    layerKeys.forEach(key => {
      opacity[key] = initialOpacity[key] ?? defaultOpacity
    })
    return opacity
  })

  const layersData = useMemo<Record<string, LayerData | null>>(() => {
    const result: Record<string, LayerData | null> = {}

    Object.entries(layers).forEach(([key, layerConfig]) => {
      if (layerConfig) {
        result[key] = {
          ...layerConfig,
          opacity: layerOpacity[key] ?? defaultOpacity,
          visible: layerVisibility[key] ?? defaultVisibility
        }
      } else {
        result[key] = null
      }
    })

    return result
  }, [layers, layerOpacity, layerVisibility, defaultOpacity, defaultVisibility])

  const toggleLayer = (layer: string) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  const setOpacity = (layer: string, opacity: number) => {
    setLayerOpacity(prev => ({
      ...prev,
      [layer]: opacity
    }))
  }

  const setVisibility = (layer: string, visible: boolean) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: visible
    }))
  }

  return {
    layersData,
    layerVisibility,
    layerOpacity,
    toggleLayer,
    setOpacity,
    setVisibility
  }
}

// Helper function to create bounds from geometry
export async function createBoundsFromGeometry(geometry: { coordinates: number[][][] }) {
  const L = await import('leaflet')

  const coords = geometry.coordinates[0]
  const lats = coords.map(coord => coord[1])
  const lngs = coords.map(coord => coord[0])

  const bounds = {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  }

  return new L.LatLngBounds(
    [bounds.south, bounds.west],
    [bounds.north, bounds.east]
  )
}