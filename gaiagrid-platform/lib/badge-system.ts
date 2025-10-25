import { 
  CarbonBadge, 
  BadgeProgress, 
  BADGE_DEFINITIONS, 
  BadgeRarity,
  Period 
} from './types/carbon'
import { CarbonOffset } from './types/carbon'

export class BadgeSystem {
  private badges: Map<string, CarbonBadge> = new Map()
  private userBadges: Map<string, Set<string>> = new Map() // userId -> Set of badgeIds
  private userDaoPoints: Map<string, number> = new Map() // userId -> DAO points

  constructor() {
    this.initializeBadges()
    this.loadUserData()
  }

  /**
   * Initialize badge definitions
   */
  private initializeBadges(): void {
    BADGE_DEFINITIONS.forEach(badge => {
      this.badges.set(badge.id, { ...badge })
    })
  }

  /**
   * Load user data from storage
   */
  private loadUserData(): void {
    if (typeof window === 'undefined') return

    try {
      const storedUserBadges = localStorage.getItem('gaia_user_badges')
      const storedDaoPoints = localStorage.getItem('gaia_dao_points')

      if (storedUserBadges) {
        this.userBadges = new Map(JSON.parse(storedUserBadges))
      }

      if (storedDaoPoints) {
        this.userDaoPoints = new Map(JSON.parse(storedDaoPoints))
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  /**
   * Save user data to storage
   */
  private saveUserData(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('gaia_user_badges', JSON.stringify(Array.from(this.userBadges.entries())))
      localStorage.setItem('gaia_dao_points', JSON.stringify(Array.from(this.userDaoPoints.entries())))
    } catch (error) {
      console.error('Failed to save user data:', error)
    }
  }

  /**
   * Check badge eligibility based on carbon offset
   */
  checkBadgeEligibility(userId: string, carbonOffset: CarbonOffset): CarbonBadge[] {
    const eligibleBadges: CarbonBadge[] = []
    const userBadgeIds = this.userBadges.get(userId) || new Set()

    this.badges.forEach(badge => {
      // Skip if user already has this badge
      if (userBadgeIds.has(badge.id)) return

      // Check if user meets the threshold
      if (this.meetsBadgeThreshold(badge, carbonOffset)) {
        eligibleBadges.push(badge)
      }
    })

    return eligibleBadges
  }

  /**
   * Check if user meets badge threshold
   */
  private meetsBadgeThreshold(badge: CarbonBadge, carbonOffset: CarbonOffset): boolean {
    switch (badge.category) {
      case 'monthly':
        return carbonOffset.period === 'monthly' && carbonOffset.totalOffset >= badge.threshold
      case 'yearly':
        return carbonOffset.period === 'yearly' && carbonOffset.totalOffset >= badge.threshold
      case 'milestone':
        // For milestone badges, we need cumulative offset
        return this.getCumulativeOffset(carbonOffset.userId) >= badge.threshold
      case 'special':
        // Special badges have different criteria
        return this.checkSpecialBadgeCriteria(badge, carbonOffset)
      default:
        return false
    }
  }

  /**
   * Check special badge criteria
   */
  private checkSpecialBadgeCriteria(badge: CarbonBadge, carbonOffset: CarbonOffset): boolean {
    switch (badge.id) {
      case 'governance-participant':
        // This would need to be checked against governance participation
        return false // Placeholder
      case 'proposal-creator':
        // This would need to be checked against proposal creation
        return false // Placeholder
      case 'community-builder':
        // This would need to be checked against daily activity
        return false // Placeholder
      default:
        return false
    }
  }

  /**
   * Award badge to user
   */
  awardBadge(userId: string, badgeId: string): boolean {
    const badge = this.badges.get(badgeId)
    if (!badge) return false

    const userBadgeIds = this.userBadges.get(userId) || new Set()
    if (userBadgeIds.has(badgeId)) return false // Already has badge

    // Award the badge
    userBadgeIds.add(badgeId)
    this.userBadges.set(userId, userBadgeIds)

    // Add DAO points
    const currentPoints = this.userDaoPoints.get(userId) || 0
    this.userDaoPoints.set(userId, currentPoints + badge.daoPoints)

    // Update badge with unlock date
    const updatedBadge = { ...badge, unlockedAt: new Date() }
    this.badges.set(badgeId, updatedBadge)

    this.saveUserData()
    return true
  }

  /**
   * Get user's badges
   */
  getUserBadges(userId: string): CarbonBadge[] {
    const userBadgeIds = this.userBadges.get(userId) || new Set()
    const userBadges: CarbonBadge[] = []

    userBadgeIds.forEach(badgeId => {
      const badge = this.badges.get(badgeId)
      if (badge) {
        userBadges.push(badge)
      }
    })

    return userBadges.sort((a, b) => (b.daoPoints || 0) - (a.daoPoints || 0))
  }

  /**
   * Get user's DAO points
   */
  getDaoPoints(userId: string): number {
    return this.userDaoPoints.get(userId) || 0
  }

  /**
   * Add DAO points to user
   */
  addDaoPoints(userId: string, points: number): void {
    const currentPoints = this.userDaoPoints.get(userId) || 0
    this.userDaoPoints.set(userId, currentPoints + points)
    this.saveUserData()
  }

  /**
   * Get badge progress for locked badges
   */
  getBadgeProgress(userId: string, carbonOffset: CarbonOffset): BadgeProgress[] {
    const userBadgeIds = this.userBadges.get(userId) || new Set()
    const progress: BadgeProgress[] = []

    this.badges.forEach(badge => {
      if (userBadgeIds.has(badge.id)) return // Skip unlocked badges

      let current = 0
      let threshold = badge.threshold

      switch (badge.category) {
        case 'monthly':
          if (carbonOffset.period === 'monthly') {
            current = carbonOffset.totalOffset
          }
          break
        case 'yearly':
          if (carbonOffset.period === 'yearly') {
            current = carbonOffset.totalOffset
          }
          break
        case 'milestone':
          current = this.getCumulativeOffset(userId)
          break
        default:
          return
      }

      const percentage = Math.min((current / threshold) * 100, 100)
      const timeToUnlock = this.calculateTimeToUnlock(badge, current, threshold)

      progress.push({
        badgeId: badge.id,
        current,
        threshold,
        percentage,
        timeToUnlock
      })
    })

    return progress.sort((a, b) => b.percentage - a.percentage)
  }

  /**
   * Get cumulative carbon offset for user
   */
  private getCumulativeOffset(userId: string): number {
    // This would need to be calculated from historical data
    // For now, return 0 as placeholder
    return 0
  }

  /**
   * Calculate time to unlock badge
   */
  private calculateTimeToUnlock(badge: CarbonBadge, current: number, threshold: number): string | undefined {
    if (current >= threshold) return undefined

    const remaining = threshold - current
    const dailyAverage = this.getDailyAverageOffset(badge.userId || '')
    
    if (dailyAverage <= 0) return undefined

    const daysToUnlock = Math.ceil(remaining / dailyAverage)
    
    if (daysToUnlock <= 1) return 'Today'
    if (daysToUnlock <= 7) return `${daysToUnlock} days`
    if (daysToUnlock <= 30) return `${Math.ceil(daysToUnlock / 7)} weeks`
    return `${Math.ceil(daysToUnlock / 30)} months`
  }

  /**
   * Get daily average offset for user
   */
  private getDailyAverageOffset(userId: string): number {
    // This would need to be calculated from historical data
    // For now, return a placeholder value
    return 0.1
  }

  /**
   * Get badges by rarity
   */
  getBadgesByRarity(rarity: BadgeRarity): CarbonBadge[] {
    return Array.from(this.badges.values()).filter(badge => badge.rarity === rarity)
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(category: string): CarbonBadge[] {
    return Array.from(this.badges.values()).filter(badge => badge.category === category)
  }

  /**
   * Get all available badges
   */
  getAllBadges(): CarbonBadge[] {
    return Array.from(this.badges.values())
  }

  /**
   * Get badge by ID
   */
  getBadge(badgeId: string): CarbonBadge | undefined {
    return this.badges.get(badgeId)
  }

  /**
   * Check if user has specific badge
   */
  hasBadge(userId: string, badgeId: string): boolean {
    const userBadgeIds = this.userBadges.get(userId) || new Set()
    return userBadgeIds.has(badgeId)
  }

  /**
   * Get user's badge statistics
   */
  getBadgeStats(userId: string): {
    totalBadges: number
    badgesByRarity: Record<BadgeRarity, number>
    totalDaoPoints: number
    recentBadges: CarbonBadge[]
  } {
    const userBadges = this.getUserBadges(userId)
    const badgesByRarity: Record<BadgeRarity, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    }

    userBadges.forEach(badge => {
      badgesByRarity[badge.rarity]++
    })

    const recentBadges = userBadges
      .filter(badge => badge.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 5)

    return {
      totalBadges: userBadges.length,
      badgesByRarity,
      totalDaoPoints: this.getDaoPoints(userId),
      recentBadges
    }
  }

  /**
   * Reset user data (for testing)
   */
  resetUserData(userId: string): void {
    this.userBadges.delete(userId)
    this.userDaoPoints.delete(userId)
    this.saveUserData()
  }

  /**
   * Export user data
   */
  exportUserData(userId: string): {
    badges: CarbonBadge[]
    daoPoints: number
    exportDate: Date
  } {
    return {
      badges: this.getUserBadges(userId),
      daoPoints: this.getDaoPoints(userId),
      exportDate: new Date()
    }
  }
}

// Export singleton instance
export const badgeSystem = new BadgeSystem()
