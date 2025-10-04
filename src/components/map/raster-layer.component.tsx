// components/map/raster-layer.component.tsx
import { ImageOverlay } from 'react-leaflet'
import { LatLngBounds } from 'leaflet'

interface RasterLayerProps {
  url: string
  bounds: LatLngBounds
  opacity: number
  visible: boolean
}

export function RasterLayer({ url, bounds, opacity, visible }: RasterLayerProps) {
  if (!visible) return null

  return (
    <ImageOverlay
      url={url}
      bounds={bounds}
      opacity={opacity}
      zIndex={1000} // Above base map but below UI
    />
  )
}