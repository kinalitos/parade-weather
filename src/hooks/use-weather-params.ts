"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

export interface WeatherSearchParams {
  mode: "point" | "region"
  // Point selection
  lat: number | null
  lon: number | null
  // Region selection
  lat_min: number
  lat_max: number
  lon_min: number
  lon_max: number
  // Target date
  year: number
  month: number
  day: number
  // Optional zoom
  zoom?: number
}

const DEFAULT_PARAMS: WeatherSearchParams = {
  mode: "point",
  lat: null,
  lon: null,
  lat_min: 51.48,
  lat_max: 51.52,
  lon_min: -0.15,
  lon_max: -0.05,
  year: new Date().getFullYear() + 1,
  month: 7,
  day: 15,
  zoom: 13,
}

export function useWeatherSearchParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parse current params from URL
  const parseParams = useCallback((): WeatherSearchParams => {
    const mode = (searchParams.get("mode") as "point" | "region") || DEFAULT_PARAMS.mode

    return {
      mode,
      lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : DEFAULT_PARAMS.lat,
      lon: searchParams.get("lon") ? Number(searchParams.get("lon")) : DEFAULT_PARAMS.lon,
      lat_min: searchParams.get("lat_min") ? Number(searchParams.get("lat_min")) : DEFAULT_PARAMS.lat_min,
      lat_max: searchParams.get("lat_max") ? Number(searchParams.get("lat_max")) : DEFAULT_PARAMS.lat_max,
      lon_min: searchParams.get("lon_min") ? Number(searchParams.get("lon_min")) : DEFAULT_PARAMS.lon_min,
      lon_max: searchParams.get("lon_max") ? Number(searchParams.get("lon_max")) : DEFAULT_PARAMS.lon_max,
      year: searchParams.get("year") ? Number(searchParams.get("year")) : DEFAULT_PARAMS.year,
      month: searchParams.get("month") ? Number(searchParams.get("month")) : DEFAULT_PARAMS.month,
      day: searchParams.get("day") ? Number(searchParams.get("day")) : DEFAULT_PARAMS.day,
      zoom: searchParams.get("zoom") ? Number(searchParams.get("zoom")) : DEFAULT_PARAMS.zoom,
    }
  }, [searchParams])

  // Update URL with new params
  const updateParams = useCallback(
    (updates: Partial<WeatherSearchParams>) => {
      const current = parseParams()
      const newParams = { ...current, ...updates }

      // Build query string
      const params = new URLSearchParams()

      params.set("mode", newParams.mode)

      if (newParams.mode === "point") {
        if (newParams.lat !== null) params.set("lat", newParams.lat.toString())
        if (newParams.lon !== null) params.set("lon", newParams.lon.toString())
      } else {
        params.set("lat_min", newParams.lat_min.toString())
        params.set("lat_max", newParams.lat_max.toString())
        params.set("lon_min", newParams.lon_min.toString())
        params.set("lon_max", newParams.lon_max.toString())
      }

      params.set("year", newParams.year.toString())
      params.set("month", newParams.month.toString())
      params.set("day", newParams.day.toString())

      if (newParams.zoom) {
        params.set("zoom", newParams.zoom.toString())
      }

      // Update URL
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [parseParams, router, pathname]
  )

  return {
    params: parseParams(),
    updateParams,
  }
}
