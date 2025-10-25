import { ethers } from 'ethers'

// Transaction states
export enum TransactionState {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Transaction types
export enum TransactionType {
  TOKEN_TRANSFER = 'token_transfer',
  NODE_REGISTRATION = 'node_registration',
  ENERGY_TRADING = 'energy_trading',
  NFT_MINTING = 'nft_minting',
  GOVERNANCE_VOTE = 'governance_vote',
  CONTRACT_INTERACTION = 'contract_interaction'
}

// Transaction interface
export interface Transaction {
  hash: string
  type: TransactionType
  state: TransactionState
  from: string
  to: string
  value: string
  gasUsed?: string
  gasPrice?: string
  blockNumber?: number
  confirmations: number
  timestamp: number
  error?: string
  metadata?: Record<string, any>
}

// Transaction manager class
export class TransactionManager {
  private transactions: Map<string, Transaction> = new Map()
  private listeners: Map<string, (transaction: Transaction) => void> = new Map()

  constructor(private provider: ethers.Provider) {}

  /**
   * Add a new transaction to track
   */
  addTransaction(
    hash: string,
    type: TransactionType,
    from: string,
    to: string,
    value: string,
    metadata?: Record<string, any>
  ): Transaction {
    const transaction: Transaction = {
      hash,
      type,
      state: TransactionState.PENDING,
      from,
      to,
      value,
      confirmations: 0,
      timestamp: Date.now(),
      metadata
    }

    this.transactions.set(hash, transaction)
    this.notifyListeners(transaction)
    this.startTracking(hash)

    return transaction
  }

  /**
   * Get transaction by hash
   */
  getTransaction(hash: string): Transaction | undefined {
    return this.transactions.get(hash)
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values())
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: TransactionType): Transaction[] {
    return Array.from(this.transactions.values()).filter(tx => tx.type === type)
  }

  /**
   * Get transactions by address
   */
  getTransactionsByAddress(address: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.from.toLowerCase() === address.toLowerCase() || 
            tx.to.toLowerCase() === address.toLowerCase()
    )
  }

  /**
   * Subscribe to transaction updates
   */
  subscribe(hash: string, callback: (transaction: Transaction) => void): () => void {
    this.listeners.set(hash, callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(hash)
    }
  }

  /**
   * Start tracking a transaction
   */
  private async startTracking(hash: string): Promise<void> {
    try {
      const receipt = await this.provider.waitForTransaction(hash)
      const transaction = this.transactions.get(hash)
      
      if (!transaction) return

      if (receipt.status === 1) {
        transaction.state = TransactionState.CONFIRMED
        transaction.gasUsed = receipt.gasUsed.toString()
        transaction.gasPrice = receipt.gasPrice?.toString()
        transaction.blockNumber = receipt.blockNumber
        transaction.confirmations = receipt.confirmations
      } else {
        transaction.state = TransactionState.FAILED
        transaction.error = 'Transaction failed'
      }

      this.transactions.set(hash, transaction)
      this.notifyListeners(transaction)
    } catch (error) {
      const transaction = this.transactions.get(hash)
      if (transaction) {
        transaction.state = TransactionState.FAILED
        transaction.error = error instanceof Error ? error.message : 'Unknown error'
        this.transactions.set(hash, transaction)
        this.notifyListeners(transaction)
      }
    }
  }

  /**
   * Notify listeners of transaction updates
   */
  private notifyListeners(transaction: Transaction): void {
    const listener = this.listeners.get(transaction.hash)
    if (listener) {
      listener(transaction)
    }
  }

  /**
   * Clear completed transactions
   */
  clearCompleted(): void {
    for (const [hash, transaction] of this.transactions.entries()) {
      if (transaction.state === TransactionState.CONFIRMED || 
          transaction.state === TransactionState.FAILED) {
        this.transactions.delete(hash)
      }
    }
  }

  /**
   * Clear all transactions
   */
  clearAll(): void {
    this.transactions.clear()
    this.listeners.clear()
  }
}

