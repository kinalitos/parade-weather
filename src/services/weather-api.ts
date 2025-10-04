import { PointWeatherData, RegionWeatherData, WeatherData } from "@/types";

interface FetchWeatherParams {
  mode: "point" | "region";
  point?: { lat: number; lon: number };
  region?: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  targetYear: number;
}

/**
 * Fetches weather data for a point or region
 * TODO: Replace mock data with actual API calls to retrieve climate data
 */
export async function fetchWeatherData(
  params: FetchWeatherParams
): Promise<WeatherData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (params.mode === "point" && params.point) {
    return getPointWeatherData(params.point, params.targetYear);
  } else if (params.mode === "region" && params.region) {
    return getRegionWeatherData(params.region, params.targetYear);
  }

  throw new Error("Invalid parameters for weather data fetch");
}

/**
 * Mock function for point weather data
 * TODO: Implement actual API call to retrieve point-specific weather data
 */
function getPointWeatherData(
  location: { lat: number; lon: number },
  targetYear: number
): PointWeatherData {
  return {
    type: "point",
    location,
    target_date: {
      year: targetYear,
      month: 7,
      day: 15,
    },
    probabilities: {
      very_hot: 0.42,
      very_cold: 0.0,
      very_wet: 0.15,
      very_windy: 0.1,
    },
    trend: {
      very_hot_increasing: true,
      change_per_decade: 0.08,
    },
    historical_baseline: {
      temp_max_avg: 28.5,
      precipitation_avg: 2.8,
    },
    years_analyzed: "1981-2024",
  };
}

/**
 * Mock function for regional weather data
 * TODO: Implement actual API call to retrieve regional weather data with grid analysis
 */
function getRegionWeatherData(
  region: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  },
  targetYear: number
): RegionWeatherData {
  return {
    type: "region",
    region: {
      bbox: region,
    },
    target_date: {
      year: targetYear,
      month: 7,
      day: 15,
    },
    probabilities: {
      very_hot: 0.45,
      very_cold: 0.0,
      very_wet: 0.18,
      very_windy: 0.12,
      very_uncomfortable: 0.35,
    },
    regional_stats: {
      temp_max_avg: 29.8,
      temp_max_range: {
        min: 27.2,
        max: 32.1,
      },
      precipitation_avg: 3.5,
    },
    trend: {
      very_hot_increasing: true,
      change_per_decade: 0.09,
    },
    grid_points_analyzed: 16,
    years_analyzed: "1981-2024",
  };
}
