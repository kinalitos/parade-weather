import { FetchWeatherParams, WeatherData } from "@/types";


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

  const resp = response.json();
  console.log(resp);
  return resp;
}
