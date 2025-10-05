"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, Heart, Droplets, Thermometer, Wind, Shield, TrendingUp } from "lucide-react"
import { WeatherData } from "@/types"

interface ClimateJusticeDashboardProps {
  weatherData: WeatherData
  location?: {
    lat: number
    lon: number
    name?: string
  }
}

interface VulnerabilityMetrics {
  overall_risk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
  risk_score: number // 0-100
  population_at_risk: number
  vulnerable_groups: {
    elderly: boolean
    children: boolean
    low_income: boolean
    chronic_conditions: boolean
    outdoor_workers: boolean
  }
  infrastructure_risk: {
    power_grid: number // 0-100
    water_supply: number
    healthcare_access: number
    cooling_centers: number
  }
  recommendations: {
    title: string
    description: string
    priority: "HIGH" | "MEDIUM" | "LOW"
    icon: string
  }[]
}

// Mock function to calculate vulnerability based on weather data and location
function calculateVulnerabilityMetrics(weatherData: WeatherData, location?: any): VulnerabilityMetrics {
  const probabilities = weatherData.probabilities
  
  // Calculate risk score based on extreme weather probabilities
  let risk_score = 0
  risk_score += (probabilities.very_hot || 0) * 30
  risk_score += (probabilities.very_wet || 0) * 25
  risk_score += (probabilities.very_windy || 0) * 20
  risk_score += (probabilities.very_cold || 0) * 25
  
  // Add climate trend impact
  if (weatherData.trend?.very_hot_increasing && weatherData.trend.change_per_decade > 0.05) {
    risk_score += 15
  }
  
  risk_score = Math.min(100, Math.round(risk_score))
  
  let overall_risk: VulnerabilityMetrics['overall_risk']
  if (risk_score < 25) overall_risk = "LOW"
  else if (risk_score < 50) overall_risk = "MODERATE"
  else if (risk_score < 75) overall_risk = "HIGH"
  else overall_risk = "CRITICAL"
  
  // Estimate population at risk (mock calculation)
  const estimated_population = weatherData.type === "region" ? 45000 : 12000
  const population_at_risk = Math.round(estimated_population * (risk_score / 100) * 0.3)
  
  // Identify vulnerable groups
  const vulnerable_groups = {
    elderly: risk_score > 40 && (probabilities.very_hot || 0) > 0.3,
    children: risk_score > 35,
    low_income: risk_score > 30,
    chronic_conditions: (probabilities.very_hot || 0) > 0.25 || (probabilities.very_wet || 0) > 0.3,
    outdoor_workers: (probabilities.very_hot || 0) > 0.2 || (probabilities.very_windy || 0) > 0.15
  }
  
  // Infrastructure risk assessment
  const infrastructure_risk = {
    power_grid: Math.min(100, risk_score + ((probabilities.very_hot || 0) * 30)),
    water_supply: Math.min(100, risk_score + ((probabilities.very_wet || 0) * 40) + ((probabilities.very_hot || 0) * 20)),
    healthcare_access: Math.min(100, risk_score * 0.8),
    cooling_centers: Math.min(100, (probabilities.very_hot || 0) * 80 + risk_score * 0.2)
  }
  
  // Generate recommendations
  const recommendations = []
  
  if ((probabilities.very_hot || 0) > 0.3) {
    recommendations.push({
      title: "Heat Emergency Preparedness",
      description: "Establish cooling centers and heat warning systems. Prioritize vulnerable populations.",
      priority: "HIGH" as const,
      icon: "🌡️"
    })
  }
  
  if ((probabilities.very_wet || 0) > 0.2) {
    recommendations.push({
      title: "Flood Risk Mitigation",
      description: "Improve drainage infrastructure and establish evacuation routes for flood-prone areas.",
      priority: "HIGH" as const,
      icon: "💧"
    })
  }
  
  if (vulnerable_groups.elderly || vulnerable_groups.children) {
    recommendations.push({
      title: "Vulnerable Population Support",
      description: "Create targeted outreach programs for elderly residents and families with children.",
      priority: "MEDIUM" as const,
      icon: "👥"
    })
  }
  
  if (infrastructure_risk.power_grid > 60) {
    recommendations.push({
      title: "Grid Resilience Enhancement",
      description: "Invest in backup power systems and grid hardening to prevent climate-related outages.",
      priority: "MEDIUM" as const,
      icon: "⚡"
    })
  }
  
  recommendations.push({
    title: "Community Climate Adaptation",
    description: "Develop community-based adaptation strategies and emergency response plans.",
    priority: "LOW" as const,
    icon: "🏘️"
  })
  
  return {
    overall_risk,
    risk_score,
    population_at_risk,
    vulnerable_groups,
    infrastructure_risk,
    recommendations
  }
}

