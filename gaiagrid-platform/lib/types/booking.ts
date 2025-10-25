// Energy Node Types
export interface EnergyNode {
  id: string
  name: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  // Energy capacity information - more precise definition
  energyCapacity: {
    totalCapacity: number // kW - Total generation capacity
    availableCapacity: number // kW - Available capacity
    currentLoad: number // kW - Current load
    efficiency: number // % - Energy efficiency
    description: string // User description
    energyType: 'solar' | 'wind' | 'geothermal' | 'hydroelectric' | 'hybrid'
    status: 'online' | 'offline' | 'maintenance'
  }
  // Multi-network pricing
  pricing: {
    [networkId: number]: {
      dailyRate: string // Original token price
      fiatEquivalent: {
        usd: number
        eur: number
      }
      currency: string // ETH, MATIC, ARB etc
      gasEstimate: string
    }
  }
  amenities: string[]
  rating: number
  image: string
  operator: string
  isAvailable: boolean
  carbonOffset: number // tons CO₂/month
  uptime: number // percentage
}

// Booking Request Types
export interface BookingRequest {
  nodeId: string
  userId: string
  checkIn: Date
  checkOut: Date
  duration: number // days
  paymentMethod: 'ETH' | 'USDC' | 'GAIA' | 'MATIC' | 'ARB'
  networkId: number // 1=Mainnet, 137=Polygon, 42161=Arbitrum
  totalCost: string
  fiatEquivalent: {
    usd: number
    eur: number
    currency: string
  }
  specialRequests?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  isSimulated: boolean // Clearly marked as simulated transaction
  createdAt: Date
  updatedAt: Date
}

// Energy Capacity Display Types
export interface EnergyCapacityDisplay {
  totalCapacity: {
    value: number
    unit: 'kW'
    label: 'Total Generation Capacity'
    description: 'Maximum power this node can generate'
    userBenefit: 'Ensures reliable power supply for your devices'
  }
  availableCapacity: {
    value: number
    unit: 'kW'
    label: 'Available for Booking'
    description: 'Power capacity available for new bookings'
    userBenefit: 'Guarantees sufficient power for your stay'
  }
  currentLoad: {
    value: number
    unit: 'kW'
    label: 'Currently in Use'
    description: 'Power being used by current occupants'
    userBenefit: 'Shows real-time usage and availability'
  }
  efficiency: {
    value: number
    unit: '%'
    label: 'Energy Efficiency'
    description: 'How efficiently this node converts renewable energy'
    userBenefit: 'Higher efficiency means more sustainable energy'
  }
}

// Multi-Network Pricing Types
export interface MultiNetworkPricing {
  // Base price (USD)
  basePriceUSD: number
  
  // Network prices
  networkPrices: {
    [networkId: number]: {
      networkName: string
      currency: string
      dailyRate: string
      gasEstimate: string
      totalCost: string
      fiatEquivalent: {
        usd: number
        eur: number
      }
      exchangeRate: number
    }
  }
}

export interface PriceBreakdown {
  basePrice: string
  networkFee: string
  totalCost: string
  fiatEquivalent: {
    usd: number
    eur: number
  }
  savings?: string // Savings compared to other networks
}

// Demo Mode Types
export interface DemoMode {
  isEnabled: boolean
  virtualWallet: {
    address: string
    balances: {
      [token: string]: string
    }
    transactionHistory: SimulatedTransaction[]
  }
  simulatedContracts: {
    bookingContract: SimulatedContract
    nftContract: SimulatedContract
    governanceContract: SimulatedContract
  }
  demoScenarios: {
    successfulBooking: () => void
    paymentFailure: () => void
    networkSwitch: () => void
    refundProcess: () => void
  }
}

export interface SimulatedTransaction {
  id: string
  type: 'booking' | 'nft_mint' | 'governance_vote'
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: Date
  amount?: string
  token?: string
  networkId: number
}

export interface SimulatedContract {
  address: string
  name: string
  methods: {
    [methodName: string]: (...args: any[]) => Promise<SimulatedTransaction>
  }
}

// Simulated transaction result
export interface SimulatedTransactionResult {
  success: boolean
  transactionHash: string // Simulated hash
  blockNumber: number // Simulated block number
  gasUsed: string
  status: 'pending' | 'confirmed' | 'failed'
  message: string
  isSimulated: true // Clearly marked as simulated
}

