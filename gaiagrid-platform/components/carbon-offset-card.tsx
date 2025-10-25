"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Award,
  Zap,
  Sun,
  Wind,
  Droplets,
  Activity,
  Battery
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { carbonDataService } from "@/lib/carbon-data-service"
import { CarbonOffset, EnvironmentalImpact, EnergyType } from "@/lib/types/carbon"
import { IoTDataSimulator } from "@/lib/iot-data-simulator"

interface CarbonOffsetCardProps {
  className?: string
}

const ENERGY_TYPE_ICONS = {
  solar: Sun,
  wind: Wind,
  geothermal: Droplets,
  hydroelectric: Activity,
  battery: Battery,
  grid: Zap
}

const ENERGY_TYPE_COLORS = {
  solar: '#f59e0b',
  wind: '#3b82f6',
  geothermal: '#10b981',
  hydroelectric: '#06b6d4',
  battery: '#8b5cf6',
  grid: '#ef4444'
}

export function CarbonOffsetCard({ className }: CarbonOffsetCardProps) {
  const { account } = useWeb3()
  const [currentOffset, setCurrentOffset] = useState<CarbonOffset | null>(null)
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [badgeProgress, setBadgeProgress] = useState<any[]>([])

  // Load carbon offset data
  useEffect(() => {
    if (!account) return

    const loadCarbonData = async () => {
      setIsLoading(true)
      try {
        // Generate mock energy data for demonstration
        const iotSimulator = new IoTDataSimulator()
        const mockDevices = [
          { id: 'solar-001', type: 'solar_panel', name: 'Solar Panel Array' },
          { id: 'wind-001', type: 'general', name: 'Wind Turbine' },
          { id: 'battery-001', type: 'battery', name: 'Battery Storage' }
        ]
        
        const energyData = iotSimulator.generateHistoricalData(24) // 24 hours of data
        
        // Calculate carbon offset
        const offset = await carbonDataService.calculateUserOffset(account, selectedPeriod, energyData)
        setCurrentOffset(offset)

        // Get environmental impact
        const impact = await carbonDataService.getEnvironmentalImpact(account)
        setEnvironmentalImpact(impact)

        // Get badge progress
        const progress = await carbonDataService.getBadgeProgress(account, offset)
        setBadgeProgress(progress)

      } catch (error) {
        console.error('Failed to load carbon data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCarbonData()
  }, [account, selectedPeriod])

  // Refresh data
  const handleRefresh = () => {
    if (!account) return
    // Re-trigger the useEffect
    setCurrentOffset(null)
  }

  if (!account) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Carbon Offset
          </CardTitle>
          <CardDescription>Connect your wallet to view carbon offset data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Please connect your wallet to view your carbon offset
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !currentOffset) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Carbon Offset
          </CardTitle>
          <CardDescription>Loading your carbon offset data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate next badge progress
  const nextBadge = badgeProgress.find(b => b.percentage < 100)
  const nextBadgeProgress = nextBadge ? nextBadge.percentage : 100

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Carbon Offset
            </CardTitle>
            <CardDescription>
              Your environmental impact this {selectedPeriod}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="space-y-4">
            {/* Total Offset */}
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {currentOffset.totalOffset.toFixed(2)} tons
              </div>
              <div className="text-sm text-muted-foreground">CO₂ Offset</div>
            </div>

            {/* Environmental Impact */}
            {environmentalImpact && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-emerald-600">
                    {environmentalImpact.treesPlanted}
                  </div>
                  <div className="text-xs text-muted-foreground">Trees Planted</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {environmentalImpact.carsOffRoad}
                  </div>
                  <div className="text-xs text-muted-foreground">Cars Off Road</div>
                </div>
              </div>
            )}

            {/* Energy Type Breakdown */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Breakdown by Energy Type</div>
              {Object.entries(currentOffset.breakdown).map(([type, data]) => {
                const energyType = type as EnergyType
                const Icon = ENERGY_TYPE_ICONS[energyType]
                const color = ENERGY_TYPE_COLORS[energyType]
                const percentage = (data.offset / currentOffset.totalOffset) * 100

                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color }} />
                        <span className="capitalize">{energyType}</span>
                        <Badge variant="outline" className="text-xs">
                          {data.amount.toFixed(1)} kWh
                        </Badge>
                      </div>
                      <span className="font-medium" style={{ color }}>
                        {data.offset.toFixed(2)} tons ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>

            {/* Next Badge Progress */}
            {nextBadge && (
              <div className="space-y-2 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Next Badge Progress</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {nextBadge.current.toFixed(1)} / {nextBadge.threshold} tons
                    </span>
                    <span className="font-medium">{nextBadge.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={nextBadge.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {nextBadge.timeToUnlock ? `Unlock in ${nextBadge.timeToUnlock}` : 'Keep going!'}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verification Status</span>
              <Badge 
                variant={currentOffset.verificationStatus === 'verified' ? 'default' : 'secondary'}
                className={currentOffset.verificationStatus === 'verified' ? 'bg-emerald-600' : ''}
              >
                {currentOffset.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
