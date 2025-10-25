import { 
  IoTDataPoint, 
  DevicePattern, 
  UserDevice, 
  DEVICE_PATTERNS,
  ConsumptionPattern,
  OptimizationSuggestion,
  TimeSlot
} from './types/energy'

export class IoTDataSimulator {
  private isRunning: boolean = false
  private intervalId: NodeJS.Timeout | null = null
  private callbacks: ((data: IoTDataPoint[]) => void)[] = []

  constructor() {
    // Initialize with some historical data
    this.generateHistoricalData()
  }

  /**
   * Generate realistic IoT data based on device patterns
   */
  generateDeviceData(device: UserDevice, timestamp: number = Date.now()): IoTDataPoint {
    const pattern = DEVICE_PATTERNS[device.type] || DEVICE_PATTERNS.general
    const hour = new Date(timestamp).getHours()
    
    let value: number
    let power: number
    let quality: 'good' | 'warning' | 'error' = 'good'

    switch (device.type) {
      case 'ai_render':
        // AI rendering: high usage in evening/night, low during day
        const isPeakHour = pattern.peakHours.includes(hour)
        const basePower = isPeakHour ? pattern.baseConsumption * 1.5 : pattern.baseConsumption * 0.3
        power = this.addVariability(basePower, pattern.variability)
        value = power * 0.25 // 15-minute interval
        break

      case 'solar_panel':
        // Solar: peak at noon, zero at night
        const solarIntensity = this.calculateSolarIntensity(hour)
        power = solarIntensity * pattern.efficiency
        value = power * 0.25 // 15-minute interval
        if (power < 0.1) quality = 'warning'
        break

      case 'battery':
        // Battery: charging during solar peak, discharging during high consumption
        const isCharging = hour >= 10 && hour <= 15
        const isDischarging = hour >= 18 || hour <= 8
        if (isCharging) {
          power = -pattern.baseConsumption * 0.8 // Negative = charging
        } else if (isDischarging) {
          power = pattern.baseConsumption * 0.6
        } else {
          power = 0
        }
        value = power * 0.25
        break

      case 'general':
      default:
        // General: steady usage with slight variations
        power = pattern.baseConsumption + (Math.random() - 0.5) * pattern.variability
        value = power * 0.25
        break
    }

    // Add some random quality issues
    if (Math.random() < 0.05) quality = 'warning'
    if (Math.random() < 0.01) quality = 'error'

    return {
      deviceId: device.id,
      timestamp,
      dataType: device.type === 'solar_panel' ? 'generation' : 'consumption',
      energyType: this.mapDeviceTypeToEnergyType(device.type),
      value: Math.max(0, value),
      power: Math.max(0, power),
      voltage: 220 + (Math.random() - 0.5) * 10,
      current: (power * 1000) / 220 + (Math.random() - 0.5) * 2,
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 30,
      quality
    }
  }

  /**
   * Generate real-time data for all devices
   */
  generateRealtimeData(devices: UserDevice[]): IoTDataPoint[] {
    const timestamp = Date.now()
    return devices.map(device => this.generateDeviceData(device, timestamp))
  }

  /**
   * Start real-time simulation
   */
  startSimulation(devices: UserDevice[], callback: (data: IoTDataPoint[]) => void): void {
    if (this.isRunning) {
      this.stopSimulation()
    }

    this.isRunning = true
    this.callbacks.push(callback)

    this.intervalId = setInterval(() => {
      const newData = this.generateRealtimeData(devices)
      this.callbacks.forEach(cb => cb(newData))
    }, 5000) // Update every 5 seconds
  }

