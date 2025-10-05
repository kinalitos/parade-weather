export interface PointWeatherData {
  type: "point"
  location: {
    lat: number
    lon: number
  }
  target_date: {
    year: number
    month: number
    day: number
  }
  probabilities: {
    very_hot: number
    very_cold: number
    very_wet: number
    very_windy: number
  }
  trend: {
    very_hot_increasing: boolean
    change_per_decade: number
  }
  historical_baseline: {
    temp_max_avg: number
    precipitation_avg: number
  }
  years_analyzed: string
  worldview_layer?: {
    url: string;
    layer: string;
  };
}

export interface RegionWeatherData {
  type: "region"
  region: {
    bbox: {
      lat_min: number
      lat_max: number
      lon_min: number
      lon_max: number
    }
    grid_points: {
      lat: number;
      lon: number;
      temp_avg: number;
      precip_avg: number;
    }[];

  }
  target_date: {
    year: number
    month: number
    day: number
  }
  probabilities: {
    very_hot: number
    very_cold: number
    very_wet: number
    very_windy: number
    very_uncomfortable: number
  }
  regional_stats: {
    temp_max_avg: number
    temp_max_range: {
      min: number
      max: number
    }
    precipitation_avg: number
  }
  trend: {
    very_hot_increasing: boolean
    change_per_decade: number
  }
  grid_points_analyzed: number
  years_analyzed: string
  worldview_layer?: {
    url: string;
    layer: string;
  };

}

export type WeatherData = PointWeatherData | RegionWeatherData


export interface PowerAPIResponse {
  properties: {
    parameter: {
      T2M: { [key: string]: number };
      PRECTOTCORR: { [key: string]: number };
      WS2M: { [key: string]: number }; // ⚡ aquí se agrega
    };
  };
}


export interface FetchWeatherParams {
  mode: "point" | "region";
  point?: { lat: number; lon: number };
  region?: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  targetYear: number;
  month: number; 
  day: number;
}
