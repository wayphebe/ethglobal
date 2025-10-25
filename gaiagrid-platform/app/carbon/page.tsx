"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Leaf, 
  TrendingUp, 
  Award, 
  Trophy, 
  RefreshCw,
  Download,
  Share2,
  BarChart3,
  Calendar,
  Zap,
  Sun,
  Wind,
  Droplets,
  Activity,
  Battery
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { carbonDataService } from "@/lib/carbon-data-service"
import { CarbonOffsetCard } from "@/components/carbon-offset-card"
import { CarbonTrendChart } from "@/components/carbon-trend-chart"
import { BadgeCollection } from "@/components/badge-collection"
import { CarbonLeaderboard } from "@/components/carbon-leaderboard"
import { CarbonStats, EnvironmentalImpact, Period } from "@/lib/types/carbon"

export default function CarbonPage() {
  const { account } = useWeb3()
  const [stats, setStats] = useState<CarbonStats | null>(null)
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly')

  // Load carbon data
  useEffect(() => {
    if (!account) return

    const loadCarbonData = async () => {
      setIsLoading(true)
      try {
        // Load user stats
        const userStats = await carbonDataService.getCarbonStats(account)
        setStats(userStats)

        // Load environmental impact
        const impact = await carbonDataService.getEnvironmentalImpact(account)
        setEnvironmentalImpact(impact)

      } catch (error) {
        console.error('Failed to load carbon data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCarbonData()
  }, [account])

  // Refresh all data
  const handleRefresh = async () => {
    if (!account) return
    setIsLoading(true)
    try {
      const userStats = await carbonDataService.getCarbonStats(account)
      const impact = await carbonDataService.getEnvironmentalImpact(account)
      setStats(userStats)
      setEnvironmentalImpact(impact)
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Export user data
  const handleExport = async () => {
    if (!account) return
    try {
      const data = await carbonDataService.exportUserData(account)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gaia-carbon-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Share carbon achievements
  const handleShare = async () => {
    if (!stats) return

    const text = `I've offset ${stats.totalOffset.toFixed(2)} tons of CO₂ and earned ${stats.badgesEarned} badges on GaiaGrid! 🌱`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My GaiaGrid Carbon Achievements',
          text,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Carbon Offset Tracking
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect your wallet to start tracking your environmental impact
            </p>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Leaf className="h-10 w-10 text-emerald-600" />
              Carbon Offset Tracking
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Track your environmental impact and earn rewards for sustainable energy use
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total CO₂ Offset</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                      {stats.totalOffset.toFixed(2)} tons
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Lifetime</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                    <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Offset</p>
                    <p className="mt-2 text-2xl font-bold text-blue-600">
                      {stats.monthlyOffset.toFixed(2)} tons
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">This month</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Badges Earned</p>
                    <p className="mt-2 text-2xl font-bold text-purple-600">
                      {stats.badgesEarned}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Achievements</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">DAO Points</p>
                    <p className="mt-2 text-2xl font-bold text-orange-600">
                      {stats.daoPoints.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Voting power</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                    <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Environmental Impact */}
        {environmentalImpact && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Environmental Impact
                </CardTitle>
                <CardDescription>
                  Your contribution to environmental sustainability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {environmentalImpact.treesPlanted}
                    </div>
                    <div className="text-sm text-muted-foreground">Trees Planted Equivalent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {environmentalImpact.carsOffRoad}
                    </div>
                    <div className="text-sm text-muted-foreground">Cars Off Road (miles)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {environmentalImpact.co2Avoided.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">CO₂ Avoided (tons)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {environmentalImpact.energySaved.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Energy Saved (kWh)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <CarbonOffsetCard />
              <BadgeCollection />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <CarbonTrendChart />
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <BadgeCollection />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <CarbonLeaderboard />
          </TabsContent>
        </Tabs>

        {/* Energy Type Legend */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Energy Types</CardTitle>
              <CardDescription>
                Understanding different energy sources and their carbon impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { type: 'solar', icon: Sun, color: '#f59e0b', factor: '0.04 kg CO₂/kWh' },
                  { type: 'wind', icon: Wind, color: '#3b82f6', factor: '0.011 kg CO₂/kWh' },
                  { type: 'geothermal', icon: Droplets, color: '#10b981', factor: '0.006 kg CO₂/kWh' },
                  { type: 'hydroelectric', icon: Activity, color: '#06b6d4', factor: '0.024 kg CO₂/kWh' },
                  { type: 'battery', icon: Battery, color: '#8b5cf6', factor: '0.05 kg CO₂/kWh' },
                  { type: 'grid', icon: Zap, color: '#ef4444', factor: '0.5 kg CO₂/kWh' }
                ].map(({ type, icon: Icon, color, factor }) => (
                  <div key={type} className="text-center space-y-2">
                    <div 
                      className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color }} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium capitalize">{type}</div>
                      <div className="text-xs text-muted-foreground">{factor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
