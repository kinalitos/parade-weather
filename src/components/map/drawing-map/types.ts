import type { LatLngExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import type { MapContainerProps } from 'react-leaflet';

// Constants
export const GUATEMALA_COORDINATES: LatLngExpression = [14.6043, -90.5231];
export const DEBOUNCED_TIME = 500;

// Types
export interface SearchMarker {
  lat: number;
  lng: number;
  name: string;
}

import { ReactNode } from "react";
export interface DrawingMapProps {
  allowMultiple?: boolean;
  geojson?: FeatureCollection;
  setGeojson?: (geojson: FeatureCollection) => void;
  onGeojsonChange?: (geojson: FeatureCollection) => void;
  children?: ReactNode;
}

export interface EditControlProps {
  geojson: FeatureCollection;
  setGeojson: (geojson: FeatureCollection) => void;
  allowMultiple?: boolean;
}

export interface SearchControlProps {
  onLocationFound: (lat: number, lng: number, displayName: string) => void;
}

export interface MapControllerProps {
  center: LatLngExpression;
  searchMarker: SearchMarker | null;
}

export type MapContainerUniqueInstanceProps = MapContainerProps
