"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Wheat, Droplets, Sun, AlertTriangle, TrendingUp, TrendingDown, Leaf, Calendar } from "lucide-react"
import { WeatherData } from "@/types"

interface AgriculturalImpactProps {
  weatherData: WeatherData
  location?: {
    lat: number
    lon: number
    name?: string
  }
}

interface CropAnalysis {
  crop_name: string
  icon: string
  suitability_score: number // 0-100
  risk_factors: {
    drought_stress: number
    heat_stress: number
    flood_risk: number
    wind_damage: number
  }
  recommendations: string[]
  optimal_planting_window?: {
    start_month: number
    end_month: number
  }
}

interface AgriculturalMetrics {
  overall_agricultural_viability: "EXCELLENT" | "GOOD" | "MODERATE" | "POOR" | "CRITICAL"
  food_security_risk: number // 0-100
  crop_analyses: CropAnalysis[]
  seasonal_recommendations: {
    season: string
    actions: string[]
    priority: "HIGH" | "MEDIUM" | "LOW"
  }[]
  climate_adaptation_strategies: string[]
}

// Function to analyze agricultural impact based on weather data
function calculateAgriculturalMetrics(weatherData: WeatherData, location?: any): AgriculturalMetrics {
  const probabilities = weatherData.probabilities
  const trends = weatherData.trend
  
  // Calculate base risk factors
  const drought_risk = Math.max(0, (probabilities.very_hot || 0) * 0.8 - (probabilities.very_wet || 0) * 0.3) * 100
  const flood_risk = (probabilities.very_wet || 0) * 100
  const heat_stress = (probabilities.very_hot || 0) * 100
  const wind_damage = (probabilities.very_windy || 0) * 100
  
  // Define major crops with their climate sensitivities
  const crop_analyses: CropAnalysis[] = [
    {
      crop_name: "Corn (Maize)",
      icon: "🌽",
      suitability_score: Math.max(0, Math.min(100, 85 - drought_risk * 0.4 - heat_stress * 0.3)),
      risk_factors: {
        drought_stress: Math.min(100, drought_risk * 1.2),
        heat_stress: Math.min(100, heat_stress * 1.1),
        flood_risk: Math.min(100, flood_risk * 0.8),
        wind_damage: Math.min(100, wind_damage * 0.9)
      },
      recommendations: [],
      optimal_planting_window: { start_month: 4, end_month: 6 }
    },
    {
      crop_name: "Wheat",
      icon: "🌾",
      suitability_score: Math.max(0, Math.min(100, 80 - heat_stress * 0.5 - drought_risk * 0.3)),
      risk_factors: {
        drought_stress: Math.min(100, drought_risk * 1.0),
        heat_stress: Math.min(100, heat_stress * 1.3),
        flood_risk: Math.min(100, flood_risk * 0.7),
        wind_damage: Math.min(100, wind_damage * 1.1)
      },
      recommendations: [],
      optimal_planting_window: { start_month: 9, end_month: 11 }
    },
    {
      crop_name: "Soybeans",
      icon: "🫘",
      suitability_score: Math.max(0, Math.min(100, 75 - drought_risk * 0.6 - flood_risk * 0.4)),
      risk_factors: {
        drought_stress: Math.min(100, drought_risk * 1.1),
        heat_stress: Math.min(100, heat_stress * 0.9),
        flood_risk: Math.min(100, flood_risk * 1.2),
        wind_damage: Math.min(100, wind_damage * 0.7)
      },
      recommendations: [],
      optimal_planting_window: { start_month: 5, end_month: 7 }
    },
    {
      crop_name: "Rice",
      icon: "🌾",
      suitability_score: Math.max(0, Math.min(100, 90 - drought_risk * 0.8 + flood_risk * 0.2)),
      risk_factors: {
        drought_stress: Math.min(100, drought_risk * 1.4),
        heat_stress: Math.min(100, heat_stress * 0.8),
        flood_risk: Math.max(0, Math.min(100, flood_risk * 0.5)), // Rice tolerates some flooding
        wind_damage: Math.min(100, wind_damage * 1.0)
      },
      recommendations: [],
      optimal_planting_window: { start_month: 3, end_month: 8 }
    }
  ]
  
  // Generate crop-specific recommendations
  crop_analyses.forEach(crop => {
    if (crop.risk_factors.drought_stress > 60) {
      crop.recommendations.push("Implement drought-resistant varieties and efficient irrigation systems")
    }
    if (crop.risk_factors.heat_stress > 50) {
      crop.recommendations.push("Consider heat-tolerant cultivars and shade structures")
    }
    if (crop.risk_factors.flood_risk > 40) {
      crop.recommendations.push("Improve field drainage and consider raised bed planting")
    }
    if (crop.risk_factors.wind_damage > 30) {
      crop.recommendations.push("Install windbreaks and consider staking for tall varieties")
    }
    if (crop.recommendations.length === 0) {
      crop.recommendations.push("Current climate conditions are suitable for standard cultivation practices")
    }
  })
  
  // Calculate overall agricultural viability
  const avg_suitability = crop_analyses.reduce((sum, crop) => sum + crop.suitability_score, 0) / crop_analyses.length
  let overall_agricultural_viability: AgriculturalMetrics['overall_agricultural_viability']
  
  if (avg_suitability > 80) overall_agricultural_viability = "EXCELLENT"
  else if (avg_suitability > 65) overall_agricultural_viability = "GOOD"
  else if (avg_suitability > 45) overall_agricultural_viability = "MODERATE"
  else if (avg_suitability > 25) overall_agricultural_viability = "POOR"
  else overall_agricultural_viability = "CRITICAL"
  
  // Calculate food security risk
  const food_security_risk = Math.min(100, Math.max(0, 100 - avg_suitability + (trends?.very_hot_increasing && trends.change_per_decade > 0.1 ? 20 : 0)))
  
  // Generate seasonal recommendations
  const seasonal_recommendations = [
    {
      season: "Spring Preparation",
      actions: [
        heat_stress > 40 ? "Install shade structures for sensitive crops" : "Prepare standard planting beds",
        drought_risk > 50 ? "Set up efficient irrigation systems" : "Ensure adequate water access",
        "Test soil conditions and adjust fertilization plans"
      ],
      priority: heat_stress > 40 || drought_risk > 50 ? "HIGH" as const : "MEDIUM" as const
    },
    {
      season: "Growing Season",
      actions: [
        "Monitor soil moisture levels daily",
        probabilities.very_hot && probabilities.very_hot > 0.3 ? "Increase irrigation frequency during heat waves" : "Maintain regular watering schedule",
        "Watch for pest and disease pressure changes due to climate stress"
      ],
      priority: "HIGH" as const
    },
    {
      season: "Harvest Period",
      actions: [
        wind_damage > 30 ? "Harvest crops earlier if strong winds are predicted" : "Follow standard harvest timing",
        "Store harvested crops in climate-controlled conditions",
        "Document yield impacts for future planning"
      ],
      priority: wind_damage > 30 ? "HIGH" as const : "MEDIUM" as const
    }
  ]
  
  // Climate adaptation strategies
  const climate_adaptation_strategies = [
    "Diversify crop varieties to spread climate risks",
    "Invest in precision agriculture technologies",
    "Develop water-efficient irrigation systems",
    "Create soil health improvement programs",
    "Establish crop insurance and risk management plans"
  ]
  
  if (trends?.very_hot_increasing && trends.change_per_decade > 0.05) {
    climate_adaptation_strategies.unshift("Transition to heat and drought-tolerant crop varieties")
  }
  
  return {
    overall_agricultural_viability,
    food_security_risk,
    crop_analyses,
    seasonal_recommendations,
    climate_adaptation_strategies
  }
}

