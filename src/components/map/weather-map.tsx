"use client"

import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { MapPin, Square } from "lucide-react";
import { addDays, addYears } from "date-fns";

interface WeatherMapProps {
  selectionMode: "point" | "region";
  onSelectionModeChange: (mode: "point" | "region") => void;
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
  targetDate: {
    year: number;
    month: number;
    day: number;
  };
  onDateChange: (date: { year: number; month: number; day: number }) => void;
}

// Dynamically import the map component with no SSR
const MapLoadingContent = dynamic(() => import('./weather-map-content'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export function WeatherMap(props: WeatherMapProps) {
  // Convert {year, month, day} to Date
  const dateFromTargetDate = new Date(
    props.targetDate.year,
    props.targetDate.month - 1, // JS months are 0-indexed
    props.targetDate.day
  );

  // Handle date change from DatePicker
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      props.onDateChange({
        year: date.getFullYear(),
        month: date.getMonth() + 1, // Convert back to 1-indexed
        day: date.getDate(),
      });
    }
  };

  // Date constraints
  const tomorrow = addDays(new Date(), 1);
  const maxDate = addYears(new Date(), 100);

  return (
    <div className="w-full border rounded-lg overflow-hidden isolate">
      {/* Controls */}
      <div className="p-4 border-b bg-muted/50 space-y-4">
        {/* Mode Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="text-sm font-medium">Selection Mode:</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={props.selectionMode === "point" ? "default" : "outline"}
              onClick={() => props.onSelectionModeChange("point")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Pin Point
            </Button>
            <Button
              size="sm"
              variant={props.selectionMode === "region" ? "default" : "outline"}
              onClick={() => props.onSelectionModeChange("region")}
            >
              <Square className="h-4 w-4 mr-2" />
              Draw Rectangle
            </Button>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-sm font-medium">Target Date:</span>
          <div className="w-full sm:w-auto">
            <DatePicker
              date={dateFromTargetDate}
              onDateChange={handleDateChange}
              disabled={(date) => date < tomorrow || date > maxDate}
              fromDate={tomorrow}
              toDate={maxDate}
            />
          </div>
        </div>

        {/* Selection info */}
        <div className="text-xs text-muted-foreground">
          {props.selectionMode === "point" && props.selectedPoint ? (
            <span>
              Selected Point: {props.selectedPoint.lat.toFixed(4)}, {props.selectedPoint.lon.toFixed(4)}
            </span>
          ) : props.selectionMode === "region" ? (
            <span>
              Selected Region: ({props.selectedRegion.lat_min.toFixed(2)}, {props.selectedRegion.lon_min.toFixed(2)}) to (
              {props.selectedRegion.lat_max.toFixed(2)}, {props.selectedRegion.lon_max.toFixed(2)})
            </span>
          ) : null}
        </div>
      </div>

      {/* Map */}
      <MapLoadingContent {...props} />
    </div>
  );
}
