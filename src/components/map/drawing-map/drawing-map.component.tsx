"use client"

import { useEffect, useState } from "react";
import * as React from 'react';
import { TileLayer, Marker, Popup } from 'react-leaflet';
import { FeatureCollection } from "geojson";
import { SearchControl } from "./search-control.component";
import { MapController } from "./map-controller.component";
import { EditControlFC } from "./edit-control.component";
import { MapContainerUniqueInstance } from "./map-container.component";
import { DrawingMapProps, GUATEMALA_COORDINATES, SearchMarker } from "./types";

const DrawingMap = React.memo(function DrawingMap({
  allowMultiple = false,
  geojson: externalGeojson,
  setGeojson: externalSetGeojson,
  onGeojsonChange,
  children
}: DrawingMapProps) {
  // Use internal state if no external state is provided
  const [internalGeojson, setInternalGeojson] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  // Use either external or internal state
  const geojson = externalGeojson || internalGeojson;

  // Create a wrapper for setGeojson that calls both the internal and external setters
  const setGeojson = (newGeojson: FeatureCollection) => {
    if (externalSetGeojson) {
      externalSetGeojson(newGeojson);
    } else {
      setInternalGeojson(newGeojson);
    }

    // Call the onChange callback if provided
    if (onGeojsonChange) {
      onGeojsonChange(newGeojson);
    }
  };

  const [center, setCenter] = useState(GUATEMALA_COORDINATES);
  const [searchMarker, setSearchMarker] = useState<SearchMarker | null>(null);

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

  const handleLocationFound = (lat: number, lng: number, displayName: string) => {
    setSearchMarker({ lat, lng, name: displayName });
  };

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      className="border-4 border-red-500 relative"
    >
      <SearchControl onLocationFound={handleLocationFound}/>

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

        {/* Render any children (e.g. report markers) */}
        {typeof children !== "undefined" && children}

        <EditControlFC allowMultiple={allowMultiple} geojson={geojson} setGeojson={setGeojson}/>
      </MapContainerUniqueInstance>
    </div>
  )
});

// Export the memoized component
export default DrawingMap;
