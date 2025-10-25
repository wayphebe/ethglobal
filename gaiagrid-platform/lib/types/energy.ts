// Energy and IoT Data Types for GaiaGrid Dashboard

export interface IoTDataPoint {
  deviceId: string
  timestamp: number
  dataType: 'generation' | 'consumption' | 'storage'
  energyType: 'solar' | 'wind' | 'geothermal' | 'battery'
  value: number // kWh
  power: number // kW
  voltage?: number // V
  current?: number // A
  temperature?: number // °C
  humidity?: number // %
  quality: 'good' | 'warning' | 'error'
}

export interface DevicePattern {
  type: 'ai_render' | 'solar' | 'battery' | 'general'
  baseConsumption: number
  peakHours: number[]
  variability: number
  efficiency: number
}

export interface UserDevice {
  id: string
  name: string
  type: 'ai_render' | 'solar_panel' | 'battery' | 'general'
  currentConsumption: number
  dailyConsumption: number
  efficiency: number
  status: 'online' | 'offline'
  recommendations: string[]
  lastUpdate: Date
  location?: string
}

export interface OptimizationSuggestion {
  id: string
  type: 'time_shift' | 'efficiency' | 'scheduling'
  title: string
  description: string
  potentialSavings: number // percentage
  action: string
  priority: 'low' | 'medium' | 'high'
  deviceId?: string
}

export interface EnergyUsage {
  totalConsumption: number
  totalGeneration: number
  netUsage: number
  efficiency: number
  peakConsumption: number
  peakGeneration: number
  devices: UserDevice[]
}

export interface TimeSlot {
  start: number // hour (0-23)
  end: number // hour (0-23)
  efficiency: number
  cost: number
  recommendation: string
}

export interface ConsumptionPattern {
  deviceId: string
  hourlyPattern: number[] // 24 hours of consumption
  dailyAverage: number
  peakHour: number
  offPeakHour: number
  weekendPattern: number[]
}

// Device type configurations
export const DEVICE_PATTERNS: Record<string, DevicePattern> = {
  ai_render: {
    type: 'ai_render',
    baseConsumption: 2.5, // kW
    peakHours: [20, 21, 22, 23, 0, 1], // Evening/night usage
    variability: 0.3,
    efficiency: 0.85
  },
  solar: {
    type: 'solar',
    baseConsumption: 0,
    peakHours: [10, 11, 12, 13, 14, 15], // Peak sun hours
    variability: 0.4,
    efficiency: 0.9
  },
  battery: {
    type: 'battery',
    baseConsumption: 0.5,
    peakHours: [6, 7, 8, 18, 19, 20], // Morning and evening
    variability: 0.2,
    efficiency: 0.95
  },
  general: {
    type: 'general',
    baseConsumption: 1.0,
    peakHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17], // Work hours
    variability: 0.1,
    efficiency: 0.8
  }
}

// Mock user devices for demo
export const MOCK_DEVICES: UserDevice[] = [
  {
    id: 'ai-render-001',
    name: 'AI Rendering Workstation',
    type: 'ai_render',
    currentConsumption: 2.8,
    dailyConsumption: 45.2,
    efficiency: 0.85,
    status: 'online',
    recommendations: [
      'Consider running during solar peak hours (10AM-3PM)',
      'Current usage is 40% above optimal efficiency'
    ],
    lastUpdate: new Date(),
    location: 'Workspace A'
  },
  {
    id: 'solar-panel-001',
    name: 'Solar Panel Array',
    type: 'solar_panel',
    currentConsumption: 0,
    dailyConsumption: 0,
    efficiency: 0.92,
    status: 'online',
    recommendations: [
      'Generating at 85% capacity',
      'Peak generation expected at 12PM'
    ],
    lastUpdate: new Date(),
    location: 'Roof Installation'
  },
  {
    id: 'battery-001',
    name: 'Energy Storage System',
    type: 'battery',
    currentConsumption: 0.2,
    dailyConsumption: 8.5,
    efficiency: 0.95,
    status: 'online',
    recommendations: [
      'Battery at 78% capacity',
      'Charging from solar generation'
    ],
    lastUpdate: new Date(),
    location: 'Basement Storage'
  },
  {
    id: 'general-001',
    name: 'General Electronics',
    type: 'general',
    currentConsumption: 0.8,
    dailyConsumption: 12.3,
    efficiency: 0.8,
    status: 'online',
    recommendations: [
      'Usage within normal parameters',
      'Consider LED lighting upgrade'
    ],
    lastUpdate: new Date(),
    location: 'Living Area'
  }
]
