"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts"
import { 
  TrendingUp, 
  BarChart3, 
  RefreshCw,
  Calendar,
  Leaf
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { carbonDataService } from "@/lib/carbon-data-service"
import { CarbonTrend, Period } from "@/lib/types/carbon"
import { IoTDataSimulator } from "@/lib/iot-data-simulator"

interface CarbonTrendChartProps {
  className?: string
}

export function CarbonTrendChart({ className }: CarbonTrendChartProps) {
  const { account } = useWeb3()
  const [trendData, setTrendData] = useState<CarbonTrend | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  // Load trend data
  useEffect(() => {
    if (!account) return

    const loadTrendData = async () => {
      setIsLoading(true)
      try {
        // Generate mock energy data for demonstration
        const iotSimulator = new IoTDataSimulator()
        const mockDevices = [
          { id: 'solar-001', type: 'solar_panel', name: 'Solar Panel Array' },
          { id: 'wind-001', type: 'general', name: 'Wind Turbine' },
          { id: 'battery-001', type: 'battery', name: 'Battery Storage' }
        ]
        
        // Generate more data for trend analysis
        const hours = selectedPeriod === 'daily' ? 24 : 
                     selectedPeriod === 'weekly' ? 168 : 
                     selectedPeriod === 'monthly' ? 720 : 8760
        const energyData = iotSimulator.generateHistoricalData(hours)
        
        const trend = await carbonDataService.getCarbonTrend(account, selectedPeriod, energyData)
        setTrendData(trend)

      } catch (error) {
        console.error('Failed to load trend data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTrendData()
  }, [account, selectedPeriod])

  // Refresh data
  const handleRefresh = () => {
    if (!account) return
    setTrendData(null)
  }

  // Format data for charts
  const chartData = trendData?.data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(selectedPeriod === 'yearly' && { year: 'numeric' })
    })
  })) || []

  // Calculate statistics
  const totalOffset = chartData.reduce((sum, item) => sum + item.offset, 0)
  const avgOffset = chartData.length > 0 ? totalOffset / chartData.length : 0
  const maxOffset = Math.max(...chartData.map(item => item.offset), 0)
  const minOffset = Math.min(...chartData.map(item => item.offset), 0)

  if (!account) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Carbon Trend
          </CardTitle>
          <CardDescription>Connect your wallet to view carbon trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Please connect your wallet to view carbon trends
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !trendData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Carbon Trend
          </CardTitle>
          <CardDescription>Loading trend data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Carbon Trend
            </CardTitle>
            <CardDescription>
              Your carbon offset over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
            >
              {chartType === 'line' ? <BarChart3 className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as Period)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {totalOffset.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Total (tons)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {avgOffset.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {maxOffset.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Peak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {minOffset.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Low</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'CO₂ Offset (tons)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(2)} tons`, 
                        name === 'offset' ? 'CO₂ Offset' : name
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="offset" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      name="CO₂ Offset"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="generation" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      name="Energy Generation (kWh)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      name="Energy Consumption (kWh)"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'CO₂ Offset (tons)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(2)} tons`, 
                        name === 'offset' ? 'CO₂ Offset' : name
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="offset" 
                      fill="#10b981" 
                      name="CO₂ Offset"
                    />
                    <Bar 
                      dataKey="generation" 
                      fill="#3b82f6" 
                      name="Energy Generation (kWh)"
                    />
                    <Bar 
                      dataKey="consumption" 
                      fill="#ef4444" 
                      name="Energy Consumption (kWh)"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Trend Analysis */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-sm">Trend Analysis</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Your carbon offset has been {avgOffset > 0.1 ? 'increasing' : 'stable'} over the {selectedPeriod} period.
                </p>
                <p>
                  Peak performance: {maxOffset.toFixed(2)} tons on {chartData.find(item => item.offset === maxOffset)?.date || 'N/A'}
                </p>
                <p>
                  Total environmental impact: {totalOffset.toFixed(2)} tons CO₂ offset
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
