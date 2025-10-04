"use client"

import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, Marker, Rectangle, useMapEvents, useMap } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
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

function WeatherMapContent({
  selectionMode,
  selectedPoint,
  onPointSelect,
  selectedRegion,
  onRegionSelect,
  zoom = 2,
  onZoomChange,
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

        <CenterUpdater center={getCenter()} />
        <ZoomHandler onZoomChange={onZoomChange} />

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
          <Marker position={[selectedPoint.lat, selectedPoint.lon]} />
        )}

        {/* Show selected region rectangle */}
        {selectionMode === "region" && (
          <Rectangle
            bounds={[
              [selectedRegion.lat_min, selectedRegion.lon_min],
              [selectedRegion.lat_max, selectedRegion.lon_max],
            ]}
            pathOptions={{ color: 'red', fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default WeatherMapContent;
