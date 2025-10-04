import { MapContainerUniqueInstance } from "../drawing-map/map-container.component";
import { useCallback, useEffect, useState } from 'react';
import { GUATEMALA_COORDINATES } from '../drawing-map/types';
import { FeatureCollection } from "geojson";
import { FeatureGroup, TileLayer } from 'react-leaflet';
import { RasterLayer } from '@/components/map/raster-layer.component';
import { useMapLayers } from '@/components/map/use-map-layers.hook';
import type { LatLngBounds, LatLngExpression } from 'leaflet';
import * as L from 'leaflet';

type ViewOnlyMapsProps = {
  geojson: FeatureCollection;
  layers?: Record<string, { url: string; bounds: LatLngBounds } | null>;
  layerVisibility?: Record<string, boolean>;
  layerOpacity?: Record<string, number>;
  initialCenter?: LatLngExpression;
}


function ViewOnlyMap({
  geojson,
  layers = {},
  layerVisibility = {},
  layerOpacity = {},
  initialCenter = GUATEMALA_COORDINATES
}: ViewOnlyMapsProps) {
  const [center, setCenter] = useState(initialCenter);

  // Keep the real Leaflet FG in state so updates re-render
  const [fg, setFg] = useState<L.FeatureGroup | null>(null);
  const handleFGRef = useCallback((ref: L.FeatureGroup | null) => {
    setFg(ref);
  }, []);

  const { layersData } = useMapLayers({
    layers,
    initialVisibility: layerVisibility,
    initialOpacity: layerOpacity
  });

  // Render / re-render the GeoJSON whenever fg or geojson changes
  useEffect(() => {
    if (!fg || !geojson) return;

    fg.clearLayers();

    L.geoJSON(geojson).eachLayer((layer) => {
      const isValidLayer =
        layer instanceof L.Polyline ||
        layer instanceof L.Polygon ||
        layer instanceof L.Marker;
      if (!isValidLayer) return;

      const isCircleLayer = Boolean(layer?.feature?.properties?.radius);
      if (!isCircleLayer) {
        fg.addLayer(layer);
        return;
      }

      const [lng, lat] = layer.feature!.geometry.coordinates as [number, number];
      L.circle([lat, lng], {
        radius: layer.feature?.properties.radius,
      }).addTo(fg);
    });
  }, [fg, geojson]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => setCenter(initialCenter)
      );
    }
  }, [initialCenter]);

  return (
    <div style={{ width: '100%', height: '100%' }} className="border-4 relative isolate">
      <MapContainerUniqueInstance
        center={center}
        zoom={16}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />

        {Object.entries(layersData).sort().map(([layerName, layerData]) => {
          if (!layerData) return null;

          const isVisible = layerVisibility[layerName] ?? layerData.visible;
          const opacity = layerOpacity[layerName] ?? layerData.opacity;

          return (
            <RasterLayer
              key={layerName}
              url={layerData.url}
              bounds={layerData.bounds}
              opacity={opacity}
              visible={isVisible}
            />
          );
        })}

        {/* Note the callback ref */}
        <FeatureGroup ref={handleFGRef}/>
      </MapContainerUniqueInstance>
    </div>
  );
}

export default ViewOnlyMap;