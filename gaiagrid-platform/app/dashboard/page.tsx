"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Zap, TrendingUp, TrendingDown, Sun, Wind, Droplets, Leaf, Wallet, Loader2 } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useWeb3 } from "@/lib/web3-context"
import { useGAIAToken } from "@/lib/contracts/hooks/useGAIAToken"
import { useRWANFT } from "@/lib/contracts/hooks/useRWANFT"
import { useNodeManager } from "@/lib/contracts/hooks/useNodeManager"
import { useEnergyTrading } from "@/lib/contracts/hooks/useEnergyTrading"
import { TransactionManager, TransactionType } from "@/lib/contracts/transactions"

// Mock data for energy consumption
const energyData = [
  { time: "00:00", consumption: 2.4, generation: 0 },
  { time: "03:00", consumption: 1.8, generation: 0 },
  { time: "06:00", consumption: 3.2, generation: 1.5 },
  { time: "09:00", consumption: 5.6, generation: 8.2 },
  { time: "12:00", consumption: 6.8, generation: 12.4 },
  { time: "15:00", consumption: 5.2, generation: 10.8 },
  { time: "18:00", consumption: 7.4, generation: 4.2 },
  { time: "21:00", consumption: 4.8, generation: 0 },
]

const weeklyData = [
  { day: "Mon", energy: 45.2 },
  { day: "Tue", energy: 52.8 },
  { day: "Wed", energy: 48.6 },
  { day: "Thu", energy: 61.4 },
  { day: "Fri", energy: 55.2 },
  { day: "Sat", energy: 38.4 },
  { day: "Sun", energy: 42.8 },
]

const myAssets = [
  {
    id: "NFT-001",
    name: "Bali Solar Panel Array",
    type: "Solar",
    capacity: "25 kW",
    status: "Active",
    earnings: "0.24 ETH",
    utilization: 87,
  },
  {
    id: "NFT-002",
    name: "Iceland Geothermal Unit",
    type: "Geothermal",
    capacity: "50 kW",
    status: "Active",
    earnings: "0.48 ETH",
    utilization: 95,
  },
  {
    id: "NFT-003",
    name: "Portugal Wind Turbine",
    type: "Wind",
    capacity: "40 kW",
    status: "Maintenance",
    earnings: "0.12 ETH",
    utilization: 45,
  },
]

