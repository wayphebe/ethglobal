"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Zap, TrendingUp, TrendingDown, Sun, Wind, Droplets, Leaf, Wallet } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
                  <p className="text-sm text-muted-foreground">Total Consumption</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">342.8 kWh</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingDown className="h-4 w-4" />
                    <span>12% vs last month</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Energy Generated</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">458.2 kWh</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>18% vs last month</span>
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
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">0.84 ETH</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>24% vs last month</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                  <Wallet className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Carbon Offset</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">2.4 tons</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>32% vs last month</span>
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
                <div className="space-y-4">
                  {myAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          {asset.type === "Solar" && <Sun className="h-6 w-6 text-yellow-600" />}
                          {asset.type === "Wind" && <Wind className="h-6 w-6 text-blue-600" />}
                          {asset.type === "Geothermal" && <Droplets className="h-6 w-6 text-orange-600" />}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {asset.id} • {asset.capacity}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Utilization</div>
                          <div className="mt-1 flex items-center gap-2">
                            <Progress value={asset.utilization} className="w-24" />
                            <span className="text-sm font-medium">{asset.utilization}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Earnings</div>
                          <div className="font-semibold text-emerald-600">{asset.earnings}</div>
                        </div>
                        <Badge variant={asset.status === "Active" ? "default" : "secondary"}>{asset.status}</Badge>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                    {recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.type}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.node}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={tx.amount.startsWith("+") ? "text-emerald-600" : "text-muted-foreground"}>
                            {tx.amount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                    <p className="text-2xl font-bold text-foreground">245 kWh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">53%</p>
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
                    <p className="text-2xl font-bold text-foreground">142 kWh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">31%</p>
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
                    <p className="text-2xl font-bold text-foreground">71 kWh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">16%</p>
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
