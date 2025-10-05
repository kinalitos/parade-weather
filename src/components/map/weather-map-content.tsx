"use client"

import { useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  FeatureGroup,
  Marker,
  Rectangle,
  useMapEvents,
  useMap
} from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.heat';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
});

interface WeatherMapContentProps {
  selectionMode: "point" | "region";
  selectedPoint: { lat: number; lon: number } | null;
  onPointSelect: (point: { lat: number; lon: number }) => void;
  selectedRegion: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  onRegionSelect: (region: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  }) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  heatmapData?: Array<{
    lat: number;
    lon: number;
    temp_avg: number;
    precip_avg: number;
  }>;
  worldviewLayer?: {
    url: string;
    layer: string;
  };
}

// Component to track zoom changes
function ZoomHandler({ onZoomChange }: { onZoomChange?: (zoom: number) => void }) {
  useMapEvents({
    zoomend: (e) => {
      if (onZoomChange) {
        onZoomChange(e.target.getZoom());
      }
    },
  });
  return null;
}

// Component to update map center without re-rendering
function CenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);

  return null;
}

// Discrete precipitation circles - no blur, clear colors
function HeatmapLayer({
  data
}: {
  data: Array<{ lat: number; lon: number; temp_avg: number; precip_avg: number }>
}) {
  const map = useMap();

  // useEffect(() => {
  //   if (!data || data.length === 0) return;
  //
  //   // Find min/max for color scale
  //   const precips = data.map(d => d.precip_avg);
  //   const minPrecip = Math.min(...precips);
  //   const maxPrecip = Math.max(...precips);
  //   const precipRange = maxPrecip - minPrecip;
  //
  //   // Color scale function
  //   const getColor = (value: number) => {
  //     const normalized = precipRange > 0 ? (value - minPrecip) / precipRange : 0.5;
  //
  //     if (normalized < 0.2) return '#440154';  // Dark purple
  //     if (normalized < 0.4) return '#31688e';  // Blue
  //     if (normalized < 0.6) return '#35b779';  // Green
  //     if (normalized < 0.8) return '#fde724';  // Yellow
  //     return '#cc0000';  // Red
  //   };
  //
  //   // Create circle markers for each point
  //   const circles: L.Circle[] = data.map(point => {
  //     return L.circle([point.lat, point.lon], {
  //       radius: 2500,  // 25km radius
  //       fillColor: getColor(point.precip_avg),
  //       fillOpacity: 0.6,
  //       color: getColor(point.precip_avg),
  //       weight: 2,
  //       opacity: 0.8
  //     }).addTo(map);
  //   });
  //
  //   // Cleanup on unmount
  //   return () => {
  //     circles.forEach(circle => map.removeLayer(circle));
  //   };
  // }, [data, map]);

  return null;
}

function WeatherMapContent({
  selectionMode,
  selectedPoint,
  onPointSelect,
  selectedRegion,
  onRegionSelect,
  zoom = 2,
  onZoomChange,
  heatmapData,
  worldviewLayer,
}: WeatherMapContentProps) {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  // Clear drawings when switching modes
  useEffect(() => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
  }, [selectionMode]);

  const handleCreated = (e: any) => {
    const { layerType, layer } = e;

    if (selectionMode === "point" && layerType === "marker") {
      const { lat, lng } = layer.getLatLng();
      onPointSelect({ lat, lon: lng });

      // Clear the drawn marker since we'll show it with our own component
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }
    } else if (selectionMode === "region" && layerType === "rectangle") {
      const bounds = layer.getBounds();
      const { lat: lat_min, lng: lon_min } = bounds.getSouthWest();
      const { lat: lat_max, lng: lon_max } = bounds.getNorthEast();

      onRegionSelect({ lat_min, lat_max, lon_min, lon_max });

      // Clear the drawn rectangle since we'll show it with our own component
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }
    }
  };

  // Determine map center based on selection
  const getCenter = (): [number, number] => {
    if (selectionMode === "point" && selectedPoint) {
      return [selectedPoint.lat, selectedPoint.lon];
    } else if (selectionMode === "region") {
      // Center of the region bbox
      const centerLat = (selectedRegion.lat_min + selectedRegion.lat_max) / 2;
      const centerLon = (selectedRegion.lon_min + selectedRegion.lon_max) / 2;
      return [centerLat, centerLon];
    }
    // Default to world view
    return [20, 0];
  };

  console.log({ worldviewLayer })

  return (
    <div className="h-[280px] md:h-[500px] w-full">
      <MapContainer
        center={[20, 0]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* NASA MODIS Satellite Imagery */}
        {worldviewLayer && (() => {
          // Extract TIME parameter from the snapshot URL
          const timeMatch = worldviewLayer.url.match(/TIME=([^&]+)/);
          const time = timeMatch ? timeMatch[1] : undefined;

          return (
            <WMSTileLayer
              url="https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
              params={{
                layers: worldviewLayer.layer,
              }}
              // @ts-ignore
              time={time}
              format="image/png"
              transparent={true}
              version="1.3.0"
              opacity={0.7}
            />
          );
        })()}

        <CenterUpdater center={getCenter()}/>
        <ZoomHandler onZoomChange={onZoomChange}/>

        {/* Render heatmap if data is available */}
        {heatmapData && heatmapData.length > 0 && (
          <HeatmapLayer data={heatmapData}/>
        )}

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              rectangle: selectionMode === "region",
              marker: selectionMode === "point",
              circle: false,
              circlemarker: false,
              polygon: false,
              polyline: false,
            }}
            edit={{
              edit: false,
              remove: false,
            }}
          />
        </FeatureGroup>

        {/* Show selected point marker */}
        {selectionMode === "point" && selectedPoint && (
          <Marker position={[selectedPoint.lat, selectedPoint.lon]}/>
        )}

        {/* Show selected region rectangle */}
        {selectionMode === "region" && (
          <Rectangle
            bounds={[
              [selectedRegion.lat_min, selectedRegion.lon_min],
              [selectedRegion.lat_max, selectedRegion.lon_max],
            ]}
            pathOptions={{ color: '#6366f1', fillOpacity: 0.1, weight: 3 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default WeatherMapContent;
