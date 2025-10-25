"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Award, 
  Trophy, 
  Star, 
  Crown, 
  RefreshCw,
  Share2,
  Download,
  Filter,
  Search
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { carbonDataService } from "@/lib/carbon-data-service"
import { CarbonBadge, BadgeRarity, BadgeProgress } from "@/lib/types/carbon"

interface BadgeCollectionProps {
  className?: string
}

const RARITY_ICONS = {
  common: Award,
  rare: Star,
  epic: Trophy,
  legendary: Crown
}

const RARITY_COLORS = {
  common: 'text-gray-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-yellow-600'
}

const RARITY_BG_COLORS = {
  common: 'bg-gray-100 dark:bg-gray-800',
  rare: 'bg-blue-100 dark:bg-blue-900',
  epic: 'bg-purple-100 dark:bg-purple-900',
  legendary: 'bg-yellow-100 dark:bg-yellow-900'
}

export function BadgeCollection({ className }: BadgeCollectionProps) {
  const { account } = useWeb3()
  const [badges, setBadges] = useState<CarbonBadge[]>([])
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all')
  const [selectedBadge, setSelectedBadge] = useState<CarbonBadge | null>(null)
  const [stats, setStats] = useState({
    totalBadges: 0,
    badgesByRarity: {} as Record<BadgeRarity, number>,
    totalDaoPoints: 0
  })

  // Load badge data
  useEffect(() => {
    if (!account) return

    const loadBadgeData = async () => {
      setIsLoading(true)
      try {
        // Get user badges
        const userBadges = await carbonDataService.getUserBadges(account)
        setBadges(userBadges)

        // Get badge progress for locked badges
        // For demo purposes, we'll create mock progress data
        const mockProgress: BadgeProgress[] = [
          {
            badgeId: 'monthly-5',
            current: 3.2,
            threshold: 5,
            percentage: 64,
            timeToUnlock: '2 days'
          },
          {
            badgeId: 'yearly-100',
            current: 45,
            threshold: 100,
            percentage: 45,
            timeToUnlock: '3 months'
          }
        ]
        setBadgeProgress(mockProgress)

        // Calculate stats
        const badgesByRarity: Record<BadgeRarity, number> = {
          common: 0,
          rare: 0,
          epic: 0,
          legendary: 0
        }

        userBadges.forEach(badge => {
          badgesByRarity[badge.rarity]++
        })

        const totalDaoPoints = userBadges.reduce((sum, badge) => sum + badge.daoPoints, 0)

        setStats({
          totalBadges: userBadges.length,
          badgesByRarity,
          totalDaoPoints
        })

      } catch (error) {
        console.error('Failed to load badge data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBadgeData()
  }, [account])

  // Filter badges by rarity
  const filteredBadges = badges.filter(badge => 
    selectedRarity === 'all' || badge.rarity === selectedRarity
  )

  // Get all available badges (earned + locked)
  const allBadges = [...badges, ...badgeProgress.map(p => ({
    id: p.badgeId,
    name: `Badge ${p.badgeId}`,
    description: `Progress: ${p.current.toFixed(1)}/${p.threshold} tons`,
    threshold: p.threshold,
    rarity: 'common' as BadgeRarity,
    icon: '🏆',
    daoPoints: 0,
    category: 'monthly' as const,
    progress: p.percentage,
    timeToUnlock: p.timeToUnlock
  }))]

  // Share badge collection
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My GaiaGrid Badge Collection',
          text: `I've earned ${stats.totalBadges} badges and ${stats.totalDaoPoints} DAO points!`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `Check out my GaiaGrid badge collection! I've earned ${stats.totalBadges} badges and ${stats.totalDaoPoints} DAO points!`
      )
    }
  }

  // Export badge data
  const handleExport = async () => {
    try {
      const data = await carbonDataService.exportUserData(account!)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gaia-badges-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (!account) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badge Collection
          </CardTitle>
          <CardDescription>Connect your wallet to view your badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Please connect your wallet to view your badge collection
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badge Collection
          </CardTitle>
          <CardDescription>Loading your badges...</CardDescription>
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
              <Award className="h-5 w-5" />
              Badge Collection
            </CardTitle>
            <CardDescription>
              {stats.totalBadges} badges earned • {stats.totalDaoPoints} DAO points
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" onClick={() => setSelectedRarity('all')}>
              All ({stats.totalBadges})
            </TabsTrigger>
            <TabsTrigger value="common" onClick={() => setSelectedRarity('common')}>
              Common ({stats.badgesByRarity.common})
            </TabsTrigger>
            <TabsTrigger value="rare" onClick={() => setSelectedRarity('rare')}>
              Rare ({stats.badgesByRarity.rare})
            </TabsTrigger>
            <TabsTrigger value="epic" onClick={() => setSelectedRarity('epic')}>
              Epic ({stats.badgesByRarity.epic})
            </TabsTrigger>
            <TabsTrigger value="legendary" onClick={() => setSelectedRarity('legendary')}>
              Legendary ({stats.badgesByRarity.legendary})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedRarity} className="mt-6">
            {filteredBadges.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start earning badges by contributing to carbon offset!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBadges.map((badge) => {
                  const RarityIcon = RARITY_ICONS[badge.rarity]
                  const isLocked = 'progress' in badge

                  return (
                    <Dialog key={badge.id}>
                      <DialogTrigger asChild>
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isLocked ? 'opacity-60' : ''
                          }`}
                          onClick={() => setSelectedBadge(badge)}
                        >
                          <CardContent className="p-4">
                            <div className="text-center space-y-2">
                              <div className={`text-4xl ${isLocked ? 'grayscale' : ''}`}>
                                {badge.icon}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm line-clamp-2">
                                  {badge.name}
                                </h4>
                                <div className="flex items-center justify-center gap-1">
                                  <RarityIcon className={`h-3 w-3 ${RARITY_COLORS[badge.rarity]}`} />
                                  <span className={`text-xs capitalize ${RARITY_COLORS[badge.rarity]}`}>
                                    {badge.rarity}
                                  </span>
                                </div>
                                {isLocked && 'progress' in badge && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                      {badge.progress}% complete
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                      <div 
                                        className="bg-emerald-600 h-1 rounded-full transition-all"
                                        style={{ width: `${badge.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                {!isLocked && badge.daoPoints > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{badge.daoPoints} points
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{badge.icon}</span>
                            {badge.name}
                          </DialogTitle>
                          <DialogDescription>
                            {badge.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Rarity</span>
                            <div className="flex items-center gap-1">
                              <RarityIcon className={`h-4 w-4 ${RARITY_COLORS[badge.rarity]}`} />
                              <span className={`capitalize font-medium ${RARITY_COLORS[badge.rarity]}`}>
                                {badge.rarity}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Threshold</span>
                            <span className="font-medium">{badge.threshold} tons CO₂</span>
                          </div>

                          {badge.daoPoints > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">DAO Points</span>
                              <Badge variant="outline">+{badge.daoPoints}</Badge>
                            </div>
                          )}

                          {isLocked && 'progress' in badge && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {badge.progress}% complete
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-emerald-600 h-2 rounded-full transition-all"
                                  style={{ width: `${badge.progress}%` }}
                                />
                              </div>
                              {badge.timeToUnlock && (
                                <p className="text-xs text-muted-foreground text-center">
                                  Unlock in {badge.timeToUnlock}
                                </p>
                              )}
                            </div>
                          )}

                          {!isLocked && badge.unlockedAt && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Earned</span>
                              <span className="text-sm">
                                {new Date(badge.unlockedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