// Gas estimation utilities
export class GasEstimator {
  constructor(private provider: ethers.Provider) {}

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: ethers.TransactionRequest): Promise<{
    gasLimit: string
    gasPrice: string
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
  }> {
    try {
      const gasLimit = await this.provider.estimateGas(transaction)
      const feeData = await this.provider.getFeeData()

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: feeData.gasPrice?.toString() || '0',
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
      }
    } catch (error) {
      throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData()
      return feeData.gasPrice?.toString() || '0'
    } catch (error) {
      throw new Error(`Failed to get gas price: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get recommended gas settings
   */
  async getRecommendedGasSettings(): Promise<{
    gasLimit: string
    gasPrice: string
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
  }> {
    const feeData = await this.provider.getFeeData()
    
    return {
      gasLimit: '500000', // Default gas limit
      gasPrice: feeData.gasPrice?.toString() || '20000000000', // 20 gwei
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
    }
  }
}

// Error handling utilities
export class TransactionErrorHandler {
  /**
   * Parse transaction error and return user-friendly message
   */
  static parseError(error: any): string {
    if (typeof error === 'string') {
      return error
    }

    if (error?.message) {
      const message = error.message.toLowerCase()
      
      if (message.includes('user rejected')) {
        return 'Transaction was rejected by user'
      }
      if (message.includes('insufficient funds')) {
        return 'Insufficient funds for transaction'
      }
      if (message.includes('gas required exceeds allowance')) {
        return 'Gas limit too low, try increasing gas limit'
      }
      if (message.includes('nonce too low')) {
        return 'Transaction nonce too low, try again'
      }
      if (message.includes('network error')) {
        return 'Network error, please check your connection'
      }
      if (message.includes('timeout')) {
        return 'Transaction timeout, please try again'
      }
      
      return error.message
    }

    return 'Unknown transaction error'
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: any): boolean {
    if (typeof error === 'string') {
      return error.includes('timeout') || error.includes('network error')
    }

    if (error?.message) {
      const message = error.message.toLowerCase()
      return message.includes('timeout') || 
             message.includes('network error') ||
             message.includes('nonce too low')
    }

    return false
  }

  /**
   * Get retry delay in milliseconds
   */
  static getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30 seconds
  }
}

// Transaction utilities
export class TransactionUtils {
  /**
   * Format transaction value for display
   */
  static formatValue(value: string, decimals: number = 18): string {
    try {
      return ethers.formatUnits(value, decimals)
    } catch {
      return value
    }
  }

  /**
   * Format gas price for display
   */
  static formatGasPrice(gasPrice: string): string {
    try {
      const gwei = ethers.formatUnits(gasPrice, 'gwei')
      return `${gwei} Gwei`
    } catch {
      return gasPrice
    }
  }

  /**
   * Calculate transaction cost
   */
  static calculateCost(gasUsed: string, gasPrice: string): string {
    try {
      const cost = BigInt(gasUsed) * BigInt(gasPrice)
      return ethers.formatEther(cost.toString())
    } catch {
      return '0'
    }
  }

  /**
   * Get transaction status color
   */
  static getStatusColor(state: TransactionState): string {
    switch (state) {
      case TransactionState.PENDING:
        return 'yellow'
      case TransactionState.CONFIRMED:
        return 'green'
      case TransactionState.FAILED:
        return 'red'
      case TransactionState.CANCELLED:
        return 'gray'
      default:
        return 'gray'
    }
  }

  /**
   * Get transaction status text
   */
  static getStatusText(state: TransactionState): string {
    switch (state) {
      case TransactionState.PENDING:
        return 'Pending'
      case TransactionState.CONFIRMED:
        return 'Confirmed'
      case TransactionState.FAILED:
        return 'Failed'
      case TransactionState.CANCELLED:
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }
}
