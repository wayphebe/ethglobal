import { 
  DemoMode, 
  SimulatedTransaction, 
  SimulatedTransactionResult, 
  SimulatedContract,
  BookingRequest 
} from './types/booking'

// Demo Mode Manager
export class DemoModeManager {
  private isDemoMode: boolean = true
  private virtualState: VirtualState = new VirtualState()
  private exchangeRates: Map<string, number> = new Map()
  
  constructor() {
    this.initializeExchangeRates()
  }

  // Initialize mock exchange rates
  private initializeExchangeRates() {
    this.exchangeRates.set('ETH-USD', 3000)
    this.exchangeRates.set('MATIC-USD', 0.8)
    this.exchangeRates.set('ARB-USD', 1.2)
    this.exchangeRates.set('USD-EUR', 0.85)
  }

  // Simulate transaction
  async simulateTransaction(
    type: 'booking' | 'nft_mint' | 'governance_vote' | 'payment',
    params: any
  ): Promise<SimulatedTransactionResult> {
    if (!this.isDemoMode) {
      throw new Error('Not in demo mode')
    }
    
    // Simulate transaction delay
    await this.delay(2000 + Math.random() * 3000)
    
    // Generate mock result
    const success = Math.random() > 0.1 // 90% success rate
    
    return {
      success,
      transactionHash: this.generateMockHash(),
      blockNumber: this.generateMockBlockNumber(),
      gasUsed: this.estimateGasUsed(type),
      status: success ? 'confirmed' : 'failed',
      message: success ? 'Transaction simulated successfully' : 'Transaction failed (simulated)',
      isSimulated: true
    }
  }

  // Simulate booking transaction
  async simulateBooking(bookingRequest: BookingRequest): Promise<SimulatedTransactionResult> {
    const result = await this.simulateTransaction('booking', bookingRequest)
    
    if (result.success) {
      // Update virtual state
      this.virtualState.addBooking(bookingRequest)
      this.virtualState.updateWalletBalance(
        bookingRequest.paymentMethod,
        '-' + bookingRequest.totalCost
      )
    }
    
    return result
  }

  // Simulate NFT minting
  async simulateNFTMint(nodeId: string, userId: string): Promise<SimulatedTransactionResult> {
    const result = await this.simulateTransaction('nft_mint', { nodeId, userId })
    
    if (result.success) {
      this.virtualState.mintNFT(nodeId, userId)
    }
    
    return result
  }

  // Simulate governance vote
  async simulateGovernanceVote(proposalId: string, vote: boolean): Promise<SimulatedTransactionResult> {
    const result = await this.simulateTransaction('governance_vote', { proposalId, vote })
    
    if (result.success) {
      this.virtualState.addVote(proposalId, vote)
    }
    
    return result
  }

  // Get virtual wallet state
  getVirtualWallet() {
    return this.virtualState.getWallet()
  }

  // Get virtual bookings
  getVirtualBookings() {
    return this.virtualState.getBookings()
  }

  // Get virtual NFTs
  getVirtualNFTs() {
    return this.virtualState.getNFTs()
  }

  // Update virtual state
  updateVirtualState(transaction: SimulatedTransactionResult): void {
    this.virtualState.applyTransaction(transaction)
  }

  // Helper methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateMockHash(): string {
    return '0x' + Math.random().toString(16).substr(2, 64)
  }

  private generateMockBlockNumber(): number {
    return 18000000 + Math.floor(Math.random() * 100000)
  }

  private estimateGasUsed(type: string): string {
    const gasEstimates = {
      booking: '150000',
      nft_mint: '200000',
      governance_vote: '100000',
      payment: '21000'
    }
    return gasEstimates[type as keyof typeof gasEstimates] || '100000'
  }

  // Get exchange rate
  getExchangeRate(from: string, to: string): number {
    const key = `${from}-${to}`
    return this.exchangeRates.get(key) || 1
  }

  // Update exchange rates (simulate real-time updates)
  async updateExchangeRates(): Promise<void> {
    // Simulate API call delay
    await this.delay(1000)
    
    // Add some random fluctuation
    const fluctuation = 0.95 + Math.random() * 0.1 // ±5% fluctuation
    this.exchangeRates.set('ETH-USD', 3000 * fluctuation)
    this.exchangeRates.set('MATIC-USD', 0.8 * fluctuation)
    this.exchangeRates.set('ARB-USD', 1.2 * fluctuation)
  }
}

// Virtual State Manager
class VirtualState {
  private wallet = {
    address: '0x' + Math.random().toString(16).substr(2, 40),
    balances: {
      'ETH': '2.5',
      'MATIC': '1000',
      'ARB': '1.2',
      'USDC': '5000',
      'GAIA': '10000'
    },
    transactionHistory: [] as SimulatedTransaction[]
  }

  private bookings: BookingRequest[] = []
  private nfts: Array<{ id: string; nodeId: string; userId: string; mintedAt: Date }> = []
  private votes: Array<{ proposalId: string; vote: boolean; timestamp: Date }> = []

  getWallet() {
    return this.wallet
  }

  getBookings() {
    return this.bookings
  }

  getNFTs() {
    return this.nfts
  }

  addBooking(booking: BookingRequest) {
    this.bookings.push(booking)
  }

