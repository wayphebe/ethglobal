"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, 
  Medal, 
  Award, 
  RefreshCw,
  Crown,
  Star,
  TrendingUp,
  Users
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { carbonDataService } from "@/lib/carbon-data-service"
import { LeaderboardEntry, Period } from "@/lib/types/carbon"

interface CarbonLeaderboardProps {
  className?: string
}

const RANK_ICONS = {
  1: Crown,
  2: Trophy,
  3: Medal
}

const RANK_COLORS = {
  1: 'text-yellow-600',
  2: 'text-gray-600',
  3: 'text-orange-600'
}

const RANK_BG_COLORS = {
  1: 'bg-yellow-100 dark:bg-yellow-900',
  2: 'bg-gray-100 dark:bg-gray-800',
  3: 'bg-orange-100 dark:bg-orange-900'
}

export function CarbonLeaderboard({ className }: CarbonLeaderboardProps) {
  const { account } = useWeb3()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly')
  const [userRank, setUserRank] = useState<number | null>(null)

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true)
      try {
        const data = await carbonDataService.getLeaderboard(selectedPeriod)
        setLeaderboard(data)

        // Find user's rank
        if (account) {
          const userEntry = data.find(entry => entry.userId === account)
          setUserRank(userEntry?.rank || null)
        }

      } catch (error) {
        console.error('Failed to load leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaderboard()
  }, [selectedPeriod, account])

  // Refresh data
  const handleRefresh = () => {
    setLeaderboard([])
  }

  // Get rank icon
  const getRankIcon = (rank: number) => {
    const Icon = RANK_ICONS[rank as keyof typeof RANK_ICONS]
    return Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm font-bold">#{rank}</span>
  }

  // Get rank styling
  const getRankStyling = (rank: number) => {
    const isTopThree = rank <= 3
    return {
      icon: isTopThree ? RANK_COLORS[rank as keyof typeof RANK_COLORS] : 'text-muted-foreground',
      bg: isTopThree ? RANK_BG_COLORS[rank as keyof typeof RANK_BG_COLORS] : 'bg-muted',
      text: isTopThree ? 'font-bold' : 'font-medium'
    }
  }

  // Format number with appropriate suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(1)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <CardDescription>Loading leaderboard...</CardDescription>
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
              <Trophy className="h-5 w-5" />
              Carbon Leaderboard
            </CardTitle>
            <CardDescription>
              Top contributors to carbon offset
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
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as Period)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="mt-6 space-y-4">
            {/* User's Rank */}
            {userRank && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Your Rank</span>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    #{userRank}
                  </Badge>
                </div>
              </div>
            )}

            {/* Top 3 Podium */}
            {leaderboard.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[2, 1, 3].map((rank) => {
                  const entry = leaderboard.find(e => e.rank === rank)
                  if (!entry) return null

                  const styling = getRankStyling(rank)
                  const isCurrentUser = entry.userId === account

                  return (
                    <div 
                      key={rank}
                      className={`text-center p-4 rounded-lg border-2 ${
                        isCurrentUser ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : styling.bg
                      }`}
                    >
                      <div className={`text-2xl mb-2 ${styling.icon}`}>
                        {getRankIcon(rank)}
                      </div>
                      <Avatar className="h-12 w-12 mx-auto mb-2">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>
                          {entry.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className={`text-sm ${styling.text} ${isCurrentUser ? 'text-emerald-700' : ''}`}>
                          {entry.username}
                          {isCurrentUser && ' (You)'}
                        </div>
                        <div className="text-lg font-bold text-emerald-600">
                          {formatNumber(entry.totalOffset)} tons
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Award className="h-3 w-3" />
                          {entry.badges} badges
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4" />
                <span className="font-medium">Full Rankings</span>
                <Badge variant="outline">{leaderboard.length} participants</Badge>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data available for this period</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const styling = getRankStyling(entry.rank)
                    const isCurrentUser = entry.userId === account

                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                          isCurrentUser 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${styling.bg}`}>
                          <span className={`text-sm ${styling.icon}`}>
                            {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                          </span>
                        </div>

                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback className="text-xs">
                            {entry.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${isCurrentUser ? 'font-semibold text-emerald-700' : styling.text}`}>
                            {entry.username}
                            {isCurrentUser && ' (You)'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Award className="h-3 w-3" />
                            {entry.badges} badges
                            <span>•</span>
                            <span>{entry.daoPoints} DAO points</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-emerald-600">
                            {formatNumber(entry.totalOffset)} tons
                          </div>
                          <div className="text-xs text-muted-foreground">
                            CO₂ offset
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Statistics */}
            {leaderboard.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium text-sm">Period Statistics</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Participants:</span>
                    <span className="ml-2 font-medium">{leaderboard.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Offset:</span>
                    <span className="ml-2 font-medium">
                      {formatNumber(leaderboard.reduce((sum, entry) => sum + entry.totalOffset, 0))} tons
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average per User:</span>
                    <span className="ml-2 font-medium">
                      {formatNumber(leaderboard.reduce((sum, entry) => sum + entry.totalOffset, 0) / leaderboard.length)} tons
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Badges:</span>
                    <span className="ml-2 font-medium">
                      {leaderboard.reduce((sum, entry) => sum + entry.badges, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
