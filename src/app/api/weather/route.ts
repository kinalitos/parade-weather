import { NextRequest, NextResponse } from "next/server";
import { PointWeatherData, PowerAPIResponse, RegionWeatherData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, point, region, targetYear, month, day } = body;

    if (mode === "point" && point) {
      const data = await fetchPointWeatherData(point, { year: targetYear, month, day });

      return NextResponse.json(data);
    } else if (mode === "region" && region) {
      const data = await fetchRegionWeatherData(region, { year: targetYear, month, day });
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Invalid parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

/**
 * Fetch point-specific weather data
 * TODO: Implement NASA API calls to retrieve climate data for specific coordinates
 * - Use NASA POWER API or similar services
 * - Fetch historical climate data
 * - Calculate probabilities based on historical trends
 */
async function fetchPointWeatherData(
  location: { lat: number; lon: number },
  targetDate: { year: number; month: number; day: number }
): Promise<PointWeatherData> {
  const { year: targetYear, month, day } = targetDate;

  const startYear = 1981;
  const endYear = 2024;

  const startDate = `${startYear}0101`;
  const endDate = `${endYear}1231`;

  const NASA_BEARER_TOKEN = process.env.NASA_BEARER_TOKEN;

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=AG&longitude=${location.lon}&latitude=${location.lat}&start=${startDate}&end=${endDate}&format=JSON`;


  // se hace el fetch al api para jalar los datos
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${NASA_BEARER_TOKEN}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch NASA POWER data");

  const data: PowerAPIResponse = await response.json();

  const temps: number[] = [];
  const precs: number[] = [];
  const winds: number[] = [];

  for (const [date, temp] of Object.entries(data.properties.parameter.T2M)) {
    const t = Number(temp);
    const d = new Date(date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8));
    if (d.getMonth() + 1 === month && d.getDate() === day) {
      temps.push(t);
      precs.push(Number(data.properties.parameter.PRECTOTCORR[date]));
    }
  }

  if (temps.length === 0) throw new Error("No historical data for the specified date");

  //  Calcular promedio histórico para esa fecha
  const temp_max_avg = +Number(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2);
  const precipitation_avg = +Number(precs.reduce((a, b) => a + b, 0) / precs.length).toFixed(2);
  const wind_avg = +Number(winds.length > 0 ? winds.reduce((a, b) => a + b, 0) / winds.length : 5).toFixed(2);
  //calcular las temperatura por año

  //  Calcular tendencia lineal de la temperatura por año
  const yearlyData: { year: number; temp_max: number }[] = [];

  for (let y = startYear; y <= endYear; y++) {
    const dailyTemps = Object.entries(data.properties.parameter.T2M)
      .filter(([date]) => date.startsWith(y.toString()))
      .map(([, t]) => Number(t));
    const avg = dailyTemps.length > 0 ? dailyTemps.reduce((a, b) => a + b, 0) / dailyTemps.length : 0;

    yearlyData.push({ year: y, temp_max: avg });
  }


  const n = yearlyData.length;
  const x = yearlyData.map(d => d.year);
  const yVals = yearlyData.map(d => d.temp_max);
  const x_mean = x.reduce((a, b) => a + b, 0) / n;
  const y_mean = yVals.reduce((a, b) => a + b, 0) / n;
  const numerator = x.reduce((sum, xi, i) => sum + (xi - x_mean) * (yVals[i] - y_mean), 0);
  const denominator = x.reduce((sum, xi) => sum + (xi - x_mean) ** 2, 0);
  const slope_per_year = numerator / denominator;
  const change_per_decade = slope_per_year * 10;

  //probabilidades según el año
  const yearsAhead = targetYear - endYear;
  const temp_projection = temp_max_avg + slope_per_year * yearsAhead;

  const probabilities = {
    very_hot: Number((Math.min(1, Math.max(0, (temp_projection - temp_max_avg) / 5 + 0.4))).toFixed(2)),
    very_cold: Number((Math.min(1, Math.max(0, (temp_max_avg - temp_projection) / 5))).toFixed(2)),
    very_wet: Number((Math.min(1, precipitation_avg / 10)).toFixed(2)),
    very_windy: Number((Math.min(1, wind_avg / 10)).toFixed(2)),
  };

  return {
    type: "point",
    location,
    target_date: { year: targetYear, month, day },
    probabilities,
    trend: { very_hot_increasing: slope_per_year > 0, change_per_decade },
    historical_baseline: { temp_max_avg, precipitation_avg },
    years_analyzed: `${startYear}-${endYear}`,
  };
}

/**
 * Fetch regional weather data
 * TODO: Implement NASA API calls to retrieve climate data for bounding box
 * - Query NASA POWER API for regional grid data
 * - Aggregate data across multiple grid points
 * - Calculate regional statistics and probabilities
 */
async function fetchRegionWeatherData(
  region: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  },
  targetDate: { year: number; month: number; day: number }
): Promise<RegionWeatherData> {

  const { year: targetYear, month, day } = targetDate;
  const startYear = 1981;
  const endYear = 2024;
  const startDate = `${startYear}0101`;
  const endDate = `${endYear}1231`;

  const NASA_BEARER_TOKEN = process.env.NASA_BEARER_TOKEN;

  // Definimos un grid de puntos dentro del bounding box
  const latSteps = 4;
  const lonSteps = 4;
  const latStepSize = (region.lat_max - region.lat_min) / (latSteps - 1);
  const lonStepSize = (region.lon_max - region.lon_min) / (lonSteps - 1);

  const gridPoints: { lat: number; lon: number }[] = [];
  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lonSteps; j++) {
      gridPoints.push({
        lat: region.lat_min + i * latStepSize,
        lon: region.lon_min + j * lonStepSize,
      });
    }
  }

  const tempsAll: number[][] = [];
  const precsAll: number[][] = [];
  const windAll: number[][] = [];
  
  for (const point of gridPoints) {
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,WS2M&community=AG&longitude=${point.lon}&latitude=${point.lat}&start=${startDate}&end=${endDate}&format=JSON`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${NASA_BEARER_TOKEN}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch NASA POWER data for region");

    const data: PowerAPIResponse = await response.json();

    const temps: number[] = [];
    const precs: number[] = [];
    const winds: number[] = [];

    for (const [date, temp] of Object.entries(data.properties.parameter.T2M)) {
      const t = Number(temp);
      const d = new Date(
        date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8)
      );
      if (d.getMonth() + 1 === month && d.getDate() === day) {
        temps.push(t);
        precs.push(Number(data.properties.parameter.PRECTOTCORR[date]));
        winds.push(Number(data.properties.parameter.WS2M?.[date] || 5));
      }
    }

    tempsAll.push(temps);
    precsAll.push(precs);
    windAll.push(winds);
  }

  // Promedios por punto y luego agregados para la región
  const temp_max_avg =
    tempsAll.reduce((sum, arr) => sum + arr.reduce((a, b) => a + b, 0) / arr.length, 0) /
    tempsAll.length;
  const precipitation_avg =
    precsAll.reduce((sum, arr) => sum + arr.reduce((a, b) => a + b, 0) / arr.length, 0) /
    precsAll.length;
  const wind_avg =
    windAll.reduce((sum, arr) => sum + arr.reduce((a, b) => a + b, 0) / arr.length, 0) /
    windAll.length;

  //  Calcular tendencia lineal promedio de temperatura
  const yearlyData: { year: number; temp_max: number }[] = [];

  for (let y = startYear; y <= endYear; y++) {
    const yearlyTemps: number[] = [];

    // iteramos sobre cada punto en el grid
    for (let i = 0; i < gridPoints.length; i++) {
      const tempsPoint = tempsAll[i]; // ya filtrados por mes/día
      if (tempsPoint.length > 0) {
        yearlyTemps.push(tempsPoint.reduce((a, b) => a + b, 0) / tempsPoint.length);
      } else {
        yearlyTemps.push(0); 
      }
    }

    const avg = yearlyTemps.reduce((a, b) => a + b, 0) / yearlyTemps.length;
    yearlyData.push({ year: y, temp_max: avg });
  }

  const n = yearlyData.length;
  const x = yearlyData.map((d) => d.year);
  const yVals = yearlyData.map((d) => d.temp_max);
  const x_mean = x.reduce((a, b) => a + b, 0) / n;
  const y_mean = yVals.reduce((a, b) => a + b, 0) / n;
  const numerator = x.reduce((sum, xi, i) => sum + (xi - x_mean) * (yVals[i] - y_mean), 0);
  const denominator = x.reduce((sum, xi) => sum + (xi - x_mean) ** 2, 0);
  const slope_per_year = numerator / denominator;
  const change_per_decade = slope_per_year * 10;

  // Probabilidades según proyección
  const yearsAhead = targetYear - endYear;
  const temp_projection = temp_max_avg + slope_per_year * yearsAhead;
  const precip_projection = precipitation_avg;

  const probabilities = {
    very_hot: Number(Math.min(1, Math.max(0, (temp_projection - temp_max_avg) / 5 + 0.4)).toFixed(2)),
    very_cold: Number(Math.min(1, Math.max(0, (temp_max_avg - temp_projection) / 5)).toFixed(2)),
    very_wet: Number(Math.min(1, precip_projection / 10).toFixed(2)),
    very_windy: Number(Math.min(1, wind_avg / 10).toFixed(2)),
    very_uncomfortable: Number(Math.min(1, (temp_projection + wind_avg) / 50).toFixed(2)),
  };


  return {
    type: "region",
    region: { bbox: region },
    target_date: { year: targetYear, month, day },
    probabilities,
    regional_stats: {
      temp_max_avg,
      temp_max_range: {
        min: temp_max_avg - 2,
        max: temp_max_avg + 2,
      },
      precipitation_avg,
    },
    trend: { very_hot_increasing: slope_per_year > 0, change_per_decade },
    grid_points_analyzed: gridPoints.length,
    years_analyzed: `${startYear}-${endYear}`,
  };
}