// User Education Types
export interface UserEducation {
  tooltips: {
    energyCapacity: string
    pricing: string
    booking: string
    nft: string
    governance: string
  }
  
  guidedTour: {
    steps: Array<{
      target: string
      title: string
      content: string
      action?: string
    }>
  }
  
  faq: Array<{
    question: string
    answer: string
    category: 'pricing' | 'energy' | 'booking' | 'web3' | 'nft'
  }>
}

// Energy Info Card Types
export interface EnergyInfoCard {
  // Primary display - on card
  primary: {
    icon: "🔋" | "⚡" | "🌱" | "🌊" | "💨"
    title: string // "Self-sufficient 100 kW"
    subtitle: string // "Solar + Wind + Storage"
    status: "online" | "offline" | "maintenance"
  }
  
  // Detailed metrics - shown on hover
  metrics: {
    capacity: { value: string; unit: string; label: string }
    efficiency: { value: string; unit: string; label: string }
    carbonOffset: { value: string; unit: string; label: string }
    uptime: { value: string; unit: string; label: string }
  }
  
  // Real-time status
  realtime: {
    currentLoad: { value: string; unit: string; label: string }
    available: { value: string; unit: string; label: string }
    batteryLevel?: { value: string; unit: string; label: string }
  }
}

// Booking Form Components Types
export interface BookingFormComponents {
  // Date picker
  datePicker: {
    type: "range"
    format: "YYYY-MM-DD"
    minDate: "today"
    maxDate: "+6months"
    placeholder: string
  }
  
  // Duration slider
  durationSlider: {
    min: number
    max: number
    step: number
    defaultValue: number
    marks: number[]
    tooltip: string
  }
  
  // Network selector
  networkSelector: {
    type: "radio-group"
    options: Array<{
      value: number
      label: string
      icon: string
      gas: string
    }>
  }
  
  // Price display
  priceDisplay: {
    basePrice: { token: string; amount: string; fiat: string }
    networkFee: { token: string; amount: string; fiat: string }
    total: { token: string; amount: string; fiat: string }
    savings?: string
  }
}

// Loading States
export interface LoadingStates {
  // Booking processing
  booking: {
    text: string
    icon: string
    duration: string
  }
  
  // Network switching
  networkSwitch: {
    text: string
    icon: string
    duration: string
  }
  
  // Price calculating
  priceCalculation: {
    text: string
    icon: string
    duration: string
  }
}

// Energy Info Templates
export const EnergyInfoTemplates = {
  // Generate copy based on energy type
  solar: {
    primary: "🔋 Solar-powered 100 kW system",
    subtitle: "Self-sufficient with battery storage",
    benefits: "Clean energy, off-grid capability"
  },
  
  wind: {
    primary: "💨 Wind-powered 60 kW system", 
    subtitle: "Grid-connected with backup",
    benefits: "Consistent power, low maintenance"
  },
  
  geothermal: {
    primary: "🌱 Geothermal 80 kW system",
    subtitle: "24/7 renewable energy",
    benefits: "Reliable baseload power"
  },
  
  hydroelectric: {
    primary: "🌊 Hydroelectric 120 kW system",
    subtitle: "Water-powered renewable energy",
    benefits: "Consistent and reliable power"
  },
  
  hybrid: {
    primary: "⚡ Hybrid 120 kW system",
    subtitle: "Solar + Wind + Storage",
    benefits: "Maximum reliability and efficiency"
  }
} as const

// Network Configuration
export interface NetworkConfig {
  id: number
  name: string
  currency: string
  icon: string
  gasEstimate: string
  rpcUrl: string
  blockExplorer: string
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 1,
    name: "Ethereum",
    currency: "ETH",
    icon: "⟠",
    gasEstimate: "~$15",
    rpcUrl: "https://mainnet.infura.io/v3/your-key",
    blockExplorer: "https://etherscan.io"
  },
  {
    id: 137,
    name: "Polygon",
    currency: "MATIC",
    icon: "⬟",
    gasEstimate: "~$0.01",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com"
  },
  {
    id: 42161,
    name: "Arbitrum",
    currency: "ETH",
    icon: "🔷",
    gasEstimate: "~$0.50",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io"
  }
]
