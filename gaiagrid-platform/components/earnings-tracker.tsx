"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Zap,
  Sun,
  Wind,
  Droplets,
  RefreshCw
} from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRWANFT } from "@/lib/contracts/hooks/useRWANFT"

interface EarningsTrackerProps {
  userAssets: any[]
  earningsHistory: EarningsRecord[]
  onRefresh: () => void
}

interface EarningsRecord {
  date: string
  amount: number
  assetId: string
  assetName: string
}

// Mock earnings history for demo
const MOCK_EARNINGS_HISTORY: EarningsRecord[] = [
  { date: "2025-01-15", amount: 0.0018, assetId: "nft-001", assetName: "Bali Solar Panel Array" },
  { date: "2025-01-16", amount: 0.0021, assetId: "nft-001", assetName: "Bali Solar Panel Array" },
  { date: "2025-01-17", amount: 0.0019, assetId: "nft-001", assetName: "Bali Solar Panel Array" },
  { date: "2025-01-18", amount: 0.0023, assetId: "nft-001", assetName: "Bali Solar Panel Array" },
  { date: "2025-01-19", amount: 0.0020, assetId: "nft-001", assetName: "Bali Solar Panel Array" },
  { date: "2025-01-20", amount: 0.0022, assetId: "nft-001", assetName: "Bali Solar Panel Array" },
  { date: "2025-01-21", amount: 0.0017, assetId: "nft-001", assetName: "Bali Solar Panel Array" },
]

export function EarningsTracker({ 
  userAssets, 
  earningsHistory = MOCK_EARNINGS_HISTORY, 
  onRefresh 
}: EarningsTrackerProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { formatValue, formatAssetType, EnergyAssetType } = useRWANFT()

  // Calculate earnings by asset
  const earningsByAsset = userAssets.map(asset => {
    const assetEarnings = earningsHistory
      .filter(record => record.assetId === asset.tokenId)
      .reduce((sum, record) => sum + record.amount, 0)
    
    return {
      ...asset,
      totalEarnings: assetEarnings,
      dailyEarnings: assetEarnings / 7 // Average over 7 days
    }
  })

  // Calculate totals
  const totalEarnings = earningsByAsset.reduce((sum, asset) => sum + asset.totalEarnings, 0)
  const dailyEarnings = earningsByAsset.reduce((sum, asset) => sum + asset.dailyEarnings, 0)
  const monthlyEarnings = dailyEarnings * 30

  // Get earnings trend
  const getEarningsTrend = () => {
    if (earningsHistory.length < 2) return 'neutral'
    const recent = earningsHistory.slice(-3).reduce((sum, record) => sum + record.amount, 0) / 3
    const older = earningsHistory.slice(-6, -3).reduce((sum, record) => sum + record.amount, 0) / 3
    return recent > older ? 'up' : recent < older ? 'down' : 'neutral'
  }

  const trend = getEarningsTrend()

  // Prepare chart data
  const chartData = earningsHistory.map(record => ({
    date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    earnings: record.amount,
    cumulative: earningsHistory
      .filter(r => new Date(r.date) <= new Date(record.date))
      .reduce((sum, r) => sum + r.amount, 0)
  }))

  // Get asset icon
  const getAssetIcon = (assetType: number) => {
    switch (assetType) {
      case EnergyAssetType.SOLAR_PANEL:
        return <Sun className="h-4 w-4 text-yellow-600" />
      case EnergyAssetType.WIND_TURBINE:
        return <Wind className="h-4 w-4 text-blue-600" />
      case EnergyAssetType.GEOTHERMAL:
        return <Droplets className="h-4 w-4 text-orange-600" />
      case EnergyAssetType.BATTERY_STORAGE:
        return <Zap className="h-4 w-4 text-purple-600" />
      case EnergyAssetType.HYDROELECTRIC:
        return <Droplets className="h-4 w-4 text-cyan-600" />
      case EnergyAssetType.HYBRID_SYSTEM:
        return <Zap className="h-4 w-4 text-green-600" />
      default:
        return <Zap className="h-4 w-4 text-gray-600" />
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    onRefresh()
    setIsRefreshing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings Tracker
            </CardTitle>
            <CardDescription>
              Track your daily earnings from energy asset NFTs
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Earnings Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Daily Earnings</span>
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <div className="text-2xl font-bold">
              {formatValue(dailyEarnings.toString())} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '0%'} from last week
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Monthly Earnings</div>
            <div className="text-2xl font-bold">
              {formatValue(monthlyEarnings.toString())} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              Projected based on current performance
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Total Earnings</div>
            <div className="text-2xl font-bold">
              {formatValue(totalEarnings.toString())} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              All time from {userAssets.length} assets
            </div>
          </div>
        </div>

        {/* Earnings Chart */}
        {chartData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Earnings History</h3>
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
            
            <ChartContainer
              config={{
                earnings: {
                  label: "Daily Earnings",
                  color: "hsl(var(--chart-1))",
                },
                cumulative: {
                  label: "Cumulative",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="var(--color-earnings)"
                    strokeWidth={2}
                    name="Daily Earnings (ETH)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {/* Earnings by Asset */}
        <div>
          <h3 className="font-semibold mb-4">Earnings by Asset</h3>
          <div className="space-y-3">
            {earningsByAsset.length === 0 ? (
              <div className="text-center py-6">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-semibold mb-2">No Assets Yet</h4>
                <p className="text-muted-foreground mb-4">
                  Purchase energy asset NFTs to start earning
                </p>
                <Button asChild>
                  <a href="/marketplace">Browse Marketplace</a>
                </Button>
              </div>
            ) : (
              earningsByAsset.map((asset) => (
                <div key={asset.tokenId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAssetIcon(asset.assetType)}
                    <div>
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatAssetType(asset.assetType)} • {asset.efficiency}% efficiency
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatValue(asset.totalEarnings.toString())} ETH
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatValue(asset.dailyEarnings.toString())} ETH/day
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Insights */}
        {earningsByAsset.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Performance Insights
            </h4>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                • Your best performing asset is generating {formatValue(Math.max(...earningsByAsset.map(a => a.dailyEarnings)).toString())} ETH daily
              </p>
              <p>
                • At current rates, you'll earn {formatValue((monthlyEarnings * 12).toString())} ETH annually
              </p>
              <p>
                • Consider purchasing more assets to increase your passive income
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
