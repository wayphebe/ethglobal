import { 
  CarbonOffset, 
  CarbonBadge, 
  BadgeProgress, 
  LeaderboardEntry, 
  CarbonStats,
  EnvironmentalImpact,
  CarbonTrend,
  Period,
  EnergyType
} from './types/carbon'
import { carbonCalculator } from './carbon-calculator'
import { badgeSystem } from './badge-system'
import { IoTDataPoint } from './types/energy'

export class CarbonDataService {
  private static instance: CarbonDataService
  private userData: Map<string, {
    offsets: CarbonOffset[]
    badges: CarbonBadge[]
    daoPoints: number
    stats: CarbonStats
  }> = new Map()

  private constructor() {
    this.loadUserData()
  }

  static getInstance(): CarbonDataService {
    if (!CarbonDataService.instance) {
      CarbonDataService.instance = new CarbonDataService()
    }
    return CarbonDataService.instance
  }

  /**
   * Load user data from storage
   */
  private loadUserData(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('gaia_carbon_data')
      if (stored) {
        this.userData = new Map(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load carbon data:', error)
    }
  }

  /**
   * Save user data to storage
   */
  private saveUserData(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('gaia_carbon_data', JSON.stringify(Array.from(this.userData.entries())))
    } catch (error) {
      console.error('Failed to save carbon data:', error)
    }
  }

  /**
   * Calculate user's carbon offset for a period
   */
  async calculateUserOffset(userId: string, period: Period, energyData: IoTDataPoint[]): Promise<CarbonOffset> {
    let offset: CarbonOffset

    switch (period) {
      case 'daily':
        offset = carbonCalculator.calculateDailyOffset(energyData, userId)
        break
      case 'weekly':
        offset = carbonCalculator.calculateWeeklyOffset(energyData, userId)
        break
      case 'monthly':
        offset = carbonCalculator.calculateMonthlyOffset(energyData, userId)
        break
      case 'yearly':
        offset = carbonCalculator.calculateYearlyOffset(energyData, userId)
        break
      default:
        throw new Error(`Invalid period: ${period}`)
    }

    // Store the offset
    this.storeUserOffset(userId, offset)

    // Check for badge eligibility
    await this.checkAndAwardBadges(userId, offset)

    return offset
  }

  /**
   * Store user offset data
   */
  private storeUserOffset(userId: string, offset: CarbonOffset): void {
    const userData = this.userData.get(userId) || {
      offsets: [],
      badges: [],
      daoPoints: 0,
      stats: {
        totalOffset: 0,
        monthlyOffset: 0,
        yearlyOffset: 0,
        badgesEarned: 0,
        daoPoints: 0,
        efficiency: 0
      }
    }

    // Add or update offset
    const existingIndex = userData.offsets.findIndex(o => 
      o.period === offset.period && 
      Math.abs(o.timestamp.getTime() - offset.timestamp.getTime()) < 24 * 60 * 60 * 1000
    )

    if (existingIndex >= 0) {
      userData.offsets[existingIndex] = offset
    } else {
      userData.offsets.push(offset)
    }

    // Update stats
    this.updateUserStats(userId, userData)

    this.userData.set(userId, userData)
    this.saveUserData()
  }

  /**
   * Update user statistics
   */
  private updateUserStats(userId: string, userData: any): void {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calculate total offset
    const totalOffset = userData.offsets.reduce((sum: number, offset: CarbonOffset) => sum + offset.totalOffset, 0)

    // Calculate monthly offset
    const monthlyOffset = userData.offsets
      .filter((offset: CarbonOffset) => 
        offset.period === 'monthly' && 
        new Date(offset.timestamp).getMonth() === currentMonth &&
        new Date(offset.timestamp).getFullYear() === currentYear
      )
      .reduce((sum: number, offset: CarbonOffset) => sum + offset.totalOffset, 0)

    // Calculate yearly offset
    const yearlyOffset = userData.offsets
      .filter((offset: CarbonOffset) => 
        offset.period === 'yearly' && 
        new Date(offset.timestamp).getFullYear() === currentYear
      )
      .reduce((sum: number, offset: CarbonOffset) => sum + offset.totalOffset, 0)

    // Calculate efficiency
    const recentOffsets = userData.offsets.slice(-30) // Last 30 entries
    const efficiency = recentOffsets.length > 0 
      ? recentOffsets.reduce((sum: number, offset: CarbonOffset) => sum + carbonCalculator.calculateEfficiency(offset), 0) / recentOffsets.length
      : 0

    userData.stats = {
      totalOffset,
      monthlyOffset,
      yearlyOffset,
      badgesEarned: userData.badges.length,
      daoPoints: badgeSystem.getDaoPoints(userId),
      efficiency
    }
  }