export function ClimateJusticeDashboard({ weatherData, location }: ClimateJusticeDashboardProps) {
  const [metrics, setMetrics] = useState<VulnerabilityMetrics | null>(null)
  
  useEffect(() => {
    const calculatedMetrics = calculateVulnerabilityMetrics(weatherData, location)
    setMetrics(calculatedMetrics)
  }, [weatherData, location])
  
  if (!metrics) return null
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "bg-green-500"
      case "MODERATE": return "bg-yellow-500"
      case "HIGH": return "bg-orange-500"
      case "CRITICAL": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }
  
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "LOW": return "default"
      case "MODERATE": return "secondary"
      case "HIGH": return "destructive"
      case "CRITICAL": return "destructive"
      default: return "outline"
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className={`border-l-4 ${getRiskColor(metrics.overall_risk)}`}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Climate Justice Impact Assessment
          <Badge variant={getRiskBadgeVariant(metrics.overall_risk)}>
            {metrics.overall_risk} RISK
          </Badge>
        </AlertTitle>
        <AlertDescription>
          Based on climate projections for {weatherData.target_date.year}, this analysis identifies 
          potential impacts on vulnerable communities and provides actionable recommendations.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Risk Score</span>
                  <span className="text-lg font-bold">{metrics.risk_score}/100</span>
                </div>
                <Progress value={metrics.risk_score} className="w-full" />
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className="text-muted-foreground">
                  ~{metrics.population_at_risk.toLocaleString()} people at risk
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Vulnerable Groups */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Vulnerable Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.vulnerable_groups).map(([group, isAtRisk]) => (
                <div key={group} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {group.replace('_', ' ')}
                  </span>
                  <Badge variant={isAtRisk ? "destructive" : "outline"}>
                    {isAtRisk ? "At Risk" : "Low Risk"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Infrastructure Risk */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Infrastructure Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.infrastructure_risk).map(([system, risk]) => (
                <div key={system}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm capitalize">
                      {system.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium">{risk}%</span>
                  </div>
                  <Progress value={risk} className="w-full h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Climate Impacts Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Climate Impact Analysis
          </CardTitle>
          <CardDescription>
            Projected climate conditions and their potential impact on vulnerable communities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="font-medium">Extreme Heat</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((weatherData.probabilities.very_hot || 0) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Probability of dangerous heat conditions
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Heavy Precipitation</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((weatherData.probabilities.very_wet || 0) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Risk of flooding and water damage
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span className="font-medium">High Winds</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((weatherData.probabilities.very_windy || 0) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Potential for power outages
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Climate Trend</span>
              </div>
              <p className="text-2xl font-bold">
                {weatherData.trend?.very_hot_increasing ? "↑" : "↓"} 
                {Math.abs(weatherData.trend?.change_per_decade || 0).toFixed(1)}°C
              </p>
              <p className="text-sm text-muted-foreground">
                Temperature change per decade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Adaptation Recommendations
          </CardTitle>
          <CardDescription>
            Prioritized actions to protect vulnerable communities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant={rec.priority === "HIGH" ? "destructive" : rec.priority === "MEDIUM" ? "default" : "secondary"}>
                    {rec.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}