  /**
   * Stop real-time simulation
   */
  stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    this.callbacks = []
  }

  /**
   * Generate historical data for charts
   */
  generateHistoricalData(hours: number = 24): IoTDataPoint[] {
    const data: IoTDataPoint[] = []
    const now = Date.now()
    const intervalMs = 15 * 60 * 1000 // 15 minutes

    for (let i = hours * 4; i >= 0; i--) {
      const timestamp = now - (i * intervalMs)
      const hour = new Date(timestamp).getHours()
      const minute = new Date(timestamp).getMinutes()
      
      // Generate solar data with realistic patterns
      const solarIntensity = this.calculateSolarIntensity(hour)
      const solarVariation = 0.8 + Math.random() * 0.4 // Add some variation
      data.push({
        deviceId: 'solar-panel-001',
        timestamp,
        dataType: 'generation',
        energyType: 'solar',
        value: solarIntensity * 0.25 * solarVariation,
        power: solarIntensity * solarVariation,
        quality: 'good'
      })

      // Generate AI render data with realistic patterns
      let aiUsage = 0.5 // Base usage
      if (hour >= 20 || hour <= 2) {
        // High usage during night hours
        aiUsage = 2.5 + Math.random() * 1.0
      } else if (hour >= 9 && hour <= 17) {
        // Medium usage during work hours
        aiUsage = 1.5 + Math.random() * 0.8
      } else {
        // Low usage during other hours
        aiUsage = 0.3 + Math.random() * 0.4
      }
      
      data.push({
        deviceId: 'ai-render-001',
        timestamp,
        dataType: 'consumption',
        energyType: 'battery',
        value: aiUsage * 0.25,
        power: aiUsage,
        quality: 'good'
      })

      // Generate general consumption with daily patterns
      let generalUsage = 0.8
      if (hour >= 6 && hour <= 9) {
        // Morning peak
        generalUsage = 1.2 + Math.random() * 0.6
      } else if (hour >= 18 && hour <= 22) {
        // Evening peak
        generalUsage = 1.5 + Math.random() * 0.8
      } else if (hour >= 22 || hour <= 6) {
        // Night low usage
        generalUsage = 0.3 + Math.random() * 0.3
      } else {
        // Daytime moderate usage
        generalUsage = 0.8 + Math.random() * 0.4
      }
      
      data.push({
        deviceId: 'general-001',
        timestamp,
        dataType: 'consumption',
        energyType: 'battery',
        value: generalUsage * 0.25,
        power: generalUsage,
        quality: 'good'
      })

      // Generate battery storage data
      const batteryLevel = this.calculateBatteryLevel(hour, solarIntensity, aiUsage + generalUsage)
      data.push({
        deviceId: 'battery-001',
        timestamp,
        dataType: 'storage',
        energyType: 'battery',
        value: batteryLevel * 0.25,
        power: batteryLevel,
        quality: 'good'
      })
    }

    return data
  }

  /**
   * Calculate battery level based on solar generation and consumption
   */
  private calculateBatteryLevel(hour: number, solarGeneration: number, totalConsumption: number): number {
    // Battery charges during solar peak hours, discharges during high consumption
    if (hour >= 10 && hour <= 15 && solarGeneration > totalConsumption) {
      // Charging from excess solar
      return -(solarGeneration - totalConsumption) * 0.8
    } else if (hour >= 18 || hour <= 8) {
      // Discharging during high consumption periods
      return Math.min(totalConsumption * 0.6, 2.0)
    } else {
      // Neutral state
      return 0
    }
  }

  /**
   * Analyze usage patterns and generate optimization suggestions
   */
  analyzeUsagePattern(data: IoTDataPoint[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    
    // Group data by device
    const deviceData = data.reduce((acc, point) => {
      if (!acc[point.deviceId]) acc[point.deviceId] = []
      acc[point.deviceId].push(point)
      return acc
    }, {} as Record<string, IoTDataPoint[]>)

    // Analyze AI rendering usage
    const aiData = deviceData['ai-render-001'] || []
    if (aiData.length > 0) {
      const eveningUsage = aiData.filter(d => {
        const hour = new Date(d.timestamp).getHours()
        return hour >= 20 || hour <= 2
      }).reduce((sum, d) => sum + d.power, 0)

      const dayUsage = aiData.filter(d => {
        const hour = new Date(d.timestamp).getHours()
        return hour >= 10 && hour <= 15
      }).reduce((sum, d) => sum + d.power, 0)

      if (eveningUsage > dayUsage * 2) {
        suggestions.push({
          id: 'ai-time-shift',
          type: 'time_shift',
          title: 'Optimize AI Rendering Schedule',
          description: 'Move AI rendering to solar peak hours (10AM-3PM) for 30% energy savings',
          potentialSavings: 30,
          action: 'Schedule AI tasks during solar generation',
          priority: 'high',
          deviceId: 'ai-render-001'
        })
      }
    }

    // Analyze solar generation vs consumption
    const solarData = deviceData['solar-panel-001'] || []
    const totalGeneration = solarData.reduce((sum, d) => sum + d.power, 0)
    const totalConsumption = Object.values(deviceData)
      .flat()
      .filter(d => d.dataType === 'consumption')
      .reduce((sum, d) => sum + d.power, 0)

    if (totalGeneration > totalConsumption * 1.2) {
      suggestions.push({
        id: 'excess-generation',
        type: 'efficiency',
        title: 'Excess Solar Generation',
        description: 'Consider selling excess energy or increasing battery storage',
        potentialSavings: 15,
        action: 'Optimize energy storage or trading',
        priority: 'medium'
      })
    }

    return suggestions
  }

  /**
   * Get optimal time slots for device usage
   */
  getOptimalTimeSlots(deviceType: string): TimeSlot[] {
    const slots: TimeSlot[] = []
    
    if (deviceType === 'ai_render') {
      // Suggest solar peak hours for AI rendering
      slots.push({
        start: 10,
        end: 15,
        efficiency: 0.9,
        cost: 0.1,
        recommendation: 'Solar peak hours - lowest cost and highest efficiency'
      })
    }

    return slots
  }

  /**
   * Calculate solar intensity based on time of day
   */
  private calculateSolarIntensity(hour: number): number {
    if (hour < 6 || hour > 18) return 0
    
    // Simple sine wave approximation for solar intensity
    const normalizedHour = (hour - 6) / 12
    const intensity = Math.sin(normalizedHour * Math.PI)
    return Math.max(0, intensity * 8) // Peak of 8kW
  }

  /**
   * Add realistic variability to data
   */
  private addVariability(baseValue: number, variability: number): number {
    const variation = (Math.random() - 0.5) * 2 * variability
    return Math.max(0, baseValue + (baseValue * variation))
  }

  /**
   * Map device type to energy type
   */
  private mapDeviceTypeToEnergyType(deviceType: string): 'solar' | 'wind' | 'geothermal' | 'battery' {
    switch (deviceType) {
      case 'solar_panel': return 'solar'
      case 'battery': return 'battery'
      case 'ai_render':
      case 'general': return 'battery' // These consume from battery/grid
      default: return 'battery'
    }
  }

  /**
   * Generate consumption pattern for a device
   */
  generateConsumptionPattern(device: UserDevice): ConsumptionPattern {
    const hourlyPattern = Array.from({ length: 24 }, (_, hour) => {
      const pattern = DEVICE_PATTERNS[device.type] || DEVICE_PATTERNS.general
      const isPeakHour = pattern.peakHours.includes(hour)
      const basePower = isPeakHour ? pattern.baseConsumption * 1.2 : pattern.baseConsumption * 0.5
      return this.addVariability(basePower, pattern.variability)
    })

    const dailyAverage = hourlyPattern.reduce((sum, val) => sum + val, 0) / 24
    const peakHour = hourlyPattern.indexOf(Math.max(...hourlyPattern))
    const offPeakHour = hourlyPattern.indexOf(Math.min(...hourlyPattern))

    return {
      deviceId: device.id,
      hourlyPattern,
      dailyAverage,
      peakHour,
      offPeakHour,
      weekendPattern: hourlyPattern.map(val => val * 0.7) // 30% less on weekends
    }
  }
}
