"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
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
  Mail,
  Satellite,
  BarChart3,
  Globe,
  Thermometer,
  Droplets,
  Wind
} from "lucide-react"
import { WeatherData } from "@/types"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PDFReportGeneratorProps {
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
  includeVisualizations: boolean
  includeRecommendations: boolean
  customNotes: string
  reportType: "TECHNICAL" | "EXECUTIVE" | "COMMUNITY" | "AGRICULTURAL"
  logoUrl?: string
}

const REPORT_TEMPLATES = {
  TECHNICAL: {
    title: "Climate Risk Technical Assessment",
    subtitle: "Comprehensive Climate Data Analysis and Projections",
    description: "Detailed technical analysis suitable for scientists and researchers",
    color: "#1e40af" // Blue
  },
  EXECUTIVE: {
    title: "Climate Risk Executive Summary", 
    subtitle: "Strategic Climate Risk Assessment",
    description: "High-level summary focused on business impacts",
    color: "#7c3aed" // Purple
  },
  COMMUNITY: {
    title: "Community Climate Impact Report",
    subtitle: "Climate Justice and Community Vulnerability Assessment", 
    description: "Community-focused report highlighting vulnerable populations",
    color: "#dc2626" // Red
  },
  AGRICULTURAL: {
    title: "Agricultural Climate Risk Assessment",
    subtitle: "Crop Suitability and Food Security Analysis",
    description: "Specialized report for agricultural stakeholders",
    color: "#059669" // Green
  }
}

