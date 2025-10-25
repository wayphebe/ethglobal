import { IoTDataPoint } from './types/energy'
import { 
  CarbonOffset, 
  EnergyType, 
  Period, 
  CARBON_FACTORS, 
  calculateEnvironmentalImpact,
  EnvironmentalImpact 
} from './types/carbon'

export class CarbonCalculator {
  private static readonly CARBON_FACTORS = CARBON_FACTORS

  /**
   * Calculate carbon offset from energy data
   */
  calculateOffset(energyData: IoTDataPoint[]): CarbonOffset {
    const breakdown: { [energyType in EnergyType]?: {
      amount: number
      carbonFactor: number
      offset: number
    } } = {}

    let totalOffset = 0

    // Group data by energy type
    const dataByType = energyData.reduce((acc, point) => {
      if (!acc[point.energyType]) acc[point.energyType] = []
      acc[point.energyType].push(point)
      return acc
    }, {} as Record<EnergyType, IoTDataPoint[]>)

    // Calculate offset for each energy type
    Object.entries(dataByType).forEach(([type, points]) => {
      const energyType = type as EnergyType
      const factor = CarbonCalculator.CARBON_FACTORS[energyType]
      
      // Sum up energy amounts (convert to kWh)
      const totalAmount = points.reduce((sum, point) => sum + point.value, 0)
      
      // Calculate offset (convert kg to tons)
      const offset = (totalAmount * factor) / 1000
      
      breakdown[energyType] = {
        amount: totalAmount,
        carbonFactor: factor,
        offset
      }

      totalOffset += offset
    })

    return {
      userId: '', // Will be set by caller
      period: 'daily', // Will be set by caller
      totalOffset,
      breakdown,
      verificationStatus: 'verified',
      timestamp: new Date()
    }
  }

  /**
   * Calculate carbon offset for a specific period
   */
  calculateOffsetForPeriod(
    energyData: IoTDataPoint[], 
    period: Period,
    userId: string
  ): CarbonOffset {
    const offset = this.calculateOffset(energyData)
    offset.period = period
    offset.userId = userId
    return offset
  }

  /**
   * Calculate daily carbon offset
   */
  calculateDailyOffset(energyData: IoTDataPoint[], userId: string): CarbonOffset {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const todayData = energyData.filter(point => 
      point.timestamp >= startOfDay.getTime() && point.timestamp < endOfDay.getTime()
    )

    return this.calculateOffsetForPeriod(todayData, 'daily', userId)
  }

  /**
   * Calculate weekly carbon offset
   */
  calculateWeeklyOffset(energyData: IoTDataPoint[], userId: string): CarbonOffset {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const weekData = energyData.filter(point => 
      point.timestamp >= startOfWeek.getTime() && point.timestamp < endOfWeek.getTime()
    )

    return this.calculateOffsetForPeriod(weekData, 'weekly', userId)
  }

  /**
   * Calculate monthly carbon offset
   */
  calculateMonthlyOffset(energyData: IoTDataPoint[], userId: string): CarbonOffset {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const monthData = energyData.filter(point => 
      point.timestamp >= startOfMonth.getTime() && point.timestamp < endOfMonth.getTime()
    )

    return this.calculateOffsetForPeriod(monthData, 'monthly', userId)
  }

  /**
   * Calculate yearly carbon offset
   */
  calculateYearlyOffset(energyData: IoTDataPoint[], userId: string): CarbonOffset {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const endOfYear = new Date(today.getFullYear() + 1, 0, 1)

    const yearData = energyData.filter(point => 
      point.timestamp >= startOfYear.getTime() && point.timestamp < endOfYear.getTime()
    )

    return this.calculateOffsetForPeriod(yearData, 'yearly', userId)
  }

  /**
   * Calculate carbon offset efficiency (offset per kWh)
   */
  calculateEfficiency(offset: CarbonOffset): number {
    const totalEnergy = Object.values(offset.breakdown)
      .reduce((sum, breakdown) => sum + breakdown.amount, 0)
    
    if (totalEnergy === 0) return 0
    return offset.totalOffset / totalEnergy
  }

  /**
   * Calculate environmental impact
   */
  calculateEnvironmentalImpact(totalOffset: number): EnvironmentalImpact {
    return calculateEnvironmentalImpact(totalOffset)
  }

  /**
   * Get carbon factor for energy type
   */
  getCarbonFactor(energyType: EnergyType): number {
    return CarbonCalculator.CARBON_FACTORS[energyType]
  }

  /**
   * Calculate carbon offset trend over time
   */
  calculateTrend(energyData: IoTDataPoint[], period: Period, userId: string): Array<{
    date: string
    offset: number
    generation: number
    consumption: number
  }> {
    const trend: Array<{
      date: string
      offset: number
      generation: number
      consumption: number
    }> = []

    // Group data by time periods
    const groupedData = this.groupDataByPeriod(energyData, period)

    Object.entries(groupedData).forEach(([date, data]) => {
      const offset = this.calculateOffset(data)
      const generation = data
        .filter(point => point.dataType === 'generation')
        .reduce((sum, point) => sum + point.value, 0)
      const consumption = data
        .filter(point => point.dataType === 'consumption')
        .reduce((sum, point) => sum + point.value, 0)

      trend.push({
        date,
        offset: offset.totalOffset,
        generation,
        consumption
      })
    })

    return trend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  /**
   * Group energy data by time period
   */
  private groupDataByPeriod(
    energyData: IoTDataPoint[], 
    period: Period
  ): Record<string, IoTDataPoint[]> {
    const grouped: Record<string, IoTDataPoint[]> = {}

    energyData.forEach(point => {
      const date = new Date(point.timestamp)
      let key: string

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0] // YYYY-MM-DD
          break
        case 'weekly':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'yearly':
          key = date.getFullYear().toString()
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      if (!grouped[key]) grouped[key] = []
      grouped[key].push(point)
    })

    return grouped
  }

  /**
   * Calculate carbon offset savings compared to grid
   */
  calculateSavings(offset: CarbonOffset): number {
    const totalEnergy = Object.values(offset.breakdown)
      .reduce((sum, breakdown) => sum + breakdown.amount, 0)
    
    const gridOffset = totalEnergy * CarbonCalculator.CARBON_FACTORS.grid / 1000
    return gridOffset - offset.totalOffset
  }

  /**
   * Get carbon offset summary
   */
  getOffsetSummary(offset: CarbonOffset): {
    totalOffset: number
    efficiency: number
    savings: number
    environmentalImpact: EnvironmentalImpact
    topContributor: EnergyType | null
  } {
    const efficiency = this.calculateEfficiency(offset)
    const savings = this.calculateSavings(offset)
    const environmentalImpact = this.calculateEnvironmentalImpact(offset.totalOffset)

    // Find top contributing energy type
    let topContributor: EnergyType | null = null
    let maxOffset = 0

    Object.entries(offset.breakdown).forEach(([type, breakdown]) => {
      if (breakdown.offset > maxOffset) {
        maxOffset = breakdown.offset
        topContributor = type as EnergyType
      }
    })

    return {
      totalOffset: offset.totalOffset,
      efficiency,
      savings,
      environmentalImpact,
      topContributor
    }
  }
}

// Export singleton instance
export const carbonCalculator = new CarbonCalculator()