const recentTransactions = [
  {
    id: 1,
    type: "Energy Purchase",
    amount: "-0.05 ETH",
    node: "Bali Solar Hub",
    date: "2025-01-23",
    status: "Completed",
  },
  {
    id: 2,
    type: "Asset Earnings",
    amount: "+0.24 ETH",
    node: "Bali Solar Panel Array",
    date: "2025-01-22",
    status: "Completed",
  },
  {
    id: 3,
    type: "Token Reward",
    amount: "+150 GAIA",
    node: "Governance Participation",
    date: "2025-01-21",
    status: "Completed",
  },
  {
    id: 4,
    type: "Energy Purchase",
    amount: "-0.08 ETH",
    node: "Costa Rica Eco Lodge",
    date: "2025-01-20",
    status: "Completed",
  },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")
  const [transactionManager, setTransactionManager] = useState<TransactionManager | null>(null)
  
  // Web3 context
  const { account, chainId, isSupportedNetwork, balances } = useWeb3()
  
  // Initialize transaction manager
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setTransactionManager(new TransactionManager(provider))
    }
  }, [])
  
  // Contract hooks
  const { 
    balance: gaiaBalance, 
    tokenInfo: gaiaTokenInfo, 
    isLoading: gaiaLoading 
  } = useGAIAToken()
  
  const { 
    userAssets, 
    stats: nftStats, 
    isLoading: nftLoading,
    formatAssetType,
    formatCapacity,
    formatValue,
    EnergyAssetType
  } = useRWANFT()
  
  const { 
    userNodes, 
    stats: nodeStats, 
    isLoading: nodeLoading 
  } = useNodeManager()
  
  const { 
    userTransactions, 
    stats: tradingStats, 
    isLoading: tradingLoading 
  } = useEnergyTrading()
  
  // Calculate totals from real data
  const totalEarnings = userAssets.reduce((sum, asset) => {
    return sum + parseFloat(asset.currentValue || '0')
  }, 0)
  
  const totalCapacity = userAssets.reduce((sum, asset) => {
    return sum + parseFloat(asset.capacity || '0')
  }, 0)
  
  const totalEnergyTraded = tradingStats?.totalEnergyTraded ? 
    parseFloat(tradingStats.totalEnergyTraded) / 1e18 : 0 // Convert from wei to kWh
  
  const totalVolume = tradingStats?.totalVolume ? 
    parseFloat(tradingStats.totalVolume) / 1e18 : 0 // Convert from wei to ETH
  
  // Get primary balance (ETH)
  const primaryBalance = balances.find(b => b.symbol === 'ETH') || balances[0]
  const ethBalance = primaryBalance ? parseFloat(primaryBalance.balanceFormatted) : 0
  
  // Mock data for charts (in real implementation, this would come from IoT data)
  const energyData = [
    { time: "00:00", consumption: 2.4, generation: 0 },
    { time: "03:00", consumption: 1.8, generation: 0 },
    { time: "06:00", consumption: 3.2, generation: 1.5 },
    { time: "09:00", consumption: 5.6, generation: 8.2 },
    { time: "12:00", consumption: 6.8, generation: 12.4 },
    { time: "15:00", consumption: 5.2, generation: 10.8 },
    { time: "18:00", consumption: 7.4, generation: 4.2 },
    { time: "21:00", consumption: 4.8, generation: 0 },
  ]
  
  const weeklyData = [
    { day: "Mon", energy: 45.2 },
    { day: "Tue", energy: 52.8 },
    { day: "Wed", energy: 48.6 },
    { day: "Thu", energy: 61.4 },
    { day: "Fri", energy: 55.2 },
    { day: "Sat", energy: 38.4 },
    { day: "Sun", energy: 42.8 },
  ]
  
  // Show connection prompt if not connected
  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your energy dashboard and manage your assets.
            </p>
            <Button className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Show unsupported network warning
  if (!isSupportedNetwork) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Unsupported Network</h2>
            <p className="text-muted-foreground mb-6">
              Please switch to a supported network to use GaiaGrid.
            </p>
            <Button className="w-full">
              Switch Network
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Energy Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Monitor your energy consumption, assets, and earnings in real-time
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ETH Balance</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {gaiaLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      `${ethBalance.toFixed(4)} ETH`
                    )}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Wallet Balance</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">GAIA Tokens</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {gaiaLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      `${gaiaBalance?.balanceFormatted || '0.00'} GAIA`
                    )}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Governance Tokens</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                  <Zap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Energy Assets</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {nftLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      `${userAssets.length} NFTs`
                    )}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                    <span>{formatCapacity(totalCapacity.toString())} total capacity</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Sun className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {nftLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      `${formatValue(totalEarnings.toString())} ETH`
                    )}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                    <span>Asset Portfolio Value</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Energy Flow (24h)</CardTitle>
              <CardDescription>Real-time consumption vs generation</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  consumption: {
                    label: "Consumption",
                    color: "hsl(var(--chart-1))",
                  },
                  generation: {
                    label: "Generation",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="consumption"
                      stroke="var(--color-consumption)"
                      strokeWidth={2}
                      name="Consumption (kW)"
                    />
                    <Line
                      type="monotone"
                      dataKey="generation"
                      stroke="var(--color-generation)"
                      strokeWidth={2}
                      name="Generation (kW)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Usage</CardTitle>
              <CardDescription>Total energy consumption by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  energy: {
                    label: "Energy",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="energy" fill="var(--color-energy)" name="Energy (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Assets and Transactions */}
        <Tabs defaultValue="assets" className="w-full">
          <TabsList>
            <TabsTrigger value="assets">My Energy Assets</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Asset NFTs</CardTitle>
                <CardDescription>Your tokenized renewable energy infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                {nftLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading assets...</span>
                  </div>
                ) : userAssets.length === 0 ? (
                  <div className="text-center py-8">
                    <Sun className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Energy Assets</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any energy asset NFTs yet. Start by minting your first asset!
                    </p>
                    <Button>Mint Energy Asset</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAssets.map((asset) => (
                      <div
                        key={asset.tokenId}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            {asset.assetType === EnergyAssetType.SOLAR_PANEL && <Sun className="h-6 w-6 text-yellow-600" />}
                            {asset.assetType === EnergyAssetType.WIND_TURBINE && <Wind className="h-6 w-6 text-blue-600" />}
                            {asset.assetType === EnergyAssetType.GEOTHERMAL && <Droplets className="h-6 w-6 text-orange-600" />}
                            {asset.assetType === EnergyAssetType.BATTERY_STORAGE && <Zap className="h-6 w-6 text-purple-600" />}
                            {asset.assetType === EnergyAssetType.HYDROELECTRIC && <Droplets className="h-6 w-6 text-cyan-600" />}
                            {asset.assetType === EnergyAssetType.HYBRID_SYSTEM && <Zap className="h-6 w-6 text-green-600" />}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">
                              #{asset.tokenId} • {formatAssetType(asset.assetType)} • {formatCapacity(asset.capacity)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {asset.location} • {asset.efficiency}% efficiency
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Value</div>
                            <div className="font-semibold text-emerald-600">
                              {formatValue(asset.currentValue)} ETH
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Efficiency</div>
                            <div className="mt-1 flex items-center gap-2">
                              <Progress value={asset.efficiency} className="w-24" />
                              <span className="text-sm font-medium">{asset.efficiency}%</span>
                            </div>
                          </div>
                          <Badge variant={asset.verificationStatus === 1 ? "default" : "secondary"}>
                            {asset.verificationStatus === 1 ? "Verified" : "Pending"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent energy and token transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {tradingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading transactions...</span>
                  </div>
                ) : userTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't made any energy transactions yet. Start trading energy!
                    </p>
                    <Button>Start Trading</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Node/Source</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">Energy Purchase</TableCell>
                          <TableCell className="text-muted-foreground">
                            {tx.nodeAddress ? `${tx.nodeAddress.slice(0, 6)}...${tx.nodeAddress.slice(-4)}` : 'Unknown'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(tx.createdAt * 1000).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={tx.isCompleted ? "default" : "secondary"}>
                              {tx.isCompleted ? "Completed" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-muted-foreground">
                              -{formatValue(tx.totalPrice)} ETH
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Energy Sources Breakdown */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                    <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solar Energy</p>
                    <p className="text-2xl font-bold text-foreground">
                      {userAssets
                        .filter(asset => asset.assetType === EnergyAssetType.SOLAR_PANEL)
                        .reduce((sum, asset) => sum + parseFloat(asset.capacity), 0)
                        .toFixed(0)} W
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">
                    {totalCapacity > 0 ? 
                      Math.round((userAssets
                        .filter(asset => asset.assetType === EnergyAssetType.SOLAR_PANEL)
                        .reduce((sum, asset) => sum + parseFloat(asset.capacity), 0) / totalCapacity) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">of total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wind Energy</p>
                    <p className="text-2xl font-bold text-foreground">
                      {userAssets
                        .filter(asset => asset.assetType === EnergyAssetType.WIND_TURBINE)
                        .reduce((sum, asset) => sum + parseFloat(asset.capacity), 0)
                        .toFixed(0)} W
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">
                    {totalCapacity > 0 ? 
                      Math.round((userAssets
                        .filter(asset => asset.assetType === EnergyAssetType.WIND_TURBINE)
                        .reduce((sum, asset) => sum + parseFloat(asset.capacity), 0) / totalCapacity) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">of total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                    <Droplets className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Geothermal</p>
                    <p className="text-2xl font-bold text-foreground">
                      {userAssets
                        .filter(asset => asset.assetType === EnergyAssetType.GEOTHERMAL)
                        .reduce((sum, asset) => sum + parseFloat(asset.capacity), 0)
                        .toFixed(0)} W
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">
                    {totalCapacity > 0 ? 
                      Math.round((userAssets
                        .filter(asset => asset.assetType === EnergyAssetType.GEOTHERMAL)
                        .reduce((sum, asset) => sum + parseFloat(asset.capacity), 0) / totalCapacity) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">of total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
