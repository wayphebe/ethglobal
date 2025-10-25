"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts"
import { 
  Vote, 
  Zap, 
  TrendingUp, 
  Info, 
  RefreshCw,
  Sun,
  Wind,
  Droplets,
  Battery,
  Activity
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { useRWANFT } from "@/lib/contracts/hooks/useRWANFT"
import { votingPowerCalculator, VotingPowerBreakdown } from "@/lib/voting-power-calculator"
import { badgeSystem } from "@/lib/badge-system"

interface VotingPowerCardProps {
  className?: string
}

const ENERGY_TYPE_ICONS = {
  solar: Sun,
  wind: Wind,
  geothermal: Droplets,
  hydroelectric: Activity,
  battery: Battery
}

const ENERGY_TYPE_COLORS = {
  solar: '#f59e0b',
  wind: '#3b82f6',
  geothermal: '#10b981',
  hydroelectric: '#06b6d4',
  battery: '#8b5cf6'
}

export function VotingPowerCard({ className }: VotingPowerCardProps) {
  const { account } = useWeb3()
  const { nfts, isLoading: nftsLoading } = useRWANFT()
  const [votingPower, setVotingPower] = useState<VotingPowerBreakdown | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [daoPoints, setDaoPoints] = useState(0)
  const [carbonOffset, setCarbonOffset] = useState(0)

  // Load voting power data
  useEffect(() => {
    if (!account) return

    const loadVotingPower = async () => {
      setIsLoading(true)
      try {
        // Demo mode: Use mock data when NFTs are not available
        if (!nfts || nftsLoading) {
          const mockBreakdown: VotingPowerBreakdown = {
            totalPower: 25, // 25 GAIA voting power
            breakdown: [
              {
                nftType: 'solar',
                count: 2,
                power: 10,
                weight: 1.0
              },
              {
                nftType: 'wind',
                count: 1,
                power: 8,
                weight: 1.2
              },
              {
                nftType: 'battery',
                count: 1,
                power: 7,
                weight: 1.1
              }
            ],
            daoPointsBonus: 5,
            carbonOffsetBonus: 3
          }
          
          setVotingPower(mockBreakdown)
          setDaoPoints(150)
          setCarbonOffset(2.4)
          setIsLoading(false)
          return
        }

        // Get DAO points from badge system
        const userDaoPoints = badgeSystem.getDaoPoints(account)
        setDaoPoints(userDaoPoints)

        // TODO: Get carbon offset from carbon tracking system
        // For now, use mock data
        setCarbonOffset(2.4)

        // Calculate voting power breakdown
        const breakdown = await votingPowerCalculator.getVotingPowerBreakdown(
          account,
          nfts,
          userDaoPoints,
          carbonOffset
        )

        setVotingPower(breakdown)
      } catch (error) {
        console.error('Failed to load voting power:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVotingPower()
  }, [account, nfts, nftsLoading])

  // Refresh voting power
  const handleRefresh = () => {
    if (!account || !nfts) return
    // Re-trigger the useEffect
    setVotingPower(null)
  }

  // Prepare chart data
  const chartData = votingPower?.breakdown.map(item => ({
    name: item.nftType.charAt(0).toUpperCase() + item.nftType.slice(1),
    value: item.power,
    count: item.count,
    weight: item.weight,
    color: ENERGY_TYPE_COLORS[item.nftType]
  })) || []

  const barChartData = votingPower?.breakdown.map(item => ({
    type: item.nftType,
    power: item.power,
    count: item.count,
    weight: item.weight
  })) || []

  if (!account) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Voting Power
          </CardTitle>
          <CardDescription>Connect your wallet to view voting power</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Please connect your wallet to view your voting power
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !votingPower) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Voting Power
          </CardTitle>
          <CardDescription>Loading your voting power...</CardDescription>
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
              <Vote className="h-5 w-5" />
              Voting Power
            </CardTitle>
            <CardDescription>
              Based on your NFT holdings and contributions
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Total Voting Power */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {votingPower.totalPower.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Voting Power</div>
            </div>

            {/* Bonuses */}
            {(votingPower.daoPointsBonus > 0 || votingPower.carbonOffsetBonus > 0) && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Bonuses</div>
                {votingPower.daoPointsBonus > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">DAO Points Bonus</span>
                    <span className="text-emerald-600">+{votingPower.daoPointsBonus.toFixed(0)}</span>
                  </div>
                )}
                {votingPower.carbonOffsetBonus > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Carbon Offset Bonus</span>
                    <span className="text-emerald-600">+{votingPower.carbonOffsetBonus.toFixed(0)}</span>
                  </div>
                )}
              </div>
            )}

            {/* NFT Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{nfts?.length || 0}</div>
                <div className="text-xs text-muted-foreground">NFTs Owned</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{daoPoints}</div>
                <div className="text-xs text-muted-foreground">DAO Points</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toFixed(0), 'Voting Power']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toFixed(0), 'Voting Power']} />
                  <Bar dataKey="power" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {/* NFT Breakdown */}
            <div className="space-y-3">
              <div className="text-sm font-medium">NFT Breakdown</div>
              {votingPower.breakdown.map((item) => {
                const Icon = ENERGY_TYPE_ICONS[item.nftType]
                const percentage = (item.power / votingPower.totalPower) * 100

                return (
                  <div key={item.nftType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{item.nftType}</span>
                        <Badge variant="outline">
                          {item.count} NFT{item.count !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="secondary">
                          {item.weight}x weight
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {item.power.toFixed(0)} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>

            {/* Voting Requirements */}
            <div className="space-y-3 pt-4 border-t">
              <div className="text-sm font-medium">Voting Requirements</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Create Proposal</span>
                  <span className={votingPower.totalPower >= 10000 ? 'text-emerald-600' : 'text-red-600'}>
                    {votingPower.totalPower >= 10000 ? '✓' : '✗'} 10,000
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quorum Required</span>
                  <span>20,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Voting Period</span>
                  <span>7 days</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