export function AgriculturalImpact({ weatherData, location }: AgriculturalImpactProps) {
  const [metrics, setMetrics] = useState<AgriculturalMetrics | null>(null)
  
  useEffect(() => {
    const calculatedMetrics = calculateAgriculturalMetrics(weatherData, location)
    setMetrics(calculatedMetrics)
  }, [weatherData, location])
  
  if (!metrics) return null
  
  const getViabilityColor = (viability: string) => {
    switch (viability) {
      case "EXCELLENT": return "text-green-600 bg-green-50 border-green-200"
      case "GOOD": return "text-green-600 bg-green-50 border-green-200"
      case "MODERATE": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "POOR": return "text-orange-600 bg-orange-50 border-orange-200"
      case "CRITICAL": return "text-red-600 bg-red-50 border-red-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }
  
  const getRiskColor = (score: number) => {
    if (score < 25) return "text-green-600"
    if (score < 50) return "text-yellow-600"
    if (score < 75) return "text-orange-600"
    return "text-red-600"
  }
  
  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className={`border-l-4 ${getViabilityColor(metrics.overall_agricultural_viability)}`}>
        <Wheat className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Agricultural Impact Assessment
          <Badge variant={metrics.overall_agricultural_viability === "CRITICAL" || metrics.overall_agricultural_viability === "POOR" ? "destructive" : "default"}>
            {metrics.overall_agricultural_viability} CONDITIONS
          </Badge>
        </AlertTitle>
        <AlertDescription>
          Climate analysis for {weatherData.target_date.year} indicating {metrics.overall_agricultural_viability.toLowerCase()} 
          agricultural conditions with {metrics.food_security_risk}% food security risk.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Food Security Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Food Security Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Risk Level</span>
                  <span className={`text-lg font-bold ${getRiskColor(metrics.food_security_risk)}`}>
                    {metrics.food_security_risk}/100
                  </span>
                </div>
                <Progress value={metrics.food_security_risk} className="w-full" />
              </div>
              
              <div className="text-sm space-y-1">
                <p className="flex items-center gap-2">
                  {metrics.food_security_risk < 30 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  )}
                  {metrics.food_security_risk < 30 ? "Low risk to food production" : 
                   metrics.food_security_risk < 60 ? "Moderate risk to food production" :
                   "High risk to food production"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Climate Trends Impact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Climate Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Temperature Trend</span>
                <span className="flex items-center gap-1">
                  {weatherData.trend?.very_hot_increasing ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                  )}
                  {Math.abs(weatherData.trend?.change_per_decade || 0).toFixed(1)}°C/decade
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {weatherData.trend?.very_hot_increasing ? 
                  "Rising temperatures may stress crops and increase irrigation needs" :
                  "Stable or cooling temperatures support traditional crop cultivation"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Crop Suitability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Crop Suitability Analysis
          </CardTitle>
          <CardDescription>
            Climate suitability and risk assessment for major crops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.crop_analyses.map((crop, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{crop.icon}</span>
                    <div>
                      <h4 className="font-semibold">{crop.crop_name}</h4>
                      {crop.optimal_planting_window && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Optimal planting: Month {crop.optimal_planting_window.start_month}-{crop.optimal_planting_window.end_month}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{crop.suitability_score}/100</div>
                    <div className="text-xs text-muted-foreground">Suitability</div>
                  </div>
                </div>
                
                {/* Risk Factors */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  {Object.entries(crop.risk_factors).map(([factor, risk]) => (
                    <div key={factor} className="text-center">
                      <div className={`text-sm font-medium ${getRiskColor(risk)}`}>
                        {risk.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {factor.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Recommendations */}
                <div className="space-y-1">
                  <h5 className="text-sm font-medium mb-2">Recommendations:</h5>
                  {crop.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {rec}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Seasonal Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seasonal Action Plan
          </CardTitle>
          <CardDescription>
            Time-sensitive recommendations for optimal agricultural management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.seasonal_recommendations.map((season, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{season.season}</h4>
                  <Badge variant={season.priority === "HIGH" ? "destructive" : season.priority === "MEDIUM" ? "default" : "secondary"}>
                    {season.priority} PRIORITY
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {season.actions.map((action, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {action}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Long-term Adaptation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Climate Adaptation Strategies
          </CardTitle>
          <CardDescription>
            Long-term strategies to build agricultural resilience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.climate_adaptation_strategies.map((strategy, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <p className="text-sm">{strategy}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}