  updateWalletBalance(token: string, amount: string) {
    const currentBalance = parseFloat(this.wallet.balances[token] || '0')
    const change = parseFloat(amount)
    this.wallet.balances[token] = (currentBalance + change).toFixed(6)
  }

  mintNFT(nodeId: string, userId: string) {
    this.nfts.push({
      id: Math.random().toString(36).substr(2, 9),
      nodeId,
      userId,
      mintedAt: new Date()
    })
  }

  addVote(proposalId: string, vote: boolean) {
    this.votes.push({
      proposalId,
      vote,
      timestamp: new Date()
    })
  }

  applyTransaction(transaction: SimulatedTransactionResult) {
    // Add to transaction history
    this.wallet.transactionHistory.push({
      id: transaction.transactionHash,
      type: 'booking',
      hash: transaction.transactionHash,
      status: transaction.status,
      timestamp: new Date(),
      networkId: 1
    })
  }
}

// Simulated Contract Manager
export class SimulatedContractManager {
  private contracts: Map<string, SimulatedContract> = new Map()

  constructor() {
    this.initializeContracts()
  }

  private initializeContracts() {
    // Booking Contract
    this.contracts.set('booking', {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      name: 'EnergyBookingContract',
      methods: {
        createBooking: async (bookingData: any) => {
          await this.delay(2000)
          return {
            id: Math.random().toString(36).substr(2, 9),
            type: 'booking' as const,
            hash: '0x' + Math.random().toString(16).substr(2, 64),
            status: 'confirmed' as const,
            timestamp: new Date(),
            networkId: 1
          }
        },
        cancelBooking: async (bookingId: string) => {
          await this.delay(1500)
          return {
            id: Math.random().toString(36).substr(2, 9),
            type: 'booking' as const,
            hash: '0x' + Math.random().toString(16).substr(2, 64),
            status: 'confirmed' as const,
            timestamp: new Date(),
            networkId: 1
          }
        }
      }
    })

    // NFT Contract
    this.contracts.set('nft', {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      name: 'RWAEnergyNFT',
      methods: {
        mint: async (nodeId: string, userId: string) => {
          await this.delay(3000)
          return {
            id: Math.random().toString(36).substr(2, 9),
            type: 'nft_mint' as const,
            hash: '0x' + Math.random().toString(16).substr(2, 64),
            status: 'confirmed' as const,
            timestamp: new Date(),
            networkId: 1
          }
        }
      }
    })

    // Governance Contract
    this.contracts.set('governance', {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      name: 'SimpleGovernance',
      methods: {
        vote: async (proposalId: string, vote: boolean) => {
          await this.delay(1000)
          return {
            id: Math.random().toString(36).substr(2, 9),
            type: 'governance_vote' as const,
            hash: '0x' + Math.random().toString(16).substr(2, 64),
            status: 'confirmed' as const,
            timestamp: new Date(),
            networkId: 1
          }
        }
      }
    })
  }

  getContract(name: string): SimulatedContract | undefined {
    return this.contracts.get(name)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Demo Scenarios
export class DemoScenarios {
  private demoMode: DemoModeManager
  private contractManager: SimulatedContractManager

  constructor() {
    this.demoMode = new DemoModeManager()
    this.contractManager = new SimulatedContractManager()
  }

  // Successful booking scenario
  async successfulBooking(nodeId: string, userId: string, duration: number) {
    console.log('🎬 Running successful booking scenario...')
    
    // Simulate booking process
    const bookingRequest: BookingRequest = {
      nodeId,
      userId,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      duration,
      paymentMethod: 'ETH',
      networkId: 1,
      totalCost: '0.05',
      fiatEquivalent: { usd: 150, eur: 127.5, currency: 'USD' },
      status: 'confirmed',
      isSimulated: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await this.demoMode.simulateBooking(bookingRequest)
    
    if (result.success) {
      // Simulate NFT minting
      await this.demoMode.simulateNFTMint(nodeId, userId)
    }

    return result
  }

  // Payment failure scenario
  async paymentFailure(nodeId: string, userId: string) {
    console.log('🎬 Running payment failure scenario...')
    
    // Simulate failed payment
    const result = await this.demoMode.simulateTransaction('payment', {
      nodeId,
      userId,
      amount: '0.05',
      token: 'ETH'
    })

    return result
  }

  // Network switch scenario
  async networkSwitch(fromNetwork: number, toNetwork: number) {
    console.log(`🎬 Running network switch scenario: ${fromNetwork} → ${toNetwork}`)
    
    // Simulate network switch delay
    await this.demoMode.delay(3000)
    
    return {
      success: true,
      message: `Successfully switched from network ${fromNetwork} to ${toNetwork}`,
      isSimulated: true
    }
  }

  // Refund process scenario
  async refundProcess(bookingId: string) {
    console.log('🎬 Running refund process scenario...')
    
    const result = await this.demoMode.simulateTransaction('booking', {
      action: 'refund',
      bookingId
    })

    if (result.success) {
      // Update virtual wallet with refund
      this.demoMode.getVirtualWallet().balances.ETH = 
        (parseFloat(this.demoMode.getVirtualWallet().balances.ETH) + 0.05).toFixed(6)
    }

    return result
  }
}

// Export singleton instances
export const demoModeManager = new DemoModeManager()
export const simulatedContractManager = new SimulatedContractManager()
export const demoScenarios = new DemoScenarios()
