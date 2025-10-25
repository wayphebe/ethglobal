export type EnergyType = 'solar' | 'wind' | 'geothermal' | 'hydroelectric' | 'battery' | 'grid'

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export interface CarbonOffset {
  userId: string
  period: Period
  totalOffset: number // tons CO2
  breakdown: {
    [energyType in EnergyType]?: {
      amount: number // kWh
      carbonFactor: number // kg CO2/kWh
      offset: number // tons CO2
    }
  }
  verificationStatus: VerificationStatus
  timestamp: Date
}

export interface CarbonBadge {
  id: string
  name: string
  description: string
  threshold: number // tons CO2
  rarity: BadgeRarity
  icon: string
  daoPoints: number
  category: 'monthly' | 'yearly' | 'milestone' | 'special'
  unlockedAt?: Date
  progress?: number // 0-100 for locked badges
}

export interface BadgeProgress {
  badgeId: string
  current: number
  threshold: number
  percentage: number
  timeToUnlock?: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  totalOffset: number
  badges: number
  daoPoints: number
  avatar?: string
}

export interface CarbonStats {
  totalOffset: number
  monthlyOffset: number
  yearlyOffset: number
  badgesEarned: number
  daoPoints: number
  rank?: number
  efficiency: number // offset per kWh
}

export interface EnvironmentalImpact {
  treesPlanted: number
  carsOffRoad: number // equivalent miles not driven
  co2Avoided: number // tons
  energySaved: number // kWh
}

export interface CarbonTrend {
  period: Period
  data: Array<{
    date: string
    offset: number
    generation: number
    consumption: number
  }>
}

export interface BadgeAward {
  id: string
  badgeId: string
  userId: string
  awardedAt: Date
  daoPointsEarned: number
  notificationSent: boolean
}

export interface CarbonGoal {
  id: string
  userId: string
  targetOffset: number
  currentOffset: number
  deadline: Date
  reward: number // DAO points
  status: 'active' | 'completed' | 'expired'
  createdAt: Date
}

// Carbon calculation constants
export const CARBON_FACTORS: Record<EnergyType, number> = {
  solar: 0.04, // kg CO2/kWh
  wind: 0.011, // kg CO2/kWh
  geothermal: 0.006, // kg CO2/kWh
  hydroelectric: 0.024, // kg CO2/kWh
  battery: 0.05, // kg CO2/kWh (storage efficiency loss)
  grid: 0.5 // kg CO2/kWh (average grid)
}

// Badge definitions
export const BADGE_DEFINITIONS: Omit<CarbonBadge, 'unlockedAt' | 'progress'>[] = [
  // Monthly badges
  {
    id: 'monthly-2-4',
    name: '月度环保先锋',
    description: '月度碳减排达到2.4吨',
    threshold: 2.4,
    rarity: 'common',
    icon: '🌱',
    daoPoints: 100,
    category: 'monthly'
  },
  {
    id: 'monthly-5',
    name: '月度绿色英雄',
    description: '月度碳减排达到5吨',
    threshold: 5,
    rarity: 'rare',
    icon: '🌿',
    daoPoints: 250,
    category: 'monthly'
  },
  {
    id: 'monthly-10',
    name: '月度环保大师',
    description: '月度碳减排达到10吨',
    threshold: 10,
    rarity: 'epic',
    icon: '🌳',
    daoPoints: 500,
    category: 'monthly'
  },

  // Yearly badges
  {
    id: 'yearly-30',
    name: '年度绿色英雄',
    description: '年度碳减排达到30吨',
    threshold: 30,
    rarity: 'rare',
    icon: '🏆',
    daoPoints: 1000,
    category: 'yearly'
  },
  {
    id: 'yearly-100',
    name: '年度环保大师',
    description: '年度碳减排达到100吨',
    threshold: 100,
    rarity: 'epic',
    icon: '👑',
    daoPoints: 2500,
    category: 'yearly'
  },
  {
    id: 'yearly-500',
    name: '年度环保传奇',
    description: '年度碳减排达到500吨',
    threshold: 500,
    rarity: 'legendary',
    icon: '🌟',
    daoPoints: 5000,
    category: 'yearly'
  },

  // Milestone badges
  {
    id: 'milestone-100',
    name: '百吨减排者',
    description: '累计碳减排达到100吨',
    threshold: 100,
    rarity: 'epic',
    icon: '💯',
    daoPoints: 2000,
    category: 'milestone'
  },
  {
    id: 'milestone-500',
    name: '五百吨减排者',
    description: '累计碳减排达到500吨',
    threshold: 500,
    rarity: 'legendary',
    icon: '🔥',
    daoPoints: 5000,
    category: 'milestone'
  },
  {
    id: 'milestone-1000',
    name: '千吨减排者',
    description: '累计碳减排达到1000吨',
    threshold: 1000,
    rarity: 'legendary',
    icon: '⚡',
    daoPoints: 10000,
    category: 'milestone'
  },

  // Special badges
  {
    id: 'governance-participant',
    name: '治理参与者',
    description: '参与DAO治理投票',
    threshold: 1, // 1 vote
    rarity: 'common',
    icon: '🗳️',
    daoPoints: 50,
    category: 'special'
  },
  {
    id: 'proposal-creator',
    name: '提案创建者',
    description: '成功创建治理提案',
    threshold: 1, // 1 proposal
    rarity: 'rare',
    icon: '📝',
    daoPoints: 200,
    category: 'special'
  },
  {
    id: 'community-builder',
    name: '社区建设者',
    description: '连续30天参与社区活动',
    threshold: 30, // 30 days
    rarity: 'epic',
    icon: '🤝',
    daoPoints: 1000,
    category: 'special'
  }
]

// Environmental impact calculations
export const ENVIRONMENTAL_FACTORS = {
  TREE_CO2_ABSORPTION: 0.022, // tons CO2 per tree per year
  CAR_EMISSIONS_PER_MILE: 0.0004, // tons CO2 per mile
  AVERAGE_MILES_PER_CAR: 12000 // miles per year
}

export function calculateEnvironmentalImpact(totalOffset: number): EnvironmentalImpact {
  return {
    treesPlanted: Math.round(totalOffset / ENVIRONMENTAL_FACTORS.TREE_CO2_ABSORPTION),
    carsOffRoad: Math.round(totalOffset / (ENVIRONMENTAL_FACTORS.CAR_EMISSIONS_PER_MILE * ENVIRONMENTAL_FACTORS.AVERAGE_MILES_PER_CAR)),
    co2Avoided: totalOffset,
    energySaved: totalOffset * 1000 / 0.5 // Assuming 0.5 kg CO2/kWh average
  }
}
