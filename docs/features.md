### POST `/api/weather/probability`

**Input:**
```json
{
  "lat": 40.7128,
  "lon": -74.0060,
  "year": 2026,
  "month": 7,
  "day": 15
}
```

**Output:**
```json
{
  "location": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "target_date": {
    "year": 2026,
    "month": 7,
    "day": 15
  },
  "probabilities": {
    "very_hot": 0.48,
    "very_cold": 0.0,
    "very_wet": 0.18,
    "very_windy": 0.12
  },
  "trend": {
    "very_hot_increasing": true,
    "change_per_decade": 0.08
  },
  "historical_baseline": {
    "temp_max_avg": 29.5,
    "precipitation_avg": 3.2
  },
  "years_analyzed": "1981-2024"
}
```

## Backend Logic

1. Fetch historical data for July 15 from 1981-2024
2. Calculate baseline probabilities from historical data
3. **Detect trends** (linear regression on year vs temp/precip)
4. **Project forward** to target year using trend
5. Adjust probabilities based on projection

Example: If July 15 shows +0.5°C per decade trend, and target is 2026 (2 years ahead), add ~0.1°C to threshold calculations.

This way future years account for climate change trends.

## POST POST /api/weather/probability-region

Input:

```json
{
  "bbox": {
    "lat_min": 40.5,
    "lat_max": 41.0,
    "lon_min": -74.5,
    "lon_max": -73.5
  },
  "year": 2026,
  "month": 7,
  "day": 15
}
```

Output: 

```json
{
  "region": {
    "bbox": {
      "lat_min": 40.5,
      "lat_max": 41.0,
      "lon_min": -74.5,
      "lon_max": -73.5
    }
  },
  "target_date": {
    "year": 2026,
    "month": 7,
    "day": 15
  },
  "probabilities": {
    "very_hot": 0.45,
    "very_cold": 0.0,
    "very_wet": 0.18,
    "very_windy": 0.12,
    "very_uncomfortable": 0.35
  },
  "regional_stats": {
    "temp_max_avg": 29.8,
    "temp_max_range": {
      "min": 27.2,
      "max": 32.1
    },
    "precipitation_avg": 3.5
  },
  "trend": {
    "very_hot_increasing": true,
    "change_per_decade": 0.09
  },
  "grid_points_analyzed": 16,
  "years_analyzed": "1981-2024"
}
```

### Map

Create a map where people can pin and draw a rectangle, and obtain the bbox and coordinates

### Search City

Create a seach box component where people can type in a city name and get the bbox and coordinates

Use Nomatim nominatim.openstreetmap.org API
