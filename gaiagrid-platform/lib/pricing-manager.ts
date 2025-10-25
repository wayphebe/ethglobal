import { 
  MultiNetworkPricing, 
  PriceBreakdown, 
  NetworkConfig, 
  SUPPORTED_NETWORKS 
} from './types/booking'

// Multi-Network Price Manager
export class MultiNetworkPriceManager {
  private exchangeRates: Map<string, number> = new Map()
  private networkConfigs: Map<number, NetworkConfig> = new Map()
  private basePrices: Map<string, number> = new Map() // nodeId -> base price in USD

  constructor() {
    this.initializeExchangeRates()
    this.initializeNetworkConfigs()
    this.initializeBasePrices()
  }

  // Initialize exchange rates
  private initializeExchangeRates() {
    this.exchangeRates.set('ETH-USD', 3000)
    this.exchangeRates.set('MATIC-USD', 0.8)
    this.exchangeRates.set('ARB-USD', 1.2)
    this.exchangeRates.set('USD-EUR', 0.85)
    this.exchangeRates.set('USD-GBP', 0.79)
  }

  // Initialize network configurations
  private initializeNetworkConfigs() {
    SUPPORTED_NETWORKS.forEach(network => {
      this.networkConfigs.set(network.id, network)
    })
  }

  // Initialize base prices for different nodes
  private initializeBasePrices() {
    // Base prices in USD per day
    this.basePrices.set('bali-solar', 150)
    this.basePrices.set('costa-rica-eco', 200)
    this.basePrices.set('portugal-wind', 180)
    this.basePrices.set('thailand-beach', 120)
    this.basePrices.set('iceland-geothermal', 250)
    this.basePrices.set('morocco-desert', 100)
  }

