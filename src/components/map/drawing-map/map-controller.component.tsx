"use client"

import { useEffect } from "react";
import { useMap } from 'react-leaflet';
import { MapControllerProps } from "./types";

export function MapController({ center, searchMarker }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (searchMarker) {
      map.setView([searchMarker.lat, searchMarker.lng], 16);
    }
  }, [map, searchMarker]);

  return null;
}