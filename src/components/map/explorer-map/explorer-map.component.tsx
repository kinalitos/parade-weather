"use client"

import { useEffect, useState, useCallback } from "react";
import * as React from 'react';
import { TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { FeatureCollection } from "geojson";
import { SearchControl } from "../drawing-map/search-control.component";
import { MapController } from "../drawing-map/map-controller.component";
import { EditControlFC } from "../drawing-map/edit-control.component";
import { MapContainerUniqueInstance } from "../drawing-map/map-container.component";
import { GUATEMALA_COORDINATES, SearchMarker } from "../drawing-map/types";
import { PhytoremediationReport } from "@/data/reports/report.types";
import { Badge } from "@/components/ui/badge";
import * as L from 'leaflet';

interface ExplorerMapProps {
  reports: PhytoremediationReport[];
  selectedPolygon?: FeatureCollection;
  onPolygonChange?: (geojson: FeatureCollection) => void;
  getScoreColor: (score: number, scoreLabel?: string) => string;
  getLocalizedScoreLabel: (scoreLabel: string) => string;
}

const ExplorerMap = React.memo(function ExplorerMap({
  reports,
  selectedPolygon,
  onPolygonChange,
  getScoreColor,
  getLocalizedScoreLabel
}: ExplorerMapProps) {
  const [internalGeojson, setInternalGeojson] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  const [center, setCenter] = useState(GUATEMALA_COORDINATES);
  const [searchMarker, setSearchMarker] = useState<SearchMarker | null>(null);
  const [reportFg, setReportFg] = useState<L.FeatureGroup | null>(null);

  // Use external polygon or internal state
  const geojson = selectedPolygon || internalGeojson;

  const setGeojson = (newGeojson: FeatureCollection) => {
    if (onPolygonChange) {
      onPolygonChange(newGeojson);
    } else {
      setInternalGeojson(newGeojson);
    }
  };

  const handleReportFGRef = useCallback((ref: L.FeatureGroup | null) => {
    setReportFg(ref);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          setCenter(GUATEMALA_COORDINATES);
        }
      );
    }
  }, []);

  // Render report polygons
  useEffect(() => {
    if (!reportFg || !reports) return;

    reportFg.clearLayers();

    reports.forEach((report) => {
      if (report.geometry && report.geometry.type === 'Polygon') {
        const colorClass = getScoreColor(report.score, report.score_label);
        // Extract color from CSS class
        let color = '#3B82F6'; // default blue
        let fillColor = '#DBEAFE'; // default blue fill
        
        if (colorClass.includes('green')) {
          color = '#16A34A';
          fillColor = '#DCFCE7';
        } else if (colorClass.includes('orange')) {
          color = '#EA580C';
          fillColor = '#FED7AA';
        } else if (colorClass.includes('red')) {
          color = '#DC2626';
          fillColor = '#FEE2E2';
        }

        const layer = L.geoJSON(report.geometry, {
          style: () => ({
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: fillColor,
            fillOpacity: 0.4,
          })
        });

        layer.bindPopup(`
          <div class="p-3 min-w-64">
            <h3 class="font-bold text-lg text-gray-800 mb-2">${report.zone_name || 'Unnamed Zone'}</h3>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600">Score:</span>
                <span class="font-bold text-lg" style="color: ${color}">${report.score}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600">Viabilidad:</span>
                <span class="text-sm font-semibold">${getLocalizedScoreLabel(report.score_label)}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600">Contaminante:</span>
                <span class="text-sm">${report.suspected_contaminant || 'Desconocido'}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600">Fecha:</span>
                <span class="text-sm">${new Date(report.timestamp).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
            
            <div class="mt-4 space-y-2">
              <div class="text-xs text-gray-600">
                <strong>Resumen del análisis:</strong>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>NDVI: ${report.summary.ndvi_mean.toFixed(3)}</div>
                <div>NDWI: ${report.summary.ndwi_mean.toFixed(3)}</div>
                <div>Temp: ${report.summary.temperature_avg}°C</div>
                <div>Humedad: ${report.summary.humidity_avg}%</div>
              </div>
              
              <div class="text-xs text-gray-600 mt-2">
                <strong>Especies recomendadas:</strong>
              </div>
              <div class="text-xs max-h-20 overflow-y-auto">
                ${report.recommended_species.slice(0, 3).map(species => 
                  `<div class="mb-1">• ${species.common_name} (${species.name})</div>`
                ).join('')}
                ${report.recommended_species.length > 3 ? `<div class="text-gray-500">+${report.recommended_species.length - 3} más...</div>` : ''}
              </div>
            </div>
            
            <div class="mt-3 pt-2 border-t">
              <a href="/report/${report.id}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver reporte completo →</a>
            </div>
          </div>
        `);

        reportFg.addLayer(layer);
      }
    });
  }, [reportFg, reports, getScoreColor, getLocalizedScoreLabel]);

  const handleLocationFound = (lat: number, lng: number, displayName: string) => {
    setSearchMarker({ lat, lng, name: displayName });
  };

  return (
    <div style={{ width: '100%', height: '100%' }} className="relative">
      <SearchControl onLocationFound={handleLocationFound}/>
      

      <MapContainerUniqueInstance
        center={center}
        zoom={12}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} searchMarker={searchMarker}/>

        {searchMarker && (
          <Marker position={[searchMarker.lat, searchMarker.lng]}>
            <Popup>
              <div>
                <strong>Search Result</strong>
                <br/>
                {searchMarker.name}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drawing controls for user polygon */}
        <EditControlFC allowMultiple={false} geojson={geojson} setGeojson={setGeojson}/>
        
        {/* Feature group for report polygons */}
        <FeatureGroup ref={handleReportFGRef} />
      </MapContainerUniqueInstance>
    </div>
  );
});

export default ExplorerMap;
