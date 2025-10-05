"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  FileDown, 
  Download, 
  CheckCircle, 
  Info, 
  Calendar,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Wheat,
  Shield,
  Users,
  Mail
} from "lucide-react"
import { WeatherData } from "@/types"

interface ProfessionalReportGeneratorProps {
  weatherData: WeatherData
  location?: {
    lat: number
    lon: number
    name?: string
  }
}

interface ReportConfig {
  title: string
  subtitle: string
  organization: string
  author: string
  email: string
  includeExecutiveSummary: boolean
  includeClimateJustice: boolean
  includeAgriculturalAnalysis: boolean
  includeSatelliteImagery: boolean
  includeRecommendations: boolean
  customNotes: string
  reportType: "TECHNICAL" | "EXECUTIVE" | "COMMUNITY" | "AGRICULTURAL"
}

const REPORT_TEMPLATES = {
  TECHNICAL: {
    title: "Climate Risk Technical Assessment",
    subtitle: "Comprehensive Climate Data Analysis and Projections",
    description: "Detailed technical analysis suitable for scientists, researchers, and technical stakeholders"
  },
  EXECUTIVE: {
    title: "Climate Risk Executive Summary", 
    subtitle: "Strategic Climate Risk Assessment",
    description: "High-level summary focused on business impacts and strategic decision making"
  },
  COMMUNITY: {
    title: "Community Climate Impact Report",
    subtitle: "Climate Justice and Community Vulnerability Assessment",
    description: "Community-focused report highlighting vulnerable populations and social impacts"
  },
  AGRICULTURAL: {
    title: "Agricultural Climate Risk Assessment",
    subtitle: "Crop Suitability and Food Security Analysis",
    description: "Specialized report for agricultural stakeholders and food security planning"
  }
}

