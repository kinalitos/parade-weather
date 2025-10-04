"use client"

import { useEffect } from "react";
import { MapContainer } from 'react-leaflet';
import * as React from 'react';
import * as L from 'leaflet';
import { MapContainerUniqueInstanceProps } from "./types";

export const MapContainerUniqueInstance = React.memo(function MapContainerUniqueInstance(props: MapContainerUniqueInstanceProps) {
  useEffect(() => {
    // Initialize default marker icons for Leaflet
    const defaultIcon = new L.Icon.Default();
    defaultIcon.options.iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
    defaultIcon.options.iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
    defaultIcon.options.shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';
    L.Marker.prototype.options.icon = defaultIcon;

    return () => {
      const m = L.DomUtil.get("map") as (HTMLElement & { _leaflet_id: number | null }) | null;
      if (m) {
        m._leaflet_id = null;
        L.map(m).off();
        L.map(m).remove();
      }
    };
  }, []);

  return <MapContainer {...props} />
});