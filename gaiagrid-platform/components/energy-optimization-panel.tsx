"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Zap, 
  Sun, 
  Battery,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"
import { OptimizationSuggestion, UserDevice, EnergyUsage } from "@/lib/types/energy"

interface EnergyOptimizationPanelProps {
  currentUsage: EnergyUsage
  suggestions: OptimizationSuggestion[]
  onApplySuggestion: (suggestionId: string) => void
  devices: UserDevice[]
}

export function EnergyOptimizationPanel({ 
  currentUsage, 
  suggestions, 
  onApplySuggestion,
  devices 
}: EnergyOptimizationPanelProps) {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)

  // Calculate potential total savings
  const totalPotentialSavings = suggestions.reduce((sum, suggestion) => {
    if (!appliedSuggestions.has(suggestion.id)) {
      return sum + suggestion.potentialSavings
    }
    return sum
  }, 0)

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'time_shift': return <Clock className="h-4 w-4" />
      case 'efficiency': return <TrendingUp className="h-4 w-4" />
      case 'scheduling': return <Zap className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  // Handle suggestion application
  const handleApplySuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestionId]))
    onApplySuggestion(suggestionId)
  }

  // Get device name by ID
  const getDeviceName = (deviceId?: string) => {
    if (!deviceId) return null
    const device = devices.find(d => d.id === deviceId)
    return device?.name || 'Unknown Device'
  }

  // Filter suggestions based on showAll state
  const displayedSuggestions = showAllSuggestions 
    ? suggestions 
    : suggestions.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Energy Optimization
        </CardTitle>
        <CardDescription>
          Smart suggestions to improve your energy efficiency and reduce costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Efficiency Overview */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Efficiency</span>
            <span className="text-sm text-muted-foreground">
              {currentUsage.efficiency * 100}%
            </span>
          </div>
          <Progress value={currentUsage.efficiency * 100} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current: {currentUsage.totalConsumption.toFixed(1)} kW</span>
            <span>Generation: {currentUsage.totalGeneration.toFixed(1)} kW</span>
          </div>
        </div>

        {/* Potential Savings Summary */}
        {totalPotentialSavings > 0 && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Potential Savings Available
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalPotentialSavings}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Apply suggestions below to optimize your energy usage
            </div>
          </div>
        )}

        {/* Suggestions List */}
        <div className="space-y-3">
          {displayedSuggestions.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">All Optimized!</h3>
              <p className="text-muted-foreground">
                Your energy usage is already optimized. Great job!
              </p>
            </div>
          ) : (
            displayedSuggestions.map((suggestion) => {
              const isApplied = appliedSuggestions.has(suggestion.id)
              const deviceName = getDeviceName(suggestion.deviceId)
              
              return (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isApplied 
                      ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' 
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSuggestionIcon(suggestion.type)}
                      <span className="font-medium">{suggestion.title}</span>
                      <Badge 
                        variant="secondary" 
                        className={getPriorityColor(suggestion.priority)}
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    {isApplied && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  
                  {deviceName && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Info className="h-3 w-3" />
                      <span>Affects: {deviceName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">
                        +{suggestion.potentialSavings}% savings
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.action}
                      </span>
                    </div>
                    
                    {!isApplied && (
                      <Button
                        size="sm"
                        onClick={() => handleApplySuggestion(suggestion.id)}
                        className="h-8"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Show More/Less Button */}
        {suggestions.length > 3 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
            >
              {showAllSuggestions ? 'Show Less' : `Show All ${suggestions.length} Suggestions`}
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Quick Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Sun className="h-3 w-3 mr-1" />
              Solar Schedule
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Battery className="h-3 w-3 mr-1" />
              Battery Mode
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