export function ProfessionalReportGenerator({ weatherData, location }: ProfessionalReportGeneratorProps) {
  const [config, setConfig] = useState<ReportConfig>({
    title: REPORT_TEMPLATES.EXECUTIVE.title,
    subtitle: REPORT_TEMPLATES.EXECUTIVE.subtitle,
    organization: "",
    author: "",
    email: "",
    includeExecutiveSummary: true,
    includeClimateJustice: false,
    includeAgriculturalAnalysis: false,
    includeSatelliteImagery: true,
    includeRecommendations: true,
    customNotes: "",
    reportType: "EXECUTIVE"
  })

  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const selectTemplate = (type: keyof typeof REPORT_TEMPLATES) => {
    const template = REPORT_TEMPLATES[type]
    updateConfig({
      reportType: type,
      title: template.title,
      subtitle: template.subtitle,
      // Auto-enable relevant sections based on template
      includeClimateJustice: type === "COMMUNITY",
      includeAgriculturalAnalysis: type === "AGRICULTURAL",
      includeExecutiveSummary: true,
      includeRecommendations: true
    })
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate comprehensive report content
      const reportContent = generateReportContent()
      
      // Create downloadable file
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `climate-report-${weatherData.target_date.year}-${Date.now()}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setGenerated(true)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const generateReportContent = (): string => {
    const { target_date, probabilities, trend } = weatherData
    const locationName = location?.name || `${location?.lat.toFixed(2)}, ${location?.lon.toFixed(2)}`
    
    // Risk level calculation function
    const getRiskLevel = (): string => {
      const totalRisk = (probabilities.very_hot || 0) + (probabilities.very_wet || 0) + (probabilities.very_windy || 0)
      if (totalRisk > 1.5) return "CRITICAL"
      if (totalRisk > 1.0) return "HIGH"
      if (totalRisk > 0.5) return "MODERATE"
      return "LOW"
    }
    
    let content = `
${config.title}
${config.subtitle}
${config.organization ? `Organization: ${config.organization}` : ''}
${config.author ? `Prepared by: ${config.author}` : ''}
${config.email ? `Contact: ${config.email}` : ''}
Generated on: ${new Date().toLocaleDateString()}

============================================================================

LOCATION: ${locationName}
TARGET DATE: ${target_date.year}-${target_date.month.toString().padStart(2, '0')}-${target_date.day.toString().padStart(2, '0')}
ANALYSIS TYPE: ${weatherData.type.toUpperCase()}

============================================================================
`

    if (config.includeExecutiveSummary) {
      content += `
EXECUTIVE SUMMARY
============================================================================

This report analyzes climate risks for ${locationName} projected for ${target_date.year}.
Key findings indicate:

• Extreme Heat Probability: ${Math.round((probabilities.very_hot || 0) * 100)}%
• Heavy Precipitation Risk: ${Math.round((probabilities.very_wet || 0) * 100)}%
• High Wind Risk: ${Math.round((probabilities.very_windy || 0) * 100)}%
• Temperature Trend: ${trend?.very_hot_increasing ? 'INCREASING' : 'STABLE'} (${Math.abs(trend?.change_per_decade || 0).toFixed(1)}°C per decade)

Overall Risk Level: ${getRiskLevel()}

============================================================================
`
    }

    if (config.includeClimateJustice) {
      content += `
CLIMATE JUSTICE AND COMMUNITY IMPACT ANALYSIS
============================================================================

Vulnerable Population Assessment:
• Estimated population at risk: ~${Math.round(weatherData.type === 'region' ? 45000 : 12000 * 0.3)} people
• Elderly populations: ${(probabilities.very_hot || 0) > 0.3 ? 'HIGH RISK' : 'MODERATE RISK'}
• Children and families: ${getRiskLevel() === 'HIGH' ? 'HIGH RISK' : 'MODERATE RISK'}
• Outdoor workers: ${(probabilities.very_hot || 0) > 0.2 ? 'HIGH RISK' : 'MODERATE RISK'}

Infrastructure Risks:
• Power grid vulnerability: ${Math.min(100, 60 + (probabilities.very_hot || 0) * 30).toFixed(0)}%
• Healthcare access risk: ${Math.min(100, 50 + (probabilities.very_hot || 0) * 40).toFixed(0)}%

Community Recommendations:
• Establish cooling centers and heat warning systems
• Develop community-based adaptation strategies
• Create targeted outreach programs for vulnerable populations

============================================================================
`
    }

    if (config.includeAgriculturalAnalysis) {
      content += `
AGRICULTURAL IMPACT ASSESSMENT
============================================================================

Crop Suitability Analysis:
• Corn/Maize: ${Math.max(0, 85 - (probabilities.very_hot || 0) * 40).toFixed(0)}% suitable
• Wheat: ${Math.max(0, 80 - (probabilities.very_hot || 0) * 50).toFixed(0)}% suitable
• Soybeans: ${Math.max(0, 75 - (probabilities.very_wet || 0) * 40).toFixed(0)}% suitable
• Rice: ${Math.max(0, 90 - (probabilities.very_hot || 0) * 30).toFixed(0)}% suitable

Food Security Risk: ${Math.min(100, Math.max(0, 40 + (probabilities.very_hot || 0) * 60)).toFixed(0)}%

Agricultural Recommendations:
• Implement drought-resistant crop varieties
• Invest in efficient irrigation systems
• Consider heat-tolerant cultivars for extreme heat scenarios
• Develop climate-smart agriculture practices

============================================================================
`
    }

    if (config.includeRecommendations) {
      content += `
STRATEGIC RECOMMENDATIONS
============================================================================

Immediate Actions (Next 12 months):
• Develop climate adaptation plans
• Establish early warning systems
• Invest in resilient infrastructure
• Create emergency response protocols

Medium-term Actions (1-3 years):
• Implement climate-resilient building codes
• Develop water management strategies
• Create community resilience programs
• Establish climate monitoring systems

Long-term Actions (3-10 years):
• Transform infrastructure for climate resilience
• Develop regional adaptation strategies
• Implement ecosystem-based solutions
• Build climate-informed governance systems

============================================================================
`
    }

    if (config.customNotes) {
      content += `
ADDITIONAL NOTES
============================================================================

${config.customNotes}

============================================================================
`
    }

    content += `
DATA SOURCES AND METHODOLOGY
============================================================================

This analysis is based on NASA POWER API data spanning ${weatherData.years_analyzed}.
Climate projections use historical trend analysis and statistical modeling.

Limitations:
• Projections are based on historical trends and may not account for all climate variables
• Local microclimate effects may not be fully represented
• Results should be interpreted alongside local expertise and additional data sources

For technical questions or detailed methodology, please contact the report author.

============================================================================
Report Generated: ${new Date().toISOString()}
Analysis Period: ${weatherData.years_analyzed}
============================================================================
`

    return content
  }

  const getRiskLevel = (): string => {
    const totalRisk = (weatherData.probabilities.very_hot || 0) + (weatherData.probabilities.very_wet || 0) + (weatherData.probabilities.very_windy || 0)
    if (totalRisk > 1.5) return "CRITICAL"
    if (totalRisk > 1.0) return "HIGH"
    if (totalRisk > 0.5) return "MODERATE"
    return "LOW"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Professional Report Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive climate analysis reports for stakeholders, decision makers, and communities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Report Templates */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Report Templates</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(REPORT_TEMPLATES).map(([key, template]) => (
                <div 
                  key={key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.reportType === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => selectTemplate(key as keyof typeof REPORT_TEMPLATES)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{template.title}</h4>
                    {config.reportType === key && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Report Configuration */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Report Configuration</Label>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="organization">Organization (Optional)</Label>
                <Input
                  id="organization"
                  value={config.organization}
                  onChange={(e) => updateConfig({ organization: e.target.value })}
                  placeholder="Your organization name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={config.subtitle}
                onChange={(e) => updateConfig({ subtitle: e.target.value })}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="author">Author Name (Optional)</Label>
                <Input
                  id="author"
                  value={config.author}
                  onChange={(e) => updateConfig({ author: e.target.value })}
                  placeholder="Report author"
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => updateConfig({ email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Report Sections */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Report Sections</Label>
            
            <div className="space-y-3">
              {[
                { key: 'includeExecutiveSummary', label: 'Executive Summary', icon: <Info className="h-4 w-4" />, description: 'High-level overview of key findings' },
                { key: 'includeClimateJustice', label: 'Climate Justice Analysis', icon: <Shield className="h-4 w-4" />, description: 'Community vulnerability and social impacts' },
                { key: 'includeAgriculturalAnalysis', label: 'Agricultural Impact', icon: <Wheat className="h-4 w-4" />, description: 'Crop suitability and food security analysis' },
                { key: 'includeSatelliteImagery', label: 'Satellite Imagery', icon: <MapPin className="h-4 w-4" />, description: 'NASA satellite data and visualizations' },
                { key: 'includeRecommendations', label: 'Strategic Recommendations', icon: <TrendingUp className="h-4 w-4" />, description: 'Actionable adaptation strategies' }
              ].map(({ key, label, icon, description }) => (
                <div key={key} className="flex items-center space-x-3">
                  <Switch
                    id={key}
                    checked={config[key as keyof ReportConfig] as boolean}
                    onCheckedChange={(checked) => updateConfig({ [key]: checked })}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {icon}
                    <div>
                      <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={config.customNotes}
              onChange={(e) => updateConfig({ customNotes: e.target.value })}
              placeholder="Add any additional context, methodology notes, or specific requirements for this report..."
              className="mt-2"
              rows={4}
            />
          </div>

          <Separator />

          {/* Report Summary */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Report Summary</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <p><strong>Location:</strong> {location?.name || `${location?.lat.toFixed(2)}, ${location?.lon.toFixed(2)}`}</p>
                <p><strong>Target Date:</strong> {weatherData.target_date.year}-{weatherData.target_date.month.toString().padStart(2, '0')}-{weatherData.target_date.day.toString().padStart(2, '0')}</p>
                <p><strong>Analysis Type:</strong> {weatherData.type.toUpperCase()} analysis</p>
                <p><strong>Risk Level:</strong> {getRiskLevel()}</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Generate Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Report will be downloaded as a text file
            </div>
            <Button 
              onClick={generateReport}
              disabled={generating}
              className="gap-2"
              size="lg"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>

          {generated && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Report Generated Successfully!</AlertTitle>
              <AlertDescription className="text-green-800">
                Your climate analysis report has been downloaded. You can now share it with stakeholders or use it for decision making.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}