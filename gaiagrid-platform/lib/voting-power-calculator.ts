import { useRWANFT } from './contracts/hooks/useRWANFT'

export interface NFT {
  id: string
  tokenId: string
  name: string
  type: EnergyType
  capacity: number // kW
  location: string
  status: 'active' | 'maintenance' | 'inactive'
  owner: string
  metadata: {
    image: string
    description: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
  }
}

export type EnergyType = 'solar' | 'wind' | 'geothermal' | 'hydroelectric' | 'battery'

export interface VotingPower {
  userId: string
  totalPower: number
  nftBreakdown: {
    [nftType: string]: {
      count: number
      weight: number
      power: number
    }
  }
  lastUpdated: Date
}

export interface VotingPowerBreakdown {
  totalPower: number
  breakdown: Array<{
    nftType: EnergyType
    count: number
    weight: number
    power: number
    percentage: number
  }>
  daoPointsBonus: number
  carbonOffsetBonus: number
}

export class VotingPowerCalculator {
  private static readonly NFT_WEIGHTS: Record<EnergyType, number> = {
    solar: 1.0,
    wind: 1.2,
    geothermal: 1.5,
    hydroelectric: 1.3,
    battery: 0.8
  }

  private static readonly BASE_POWER_PER_KW = 100 // Base voting power per kW of capacity
  private static readonly DAO_POINTS_MULTIPLIER = 0.1 // 0.1 voting power per DAO point
  private static readonly CARBON_BONUS_THRESHOLD = 10 // tons CO2 for bonus
  private static readonly CARBON_BONUS_MULTIPLIER = 0.05 // 5% bonus per 10 tons

  /**
   * Calculate voting power from NFT holdings
   */
  calculatePowerFromNFTs(nfts: NFT[]): VotingPower {
    const nftBreakdown: { [nftType: string]: { count: number; weight: number; power: number } } = {}
    let totalPower = 0

    // Group NFTs by type
    const nftsByType = nfts.reduce((acc, nft) => {
      if (!acc[nft.type]) acc[nft.type] = []
      acc[nft.type].push(nft)
      return acc
    }, {} as Record<EnergyType, NFT[]>)

    // Calculate power for each type
    Object.entries(nftsByType).forEach(([type, typeNFTs]) => {
      const energyType = type as EnergyType
      const weight = VotingPowerCalculator.NFT_WEIGHTS[energyType]
      const count = typeNFTs.length
      
      // Calculate power based on total capacity and weight
      const totalCapacity = typeNFTs.reduce((sum, nft) => sum + nft.capacity, 0)
      const power = totalCapacity * weight * VotingPowerCalculator.BASE_POWER_PER_KW

      nftBreakdown[type] = {
        count,
        weight,
        power
      }

      totalPower += power
    })

    return {
      userId: nfts[0]?.owner || '',
      totalPower,
      nftBreakdown,
      lastUpdated: new Date()
    }
  }

  /**
   * Get NFT weights configuration
   */
  getNFTWeights(): Record<EnergyType, number> {
    return { ...VotingPowerCalculator.NFT_WEIGHTS }
  }

  /**
   * Calculate voting power breakdown including bonuses
   */
  async getVotingPowerBreakdown(
    address: string, 
    nfts: NFT[], 
    daoPoints: number = 0, 
    carbonOffset: number = 0
  ): Promise<VotingPowerBreakdown> {
    const baseVotingPower = this.calculatePowerFromNFTs(nfts)
    
    // Calculate DAO points bonus
    const daoPointsBonus = daoPoints * VotingPowerCalculator.DAO_POINTS_MULTIPLIER
    
    // Calculate carbon offset bonus
    const carbonOffsetBonus = Math.floor(carbonOffset / VotingPowerCalculator.CARBON_BONUS_THRESHOLD) * 
      VotingPowerCalculator.CARBON_BONUS_MULTIPLIER * baseVotingPower.totalPower

    const totalPower = baseVotingPower.totalPower + daoPointsBonus + carbonOffsetBonus

    // Create detailed breakdown
    const breakdown: Array<{
      nftType: EnergyType
      count: number
      weight: number
      power: number
      percentage: number
    }> = []

    Object.entries(baseVotingPower.nftBreakdown).forEach(([type, data]) => {
      breakdown.push({
        nftType: type as EnergyType,
        count: data.count,
        weight: data.weight,
        power: data.power,
        percentage: totalPower > 0 ? (data.power / totalPower) * 100 : 0
      })
    })

    return {
      totalPower,
      breakdown,
      daoPointsBonus,
      carbonOffsetBonus
    }
  }

  /**
   * Calculate voting power percentage of total supply
   */
  calculateVotingPowerPercentage(userPower: number, totalSupply: number): number {
    if (totalSupply === 0) return 0
    return (userPower / totalSupply) * 100
  }

  /**
   * Get voting power requirements for different actions
   */
  getVotingRequirements() {
    return {
      createProposal: 10000, // 10,000 voting power to create proposal
      quorum: 20000, // 20,000 votes needed for quorum
      executionDelay: 24 * 60 * 60 * 1000, // 24 hours delay before execution
      votingPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days voting period
    }
  }

  /**
   * Check if user can create a proposal
   */
  canCreateProposal(votingPower: number): boolean {
    const requirements = this.getVotingRequirements()
    return votingPower >= requirements.createProposal
  }

  /**
   * Get voting power efficiency score (power per NFT)
   */
  getVotingEfficiency(nfts: NFT[]): number {
    if (nfts.length === 0) return 0
    
    const votingPower = this.calculatePowerFromNFTs(nfts)
    return votingPower.totalPower / nfts.length
  }

  /**
   * Get recommended NFT types for increasing voting power
   */
  getRecommendedNFTTypes(currentNFTs: NFT[]): Array<{ type: EnergyType; weight: number; reason: string }> {
    const currentTypes = new Set(currentNFTs.map(nft => nft.type))
    const recommendations: Array<{ type: EnergyType; weight: number; reason: string }> = []

    Object.entries(VotingPowerCalculator.NFT_WEIGHTS).forEach(([type, weight]) => {
      if (!currentTypes.has(type as EnergyType)) {
        let reason = ''
        if (weight >= 1.5) {
          reason = 'Highest voting power multiplier'
        } else if (weight >= 1.2) {
          reason = 'High voting power multiplier'
        } else if (weight >= 1.0) {
          reason = 'Good voting power multiplier'
        } else {
          reason = 'Lower voting power but still valuable'
        }

        recommendations.push({
          type: type as EnergyType,
          weight,
          reason
        })
      }
    })

    return recommendations.sort((a, b) => b.weight - a.weight)
  }
}

// Export singleton instance
export const votingPowerCalculator = new VotingPowerCalculator()