  // Get real-time price for a node on a specific network
  async getPrice(nodeId: string, networkId: number, duration: number): Promise<PriceBreakdown> {
    const basePriceUSD = this.basePrices.get(nodeId) || 150
    const networkConfig = this.networkConfigs.get(networkId)
    
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${networkId}`)
    }

    const exchangeRate = this.getExchangeRate(networkConfig.currency, 'USD')
    const dailyRate = basePriceUSD / exchangeRate
    const totalPrice = dailyRate * duration
    const gasFee = this.estimateGasFee(networkId)
    const totalCost = totalPrice + gasFee

    return {
      basePrice: dailyRate.toFixed(6),
      networkFee: gasFee.toFixed(6),
      totalCost: totalCost.toFixed(6),
      fiatEquivalent: {
        usd: basePriceUSD * duration,
        eur: basePriceUSD * duration * this.getExchangeRate('USD', 'EUR')
      },
      savings: this.calculateSavings(networkId, basePriceUSD * duration)
    }
  }

  // Get prices for all supported networks
  async getAllNetworkPrices(nodeId: string, duration: number): Promise<MultiNetworkPricing> {
    const basePriceUSD = this.basePrices.get(nodeId) || 150
    const networkPrices: { [networkId: number]: any } = {}

    for (const network of SUPPORTED_NETWORKS) {
      const price = await this.getPrice(nodeId, network.id, duration)
      const exchangeRate = this.getExchangeRate(network.currency, 'USD')
      
      networkPrices[network.id] = {
        networkName: network.name,
        currency: network.currency,
        dailyRate: price.basePrice,
        gasEstimate: price.networkFee,
        totalCost: price.totalCost,
        fiatEquivalent: price.fiatEquivalent,
        exchangeRate
      }
    }

    return {
      basePriceUSD,
      networkPrices
    }
  }

  // Recommend best network based on total cost
  getBestNetwork(nodeId: string, duration: number): Promise<number> {
    return new Promise(async (resolve) => {
      const allPrices = await this.getAllNetworkPrices(nodeId, duration)
      let bestNetwork = 1
      let lowestCost = Infinity

      for (const [networkId, price] of Object.entries(allPrices.networkPrices)) {
        const totalCost = parseFloat(price.totalCost)
        if (totalCost < lowestCost) {
          lowestCost = totalCost
          bestNetwork = parseInt(networkId)
        }
      }

      resolve(bestNetwork)
    })
  }

  // Calculate savings compared to other networks
  private calculateSavings(networkId: number, basePriceUSD: number): string | undefined {
    const currentPrice = this.getPriceForNetwork(networkId, basePriceUSD)
    const ethPrice = this.getPriceForNetwork(1, basePriceUSD) // Compare to Ethereum
    
    if (networkId === 1) return undefined
    
    const savings = ethPrice - currentPrice
    if (savings > 0) {
      return `Save $${savings.toFixed(2)} vs Ethereum`
    }
    
    return undefined
  }

  // Get price for specific network
  private getPriceForNetwork(networkId: number, basePriceUSD: number): number {
    const networkConfig = this.networkConfigs.get(networkId)
    if (!networkConfig) return basePriceUSD

    const exchangeRate = this.getExchangeRate(networkConfig.currency, 'USD')
    const gasFee = this.estimateGasFee(networkId)
    return (basePriceUSD / exchangeRate) + gasFee
  }

  // Estimate gas fee for network
  private estimateGasFee(networkId: number): number {
    const gasEstimates = {
      1: 0.005, // Ethereum: ~$15
      137: 0.00001, // Polygon: ~$0.01
      42161: 0.0005 // Arbitrum: ~$0.50
    }
    
    return gasEstimates[networkId as keyof typeof gasEstimates] || 0.005
  }

  // Get exchange rate between currencies
  getExchangeRate(from: string, to: string): number {
    if (from === to) return 1
    
    const key = `${from}-${to}`
    const reverseKey = `${to}-${from}`
    
    if (this.exchangeRates.has(key)) {
      return this.exchangeRates.get(key)!
    }
    
    if (this.exchangeRates.has(reverseKey)) {
      return 1 / this.exchangeRates.get(reverseKey)!
    }
    
    return 1
  }

  // Update exchange rates (simulate real-time updates)
  async updateExchangeRates(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add some random fluctuation (±2%)
    const fluctuation = 0.98 + Math.random() * 0.04
    
    this.exchangeRates.set('ETH-USD', 3000 * fluctuation)
    this.exchangeRates.set('MATIC-USD', 0.8 * fluctuation)
    this.exchangeRates.set('ARB-USD', 1.2 * fluctuation)
    this.exchangeRates.set('USD-EUR', 0.85 * fluctuation)
  }

  // Format price for display
  formatPrice(amount: number, currency: string, decimals: number = 6): string {
    return `${amount.toFixed(decimals)} ${currency}`
  }

  // Format fiat price
  formatFiatPrice(amount: number, currency: string = 'USD'): string {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
    return `${symbol}${amount.toFixed(2)}`
  }

  // Calculate price breakdown for display
  calculatePriceBreakdown(
    basePrice: number, 
    networkFee: number, 
    duration: number, 
    currency: string
  ): {
    dailyRate: string
    totalBasePrice: string
    networkFee: string
    totalCost: string
    fiatEquivalent: {
      usd: string
      eur: string
    }
  } {
    const totalBasePrice = basePrice * duration
    const totalCost = totalBasePrice + networkFee
    
    return {
      dailyRate: this.formatPrice(basePrice, currency),
      totalBasePrice: this.formatPrice(totalBasePrice, currency),
      networkFee: this.formatPrice(networkFee, currency),
      totalCost: this.formatPrice(totalCost, currency),
      fiatEquivalent: {
        usd: this.formatFiatPrice(totalCost * this.getExchangeRate(currency, 'USD')),
        eur: this.formatFiatPrice(totalCost * this.getExchangeRate(currency, 'EUR'), 'EUR')
      }
    }
  }

  // Get network info
  getNetworkInfo(networkId: number): NetworkConfig | undefined {
    return this.networkConfigs.get(networkId)
  }

  // Get all supported networks
  getSupportedNetworks(): NetworkConfig[] {
    return SUPPORTED_NETWORKS
  }

  // Check if network is supported
  isNetworkSupported(networkId: number): boolean {
    return this.networkConfigs.has(networkId)
  }
}

// Export singleton instance
export const pricingManager = new MultiNetworkPriceManager()
