"use client"

import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, Marker, Rectangle } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default marker icon in react-leaflet
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
}

function WeatherMapContent({
  selectionMode,
  selectedPoint,
  onPointSelect,
  selectedRegion,
  onRegionSelect,
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

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
