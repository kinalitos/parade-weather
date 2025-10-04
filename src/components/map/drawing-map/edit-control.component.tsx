"use client"

import { useEffect, useRef } from "react";
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import * as L from 'leaflet';
import { EditControlProps } from "./types";

export function EditControlFC({ allowMultiple, geojson, setGeojson }: EditControlProps) {
  const ref = useRef<L.FeatureGroup>(null);
  const hasPolygon = geojson.features.length > 0;

  useEffect(() => {
    if (ref.current?.getLayers().length === 0 && geojson) {
      L.geoJSON(geojson).eachLayer((layer) => {
        if (
          layer instanceof L.Polyline ||
          layer instanceof L.Polygon ||
          layer instanceof L.Marker
        ) {
          if (layer?.feature?.properties.radius && ref.current) {
            new L.Circle(layer.feature.geometry.coordinates.slice().reverse(), {
              radius: layer.feature?.properties.radius,
            }).addTo(ref.current);
          } else {
            ref.current?.addLayer(layer);
          }
        }
      });
    }
  }, [geojson]);

  const handleChange = () => {
    const geo = ref.current?.toGeoJSON();
    console.log("Raw GeoJSON from handleChange:", geo);
    
    if (geo?.type === 'FeatureCollection') {
      // Process features to add circle radius information
      const processedFeatures = geo.features.map(feature => {
        // Find the corresponding Leaflet layer to get radius info
        const layers = ref.current?.getLayers() || [];
        const matchingLayer = layers.find(layer => {
          if (layer instanceof L.Circle && feature.geometry.type === 'Point') {
            const layerLatLng = layer.getLatLng();
            const featureCoords = (feature.geometry).coordinates;
            // Check if coordinates match (allowing for small floating point differences)
            return Math.abs(layerLatLng.lat - featureCoords[1]) < 0.00001 &&
                   Math.abs(layerLatLng.lng - featureCoords[0]) < 0.00001;
          }
          return false;
        });

        if (matchingLayer instanceof L.Circle) {
          // This is a circle, add radius to properties
          return {
            ...feature,
            properties: {
              ...feature.properties,
              radius: matchingLayer.getRadius()
            }
          };
        }
        
        return feature;
      });

      const processedGeo = {
        ...geo,
        features: processedFeatures
      };
      
      console.log("Processed GeoJSON with radius info:", processedGeo);
      setGeojson(processedGeo);
    }
  };

  const handleCreated = () => {
    if (!allowMultiple && hasPolygon) return;
    
    // Add a small delay to ensure the layer is properly added before processing
    setTimeout(() => {
      handleChange();
    }, 10);
  };

  return (
    <FeatureGroup ref={ref}>
      <EditControl
        position="topleft"
        onEdited={handleChange}
        onCreated={handleCreated}
        onDeleted={handleChange}
        draw={{
          rectangle: allowMultiple || !hasPolygon,
          circle: allowMultiple || !hasPolygon,
          polygon: allowMultiple || !hasPolygon,
          polyline: false,
          marker: false,
          circlemarker: false,
        }}
      />
    </FeatureGroup>
  );
}