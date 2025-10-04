"use client"

import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Square } from "lucide-react";

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
const MapContent = dynamic(() => import('./weather-map-content'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export function WeatherMap(props: WeatherMapProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full border rounded-lg overflow-hidden">
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

        {/* Date Inputs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-sm font-medium">Target Date:</span>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="year" className="text-xs">Year</Label>
              <Input
                id="year"
                type="number"
                min={currentYear + 1}
                max={currentYear + 100}
                value={props.targetDate.year}
                onChange={(e) =>
                  props.onDateChange({ ...props.targetDate, year: parseInt(e.target.value) })
                }
                className="w-20 h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="month" className="text-xs">Month</Label>
              <Input
                id="month"
                type="number"
                min={1}
                max={12}
                value={props.targetDate.month}
                onChange={(e) =>
                  props.onDateChange({ ...props.targetDate, month: parseInt(e.target.value) })
                }
                className="w-16 h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="day" className="text-xs">Day</Label>
              <Input
                id="day"
                type="number"
                min={1}
                max={31}
                value={props.targetDate.day}
                onChange={(e) =>
                  props.onDateChange({ ...props.targetDate, day: parseInt(e.target.value) })
                }
                className="w-16 h-8 text-xs"
              />
            </div>
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
      <MapContent {...props} />
    </div>
  );
}