export function PDFReportGenerator({ weatherData, location }: PDFReportGeneratorProps) {
  const [config, setConfig] = useState<ReportConfig>({
    title: REPORT_TEMPLATES.EXECUTIVE.title,
    subtitle: REPORT_TEMPLATES.EXECUTIVE.subtitle,
    organization: "",
    author: "",
    email: "",
    includeExecutiveSummary: true,
    includeClimateJustice: false,
    includeAgriculturalAnalysis: false,
    includeVisualizations: true,
    includeRecommendations: true,
    customNotes: "",
    reportType: "EXECUTIVE"
  })

  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState(false)
  const hiddenContentRef = useRef<HTMLDivElement>(null)

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const selectTemplate = (type: keyof typeof REPORT_TEMPLATES) => {
    const template = REPORT_TEMPLATES[type]
    updateConfig({
      reportType: type,
      title: template.title,
      subtitle: template.subtitle,
      includeClimateJustice: type === "COMMUNITY",
      includeAgriculturalAnalysis: type === "AGRICULTURAL",
      includeExecutiveSummary: true,
      includeRecommendations: true
    })
  }

  const getRiskLevel = (): string => {
    const totalRisk = (weatherData.probabilities.very_hot || 0) + (weatherData.probabilities.very_wet || 0) + (weatherData.probabilities.very_windy || 0)
    if (totalRisk > 1.5) return "CRITICAL"
    if (totalRisk > 1.0) return "HIGH" 
    if (totalRisk > 0.5) return "MODERATE"
    return "LOW"
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "#dc2626"
      case "HIGH": return "#ea580c"
      case "MODERATE": return "#d97706"
      default: return "#059669"
    }
  }

  const generatePDF = async () => {
    setGenerating(true)
    setProgress(10)
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      let yPosition = margin
      const template = REPORT_TEMPLATES[config.reportType]
      const locationName = location?.name || `${location?.lat.toFixed(2)}, ${location?.lon.toFixed(2)}`
      
      setProgress(20)
      
      // Cover Page with Professional Design
      await generateCoverPage(pdf, template, locationName, yPosition, contentWidth, pageHeight, margin)
      
      setProgress(30)
      
      // Executive Summary Page
      if (config.includeExecutiveSummary) {
        pdf.addPage()
        yPosition = margin
        yPosition = await generateExecutiveSummary(pdf, yPosition, contentWidth, margin, locationName)
      }
      
      setProgress(45)
      
      // Climate Data Visualizations
      if (config.includeVisualizations) {
        pdf.addPage()
        yPosition = margin
        yPosition = await generateDataVisualizations(pdf, yPosition, contentWidth, margin)
      }
      
      setProgress(60)
      
      // Climate Justice Section
      if (config.includeClimateJustice) {
        pdf.addPage()
        yPosition = margin
        yPosition = await generateClimateJusticeSection(pdf, yPosition, contentWidth, margin)
      }
      
      setProgress(75)
      
      // Agricultural Analysis Section
      if (config.includeAgriculturalAnalysis) {
        pdf.addPage()
        yPosition = margin
        yPosition = await generateAgriculturalSection(pdf, yPosition, contentWidth, margin)
      }
      
      setProgress(90)
      
      // Recommendations and Methodology
      if (config.includeRecommendations) {
        pdf.addPage()
        yPosition = margin
        yPosition = await generateRecommendationsSection(pdf, yPosition, contentWidth, margin)
      }
      
      // Footer on all pages
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        generateFooter(pdf, i, totalPages, pageWidth, pageHeight, margin)
      }
      
      setProgress(100)
      
      // Download the PDF
      const fileName = `climate-report-${weatherData.target_date.year}-${Date.now()}.pdf`
      pdf.save(fileName)
      
      setGenerated(true)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGenerating(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const generateCoverPage = async (pdf: jsPDF, template: any, locationName: string, yPos: number, contentWidth: number, pageHeight: number, margin: number) => {
    // NASA-inspired gradient background (simulated with rectangles)
    pdf.setFillColor(15, 23, 42) // Dark blue
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pageHeight, 'F')
    
    // Header gradient band
    pdf.setFillColor(59, 130, 246) // Blue
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 60, 'F')
    
    // NASA-style accent line
    pdf.setFillColor(34, 197, 94) // Green accent
    pdf.rect(0, 55, pdf.internal.pageSize.getWidth(), 5, 'F')
    
    // Title Section
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(28)
    pdf.setFont("helvetica", "bold")
    const titleLines = pdf.splitTextToSize(config.title, contentWidth - 40)
    pdf.text(titleLines, margin + 20, 35)
    
    // Subtitle
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(203, 213, 225)
    pdf.text(config.subtitle, margin + 20, 50)
    
    // Main Content Section
    yPos = 80
    
    // Organization Logo Placeholder (if provided)
    if (config.organization) {
      pdf.setFillColor(248, 250, 252)
      pdf.roundedRect(margin, yPos, contentWidth, 30, 5, 5, 'F')
      pdf.setTextColor(51, 65, 85)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(config.organization, margin + 10, yPos + 20)
      yPos += 45
    }
    
    // Key Information Panel
    pdf.setFillColor(248, 250, 252)
    pdf.roundedRect(margin, yPos, contentWidth, 80, 8, 8, 'F')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("ANALYSIS OVERVIEW", margin + 15, yPos + 20)
    
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Location: ${locationName}`, margin + 15, yPos + 35)
    pdf.text(`Target Date: ${weatherData.target_date.year}-${weatherData.target_date.month.toString().padStart(2, '0')}-${weatherData.target_date.day.toString().padStart(2, '0')}`, margin + 15, yPos + 45)
    pdf.text(`Analysis Type: ${weatherData.type.toUpperCase()}`, margin + 15, yPos + 55)
    pdf.text(`Risk Level: ${getRiskLevel()}`, margin + 15, yPos + 65)
    
    yPos += 95
    
    // Risk Level Indicator
    const riskLevel = getRiskLevel()
    const riskColor = getRiskColor(riskLevel)
    pdf.setFillColor(...hexToRgb(riskColor))
    pdf.roundedRect(margin, yPos, contentWidth, 25, 5, 5, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text(`CLIMATE RISK ASSESSMENT: ${riskLevel}`, margin + 15, yPos + 17)
    
    yPos += 40
    
    // Key Metrics Panel
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(margin, yPos, contentWidth, 60, 8, 8, 'F')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("KEY CLIMATE PROBABILITIES", margin + 15, yPos + 20)
    
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    const metrics = [
      `Extreme Heat: ${Math.round((weatherData.probabilities.very_hot || 0) * 100)}%`,
      `Heavy Precipitation: ${Math.round((weatherData.probabilities.very_wet || 0) * 100)}%`,
      `High Winds: ${Math.round((weatherData.probabilities.very_windy || 0) * 100)}%`
    ]
    
    metrics.forEach((metric, index) => {
      pdf.text(metric, margin + 15, yPos + 35 + (index * 8))
    })
    
    // Author and Date
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(10)
    if (config.author) {
      pdf.text(`Prepared by: ${config.author}`, margin, pageHeight - 40)
    }
    if (config.email) {
      pdf.text(`Contact: ${config.email}`, margin, pageHeight - 32)
    }
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight - 24)
    
    // NASA Data Attribution
    pdf.setFont("helvetica", "italic")
    pdf.text("Powered by NASA Earth Science Data", margin, pageHeight - 16)
  }

  const generateExecutiveSummary = async (pdf: jsPDF, yPos: number, contentWidth: number, margin: number, locationName: string): Promise<number> => {
    // Page Header
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text("EXECUTIVE SUMMARY", margin, yPos)
    yPos += 15
    
    // Horizontal line
    pdf.setDrawColor(59, 130, 246)
    pdf.setLineWidth(2)
    pdf.line(margin, yPos, margin + contentWidth, yPos)
    yPos += 20
    
    // Summary text
    pdf.setTextColor(51, 65, 85)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    
    const summaryText = `This comprehensive climate risk assessment analyzes projected conditions for ${locationName} in ${weatherData.target_date.year}. Using NASA Earth observation data spanning ${weatherData.years_analyzed}, this analysis provides evidence-based insights into climate risks and their potential impacts on communities, infrastructure, and economic activities.`
    
    const summaryLines = pdf.splitTextToSize(summaryText, contentWidth)
    pdf.text(summaryLines, margin, yPos)
    yPos += summaryLines.length * 6 + 15
    
    // Key Findings Section
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(15, 23, 42)
    pdf.text("KEY FINDINGS", margin, yPos)
    yPos += 15
    
    const findings = [
      `Climate Risk Level: ${getRiskLevel()} - requires ${getRiskLevel() === "HIGH" || getRiskLevel() === "CRITICAL" ? "immediate attention" : "monitoring and preparation"}`,
      `Extreme Heat Probability: ${Math.round((weatherData.probabilities.very_hot || 0) * 100)}% - ${(weatherData.probabilities.very_hot || 0) > 0.5 ? "significant risk to vulnerable populations" : "manageable with standard precautions"}`,
      `Precipitation Risk: ${Math.round((weatherData.probabilities.very_wet || 0) * 100)}% - ${(weatherData.probabilities.very_wet || 0) > 0.4 ? "flood preparedness essential" : "normal drainage sufficient"}`,
      `Climate Trend: ${weatherData.trend?.very_hot_increasing ? "Warming" : "Stable"} (${Math.abs(weatherData.trend?.change_per_decade || 0).toFixed(1)}°C per decade)`
    ]
    
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(51, 65, 85)
    
    findings.forEach((finding, index) => {
      const bullet = "•"
      pdf.text(bullet, margin, yPos)
      const findingLines = pdf.splitTextToSize(finding, contentWidth - 10)
      pdf.text(findingLines, margin + 10, yPos)
      yPos += findingLines.length * 6 + 5
    })
    
    yPos += 10
    
    // Risk Assessment Chart (simplified visual representation)
    pdf.setFillColor(248, 250, 252)
    pdf.roundedRect(margin, yPos, contentWidth, 80, 5, 5, 'F')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("RISK ASSESSMENT MATRIX", margin + 10, yPos + 20)
    
    // Draw simple risk bars
    const risks = [
      { label: "Heat Risk", value: weatherData.probabilities.very_hot || 0, color: "#dc2626" },
      { label: "Flood Risk", value: weatherData.probabilities.very_wet || 0, color: "#2563eb" },
      { label: "Wind Risk", value: weatherData.probabilities.very_windy || 0, color: "#7c3aed" }
    ]
    
    let barYPos = yPos + 35
    risks.forEach((risk, index) => {
      const barWidth = (contentWidth - 80) * risk.value
      const barHeight = 8
      
      pdf.setTextColor(51, 65, 85)
      pdf.setFontSize(10)
      pdf.text(risk.label, margin + 10, barYPos + 6)
      
      // Background bar
      pdf.setFillColor(226, 232, 240)
      pdf.rect(margin + 50, barYPos, contentWidth - 80, barHeight, 'F')
      
      // Value bar
      pdf.setFillColor(...hexToRgb(risk.color))
      pdf.rect(margin + 50, barYPos, barWidth, barHeight, 'F')
      
      // Percentage
      pdf.setTextColor(51, 65, 85)
      pdf.text(`${Math.round(risk.value * 100)}%`, margin + contentWidth - 20, barYPos + 6)
      
      barYPos += 15
    })
    
    return yPos + 90
  }

  const generateDataVisualizations = async (pdf: jsPDF, yPos: number, contentWidth: number, margin: number): Promise<number> => {
    // Page Header
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text("CLIMATE DATA ANALYSIS", margin, yPos)
    yPos += 15
    
    pdf.setDrawColor(59, 130, 246)
    pdf.setLineWidth(2)
    pdf.line(margin, yPos, margin + contentWidth, yPos)
    yPos += 25
    
    // Data Sources Section
    pdf.setFillColor(248, 250, 252)
    pdf.roundedRect(margin, yPos, contentWidth, 40, 5, 5, 'F')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("NASA DATA SOURCES", margin + 10, yPos + 15)
    
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(51, 65, 85)
    pdf.text("• NASA POWER API - Global meteorological data", margin + 10, yPos + 25)
    pdf.text(`• Analysis Period: ${weatherData.years_analyzed}`, margin + 10, yPos + 32)
    
    yPos += 55
    
    // Historical Climate Data Table
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(15, 23, 42)
    pdf.text("CLIMATE STATISTICS", margin, yPos)
    yPos += 20
    
    // Table
    const tableData = [
      ["Parameter", "Historical Average", "Projected Change", "Risk Level"],
      ["Temperature (°C)", `${weatherData.historical_baseline?.temp_max_avg?.toFixed(1) || "N/A"}`, `${weatherData.trend?.change_per_decade?.toFixed(1) || "0.0"}/decade`, getRiskLevel()],
      ["Precipitation (mm)", `${weatherData.historical_baseline?.precipitation_avg?.toFixed(1) || "N/A"}`, "Variable", (weatherData.probabilities.very_wet || 0) > 0.3 ? "HIGH" : "MODERATE"],
      ["Extreme Heat Prob.", `Historical baseline`, `${Math.round((weatherData.probabilities.very_hot || 0) * 100)}%`, (weatherData.probabilities.very_hot || 0) > 0.4 ? "HIGH" : "MODERATE"]
    ]
    
    drawTable(pdf, tableData, margin, yPos, contentWidth)
    yPos += tableData.length * 12 + 20
    
    // Climate Trend Visualization (Simple Line Chart)
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(margin, yPos, contentWidth, 60, 5, 5, 'F')
    pdf.setDrawColor(226, 232, 240)
    pdf.roundedRect(margin, yPos, contentWidth, 60, 5, 5, 'S')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("TEMPERATURE TREND PROJECTION", margin + 10, yPos + 15)
    
    // Simple trend line
    const chartStartX = margin + 20
    const chartStartY = yPos + 45
    const chartWidth = contentWidth - 40
    const chartHeight = 20
    
    pdf.setDrawColor(59, 130, 246)
    pdf.setLineWidth(2)
    
    // Draw trend line based on climate trend
    if (weatherData.trend?.very_hot_increasing) {
      pdf.line(chartStartX, chartStartY, chartStartX + chartWidth, chartStartY - chartHeight)
    } else {
      pdf.line(chartStartX, chartStartY - chartHeight/2, chartStartX + chartWidth, chartStartY - chartHeight/2)
    }
    
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    pdf.text("1981", chartStartX - 5, chartStartY + 8)
    pdf.text(`${weatherData.target_date.year}`, chartStartX + chartWidth - 10, chartStartY + 8)
    
    return yPos + 75
  }

  const generateClimateJusticeSection = async (pdf: jsPDF, yPos: number, contentWidth: number, margin: number): Promise<number> => {
    // Page Header
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text("CLIMATE JUSTICE ASSESSMENT", margin, yPos)
    yPos += 15
    
    pdf.setDrawColor(220, 38, 38)
    pdf.setLineWidth(2)
    pdf.line(margin, yPos, margin + contentWidth, yPos)
    yPos += 25
    
    // Vulnerable Populations Analysis
    pdf.setFillColor(254, 242, 242)
    pdf.roundedRect(margin, yPos, contentWidth, 80, 5, 5, 'F')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("VULNERABLE POPULATIONS AT RISK", margin + 10, yPos + 20)
    
    const populationAtRisk = Math.round((weatherData.type === 'region' ? 45000 : 12000) * 0.3)
    const vulnerabilityData = [
      { group: "Elderly (65+)", risk: (weatherData.probabilities.very_hot || 0) > 0.3 ? "HIGH" : "MODERATE" },
      { group: "Children (<5)", risk: getRiskLevel() === "HIGH" ? "HIGH" : "MODERATE" },
      { group: "Outdoor Workers", risk: (weatherData.probabilities.very_hot || 0) > 0.2 ? "HIGH" : "MODERATE" },
      { group: "Low-Income Households", risk: "MODERATE" }
    ]
    
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(51, 65, 85)
    pdf.text(`Estimated Population at Risk: ~${populationAtRisk.toLocaleString()} people`, margin + 10, yPos + 35)
    
    let listY = yPos + 50
    vulnerabilityData.forEach((item, index) => {
      const riskColor = item.risk === "HIGH" ? "#dc2626" : "#d97706"
      pdf.setFillColor(...hexToRgb(riskColor))
      pdf.circle(margin + 15, listY - 2, 2, 'F')
      
      pdf.setTextColor(51, 65, 85)
      pdf.text(`${item.group}: ${item.risk} RISK`, margin + 25, listY)
      listY += 10
    })
    
    yPos += 100
    
    // Infrastructure Risk Assessment
    pdf.setFillColor(239, 246, 255)
    pdf.roundedRect(margin, yPos, contentWidth, 60, 5, 5, 'F')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("INFRASTRUCTURE VULNERABILITY", margin + 10, yPos + 20)
    
    const infraRisks = [
      { system: "Power Grid", risk: Math.min(100, 60 + (weatherData.probabilities.very_hot || 0) * 30) },
      { system: "Water Supply", risk: Math.min(100, 50 + (weatherData.probabilities.very_hot || 0) * 40) },
      { system: "Healthcare Access", risk: Math.min(100, 40 + getRiskLevel() === "HIGH" ? 30 : 10) }
    ]
    
    let infraY = yPos + 35
    infraRisks.forEach((item, index) => {
      const barWidth = (contentWidth - 100) * (item.risk / 100)
      
      pdf.setTextColor(51, 65, 85)
      pdf.setFontSize(10)
      pdf.text(item.system, margin + 10, infraY + 4)
      
      // Risk bar
      pdf.setFillColor(226, 232, 240)
      pdf.rect(margin + 70, infraY - 2, contentWidth - 100, 6, 'F')
      
      const riskColor = item.risk > 70 ? "#dc2626" : item.risk > 50 ? "#d97706" : "#059669"
      pdf.setFillColor(...hexToRgb(riskColor))
      pdf.rect(margin + 70, infraY - 2, barWidth, 6, 'F')
      
      pdf.text(`${item.risk.toFixed(0)}%`, margin + contentWidth - 20, infraY + 4)
      infraY += 12
    })
    
    return yPos + 75
  }

  const generateAgriculturalSection = async (pdf: jsPDF, yPos: number, contentWidth: number, margin: number): Promise<number> => {
    // Page Header
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text("AGRICULTURAL IMPACT ANALYSIS", margin, yPos)
    yPos += 15
    
    pdf.setDrawColor(5, 150, 105)
    pdf.setLineWidth(2)
    pdf.line(margin, yPos, margin + contentWidth, yPos)
    yPos += 25
    
    // Food Security Risk Overview
    const foodSecurityRisk = Math.min(100, Math.max(0, 40 + (weatherData.probabilities.very_hot || 0) * 60))
    
    pdf.setFillColor(240, 253, 244)
    pdf.roundedRect(margin, yPos, contentWidth, 40, 5, 5, 'F')
    
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("FOOD SECURITY ASSESSMENT", margin + 10, yPos + 20)
    
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(51, 65, 85)
    pdf.text(`Food Security Risk Level: ${foodSecurityRisk.toFixed(0)}% - ${foodSecurityRisk > 60 ? "HIGH CONCERN" : foodSecurityRisk > 30 ? "MODERATE CONCERN" : "LOW CONCERN"}`, margin + 10, yPos + 32)
    
    yPos += 55
    
    // Crop Suitability Analysis
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("CROP SUITABILITY ANALYSIS", margin, yPos)
    yPos += 20
    
    const crops = [
      { name: "Corn (Maize)", suitability: Math.max(0, 85 - (weatherData.probabilities.very_hot || 0) * 40), icon: "🌽" },
      { name: "Wheat", suitability: Math.max(0, 80 - (weatherData.probabilities.very_hot || 0) * 50), icon: "🌾" },
      { name: "Soybeans", suitability: Math.max(0, 75 - (weatherData.probabilities.very_wet || 0) * 40), icon: "🫘" },
      { name: "Rice", suitability: Math.max(0, 90 - (weatherData.probabilities.very_hot || 0) * 30), icon: "🌾" }
    ]
    
    crops.forEach((crop, index) => {
      const suitabilityColor = crop.suitability > 70 ? "#059669" : crop.suitability > 50 ? "#d97706" : "#dc2626"
      
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F')
      pdf.setDrawColor(226, 232, 240)
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'S')
      
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text(`${crop.name}`, margin + 10, yPos + 12)
      
      pdf.setTextColor(51, 65, 85)
      pdf.setFont("helvetica", "normal")
      pdf.text(`${crop.suitability.toFixed(0)}% Suitable`, margin + 80, yPos + 12)
      
      // Suitability bar
      const barWidth = (contentWidth - 150) * (crop.suitability / 100)
      pdf.setFillColor(241, 245, 249)
      pdf.rect(margin + 120, yPos + 8, contentWidth - 150, 8, 'F')
      
      pdf.setFillColor(...hexToRgb(suitabilityColor))
      pdf.rect(margin + 120, yPos + 8, barWidth, 8, 'F')
      
      yPos += 30
    })
    
    return yPos + 10
  }

  const generateRecommendationsSection = async (pdf: jsPDF, yPos: number, contentWidth: number, margin: number): Promise<number> => {
    // Page Header
    pdf.setTextColor(15, 23, 42)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text("STRATEGIC RECOMMENDATIONS", margin, yPos)
    yPos += 15
    
    pdf.setDrawColor(124, 58, 237)
    pdf.setLineWidth(2)
    pdf.line(margin, yPos, margin + contentWidth, yPos)
    yPos += 25
    
    const recommendations = [
      {
        timeframe: "IMMEDIATE (0-12 months)",
        color: "#dc2626",
        actions: [
          "Develop climate adaptation emergency protocols",
          "Establish early warning systems for extreme weather",
          "Create cooling centers and vulnerable population support networks",
          "Implement water conservation measures"
        ]
      },
      {
        timeframe: "MEDIUM-TERM (1-3 years)",
        color: "#d97706", 
        actions: [
          "Upgrade infrastructure for climate resilience",
          "Implement climate-smart agricultural practices",
          "Develop community resilience programs",
          "Establish climate monitoring systems"
        ]
      },
      {
        timeframe: "LONG-TERM (3-10 years)",
        color: "#059669",
        actions: [
          "Transform regional infrastructure systems",
          "Implement ecosystem-based adaptation solutions",
          "Develop climate-informed governance frameworks",
          "Create sustainable economic transition plans"
        ]
      }
    ]
    
    recommendations.forEach((rec, index) => {
      // Timeframe header
      pdf.setFillColor(...hexToRgb(rec.color))
      pdf.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text(rec.timeframe, margin + 10, yPos + 13)
      yPos += 30
      
      // Actions
      rec.actions.forEach((action, actionIndex) => {
        pdf.setTextColor(51, 65, 85)
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        
        // Bullet point
        pdf.setFillColor(...hexToRgb(rec.color))
        pdf.circle(margin + 5, yPos - 2, 1.5, 'F')
        
        const actionLines = pdf.splitTextToSize(action, contentWidth - 20)
        pdf.text(actionLines, margin + 15, yPos)
        yPos += actionLines.length * 5 + 3
      })
      
      yPos += 10
    })
    
    return yPos
  }

  const generateFooter = (pdf: jsPDF, pageNum: number, totalPages: number, pageWidth: number, pageHeight: number, margin: number) => {
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    
    // Page number
    pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
    
    // NASA attribution
    pdf.text("Data Source: NASA Earth Science Division", margin, pageHeight - 10)
    
    // Generation date
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight - 18)
  }

  // Utility functions
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16), 
      parseInt(result[3], 16)
    ] : [0, 0, 0]
  }

  const drawTable = (pdf: jsPDF, data: string[][], x: number, y: number, width: number) => {
    const rowHeight = 12
    const colWidth = width / data[0].length
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellX = x + (colIndex * colWidth)
        const cellY = y + (rowIndex * rowHeight)
        
        // Header row styling
        if (rowIndex === 0) {
          pdf.setFillColor(59, 130, 246)
          pdf.rect(cellX, cellY - 8, colWidth, rowHeight, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFont("helvetica", "bold")
        } else {
          pdf.setFillColor(248, 250, 252)
          pdf.rect(cellX, cellY - 8, colWidth, rowHeight, 'F')
          pdf.setTextColor(51, 65, 85)
          pdf.setFont("helvetica", "normal")
        }
        
        // Border
        pdf.setDrawColor(226, 232, 240)
        pdf.rect(cellX, cellY - 8, colWidth, rowHeight, 'S')
        
        // Text
        pdf.setFontSize(9)
        pdf.text(cell, cellX + 3, cellY - 1)
      })
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Professional PDF Report Generator
            <Badge variant="outline" className="ml-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200">
              Enterprise Quality
            </Badge>
          </CardTitle>
          <CardDescription>
            Generate stunning, publication-ready PDF reports with professional layouts, visualizations, and NASA-quality presentation standards
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
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    config.reportType === key 
                      ? 'border-primary bg-gradient-to-br from-blue-50 to-purple-50 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:shadow-sm'
                  }`}
                  style={{
                    borderLeftColor: config.reportType === key ? template.color : undefined,
                    borderLeftWidth: config.reportType === key ? '4px' : undefined
                  }}
                  onClick={() => selectTemplate(key as keyof typeof REPORT_TEMPLATES)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm" style={{ color: template.color }}>{template.title}</h4>
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
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={config.organization}
                  onChange={(e) => updateConfig({ organization: e.target.value })}
                  placeholder="Your organization name"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={config.subtitle}
                onChange={(e) => updateConfig({ subtitle: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  value={config.author}
                  onChange={(e) => updateConfig({ author: e.target.value })}
                  placeholder="Report author"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => updateConfig({ email: e.target.value })}
                  placeholder="contact@example.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Report Sections */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Report Sections</Label>
            
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { key: 'includeExecutiveSummary', label: 'Executive Summary', icon: <Info className="h-4 w-4 text-blue-500" />, description: 'High-level overview with key findings and risk assessment' },
                { key: 'includeVisualizations', label: 'Data Visualizations', icon: <BarChart3 className="h-4 w-4 text-purple-500" />, description: 'Charts, graphs, and climate trend analysis' },
                { key: 'includeClimateJustice', label: 'Climate Justice Analysis', icon: <Shield className="h-4 w-4 text-red-500" />, description: 'Community vulnerability and infrastructure risk assessment' },
                { key: 'includeAgriculturalAnalysis', label: 'Agricultural Impact', icon: <Wheat className="h-4 w-4 text-green-500" />, description: 'Crop suitability and food security analysis' },
                { key: 'includeRecommendations', label: 'Strategic Recommendations', icon: <TrendingUp className="h-4 w-4 text-orange-500" />, description: 'Actionable adaptation strategies by timeframe' }
              ].map(({ key, label, icon, description }) => (
                <div key={key} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Switch
                    id={key}
                    checked={config[key as keyof ReportConfig] as boolean}
                    onCheckedChange={(checked) => updateConfig({ [key]: checked })}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {icon}
                      <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold">Additional Executive Notes</Label>
            <Textarea
              id="notes"
              value={config.customNotes}
              onChange={(e) => updateConfig({ customNotes: e.target.value })}
              placeholder="Add any additional context, specific requirements, or executive insights for this report..."
              className="mt-2"
              rows={3}
            />
          </div>

          <Separator />

          {/* Progress Bar */}
          {generating && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Generating Professional PDF Report...</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {progress < 30 ? "Creating cover page and layout..." :
                 progress < 60 ? "Generating data visualizations..." :
                 progress < 90 ? "Compiling analysis sections..." :
                 "Finalizing PDF document..."}
              </p>
            </div>
          )}

          {/* Report Preview */}
          <Alert>
            <Satellite className="h-4 w-4" />
            <AlertTitle>Report Preview</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <p><strong>Location:</strong> {location?.name || `${location?.lat.toFixed(2)}, ${location?.lon.toFixed(2)}`}</p>
                <p><strong>Target Date:</strong> {weatherData.target_date.year}-{weatherData.target_date.month.toString().padStart(2, '0')}-{weatherData.target_date.day.toString().padStart(2, '0')}</p>
                <p><strong>Analysis Type:</strong> {weatherData.type.toUpperCase()} analysis</p>
                <p><strong>Risk Level:</strong> <span style={{ color: getRiskColor(getRiskLevel()) }} className="font-semibold">{getRiskLevel()}</span></p>
                <p><strong>Estimated Pages:</strong> {3 + (config.includeClimateJustice ? 1 : 0) + (config.includeAgriculturalAnalysis ? 1 : 0) + (config.includeVisualizations ? 1 : 0)}-{5 + (config.includeClimateJustice ? 1 : 0) + (config.includeAgriculturalAnalysis ? 1 : 0) + (config.includeVisualizations ? 1 : 0)}</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Generate Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Professional PDF with charts, tables, and NASA-quality presentation
            </div>
            <Button 
              onClick={generatePDF}
              disabled={generating}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Professional PDF
                </>
              )}
            </Button>
          </div>

          {generated && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Professional PDF Generated Successfully!</AlertTitle>
              <AlertDescription className="text-green-800">
                Your comprehensive climate analysis report has been downloaded. The report includes professional formatting, 
                data visualizations, and is ready for stakeholder presentations or publication.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Hidden content for PDF generation */}
      <div ref={hiddenContentRef} style={{ position: 'absolute', left: '-9999px' }}>
        {/* This will be used for capturing chart images if needed */}
      </div>
    </div>
  )
}