  /**
   * Check and award badges
   */
  private async checkAndAwardBadges(userId: string, offset: CarbonOffset): Promise<void> {
    const eligibleBadges = badgeSystem.checkBadgeEligibility(userId, offset)
    
    for (const badge of eligibleBadges) {
      const awarded = badgeSystem.awardBadge(userId, badge.id)
      if (awarded) {
        // Update user data
        const userData = this.userData.get(userId)
        if (userData) {
          userData.badges.push(badge)
          userData.daoPoints = badgeSystem.getDaoPoints(userId)
          this.userData.set(userId, userData)
          this.saveUserData()
        }

        // Show notification (would integrate with notification system)
        console.log(`Badge awarded: ${badge.name}`)
      }
    }
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<CarbonBadge[]> {
    return badgeSystem.getUserBadges(userId)
  }

  /**
   * Check badge eligibility
   */
  async checkBadgeEligibility(userId: string, offset: CarbonOffset): Promise<CarbonBadge[]> {
    return badgeSystem.checkBadgeEligibility(userId, offset)
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const awarded = badgeSystem.awardBadge(userId, badgeId)
    if (awarded) {
      // Update user data
      const userData = this.userData.get(userId)
      if (userData) {
        const badge = badgeSystem.getBadge(badgeId)
        if (badge) {
          userData.badges.push(badge)
          userData.daoPoints = badgeSystem.getDaoPoints(userId)
          this.userData.set(userId, userData)
          this.saveUserData()
        }
      }
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(period: Period): Promise<LeaderboardEntry[]> {
    const entries: LeaderboardEntry[] = []

    for (const [userId, userData] of this.userData.entries()) {
      const periodOffset = userData.offsets
        .filter(offset => offset.period === period)
        .reduce((sum, offset) => sum + offset.totalOffset, 0)

      if (periodOffset > 0) {
        entries.push({
          rank: 0, // Will be set after sorting
          userId,
          username: `User ${userId.slice(0, 6)}`, // Mock username
          totalOffset: periodOffset,
          badges: userData.badges.length,
          daoPoints: userData.daoPoints,
          avatar: undefined
        })
      }
    }

    // Sort by total offset and assign ranks
    entries.sort((a, b) => b.totalOffset - a.totalOffset)
    entries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return entries.slice(0, 50) // Top 50
  }

  /**
   * Get user's DAO points
   */
  async getDaoPoints(userId: string): Promise<number> {
    return badgeSystem.getDaoPoints(userId)
  }

  /**
   * Get user's carbon statistics
   */
  async getCarbonStats(userId: string): Promise<CarbonStats> {
    const userData = this.userData.get(userId)
    if (!userData) {
      return {
        totalOffset: 0,
        monthlyOffset: 0,
        yearlyOffset: 0,
        badgesEarned: 0,
        daoPoints: 0,
        efficiency: 0
      }
    }

    return userData.stats
  }

  /**
   * Get badge progress for user
   */
  async getBadgeProgress(userId: string, offset: CarbonOffset): Promise<BadgeProgress[]> {
    return badgeSystem.getBadgeProgress(userId, offset)
  }

  /**
   * Get carbon trend data
   */
  async getCarbonTrend(userId: string, period: Period, energyData: IoTDataPoint[]): Promise<CarbonTrend> {
    const trend = carbonCalculator.calculateTrend(energyData, period, userId)
    
    return {
      period,
      data: trend
    }
  }

  /**
   * Get environmental impact
   */
  async getEnvironmentalImpact(userId: string): Promise<EnvironmentalImpact> {
    const userData = this.userData.get(userId)
    const totalOffset = userData?.stats.totalOffset || 0
    
    return carbonCalculator.calculateEnvironmentalImpact(totalOffset)
  }

  /**
   * Get user's recent offsets
   */
  async getRecentOffsets(userId: string, limit: number = 10): Promise<CarbonOffset[]> {
    const userData = this.userData.get(userId)
    if (!userData) return []

    return userData.offsets
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Get offset by energy type breakdown
   */
  async getOffsetBreakdown(userId: string, period: Period): Promise<Record<EnergyType, number>> {
    const userData = this.userData.get(userId)
    if (!userData) return {} as Record<EnergyType, number>

    const periodOffsets = userData.offsets.filter(offset => offset.period === period)
    const breakdown: Record<EnergyType, number> = {} as Record<EnergyType, number>

    periodOffsets.forEach(offset => {
      Object.entries(offset.breakdown).forEach(([type, data]) => {
        const energyType = type as EnergyType
        breakdown[energyType] = (breakdown[energyType] || 0) + data.offset
      })
    })

    return breakdown
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<{
    offsets: CarbonOffset[]
    badges: CarbonBadge[]
    stats: CarbonStats
    exportDate: Date
  }> {
    const userData = this.userData.get(userId)
    if (!userData) {
      throw new Error('User data not found')
    }

    return {
      offsets: userData.offsets,
      badges: userData.badges,
      stats: userData.stats,
      exportDate: new Date()
    }
  }

  /**
   * Reset user data (for testing)
   */
  async resetUserData(userId: string): Promise<void> {
    this.userData.delete(userId)
    badgeSystem.resetUserData(userId)
    this.saveUserData()
  }
}

// Export singleton instance
export const carbonDataService = CarbonDataService.getInstance()
