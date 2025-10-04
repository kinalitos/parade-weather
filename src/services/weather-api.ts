import { WeatherData } from "@/types";

interface FetchWeatherParams {
  mode: "point" | "region";
  point?: { lat: number; lon: number };
  region?: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  target_year: number;
  target_month: number;
  target_day: number;
}

/**
 * Client-side API call to fetch weather data from our Next.js API route
 * The actual NASA API calls happen server-side to protect credentials
 */
export async function fetchWeatherData(
  params: FetchWeatherParams
): Promise<WeatherData> {
  const response = await fetch("/api/weather", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return response.json();
}
