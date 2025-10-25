import { ethers, Contract } from 'ethers'

// Event listener interface
export interface EventListener {
  contract: Contract
  eventName: string
  callback: (event: any) => void
  filter?: any
}

// Event subscription manager
export class EventSubscriptionManager {
  private listeners: Map<string, EventListener> = new Map()
  private subscriptions: Map<string, ethers.ContractEvent> = new Map()

  constructor(private provider: ethers.Provider) {}

  /**
   * Subscribe to a contract event
   */
  subscribe(
    contract: Contract,
    eventName: string,
    callback: (event: any) => void,
    filter?: any
  ): string {
    const subscriptionId = `${contract.address}-${eventName}-${Date.now()}`
    
    const listener: EventListener = {
      contract,
      eventName,
      callback,
      filter
    }

    this.listeners.set(subscriptionId, listener)

    try {
      const subscription = contract.on(eventName, filter, callback)
      this.subscriptions.set(subscriptionId, subscription)
    } catch (error) {
      console.error(`Failed to subscribe to event ${eventName}:`, error)
      this.listeners.delete(subscriptionId)
      throw error
    }

    return subscriptionId
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(subscriptionId: string): void {
    const listener = this.listeners.get(subscriptionId)
    const subscription = this.subscriptions.get(subscriptionId)

    if (listener && subscription) {
      try {
        listener.contract.off(listener.eventName, subscription)
      } catch (error) {
        console.error(`Failed to unsubscribe from event:`, error)
      }
    }

    this.listeners.delete(subscriptionId)
    this.subscriptions.delete(subscriptionId)
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeAll(): void {
    for (const subscriptionId of this.listeners.keys()) {
      this.unsubscribe(subscriptionId)
    }
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Check if subscription exists
   */
  hasSubscription(subscriptionId: string): boolean {
    return this.listeners.has(subscriptionId)
  }
}

// Event history manager
export class EventHistoryManager {
  constructor(private provider: ethers.Provider) {}

  /**
   * Get event history for a contract
   */
  async getEventHistory(
    contract: Contract,
    eventName: string,
    fromBlock: number,
    toBlock: number,
    filter?: any
  ): Promise<any[]> {
    try {
      const filter = contract.filters[eventName](filter)
      const events = await contract.queryFilter(filter, fromBlock, toBlock)
      return events
    } catch (error) {
      console.error(`Failed to get event history for ${eventName}:`, error)
      throw error
    }
  }

  /**
   * Get recent events (last N blocks)
   */
  async getRecentEvents(
    contract: Contract,
    eventName: string,
    blockCount: number = 1000,
    filter?: any
  ): Promise<any[]> {
    try {
      const currentBlock = await this.provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - blockCount)
      return this.getEventHistory(contract, eventName, fromBlock, currentBlock, filter)
    } catch (error) {
      console.error(`Failed to get recent events for ${eventName}:`, error)
      throw error
    }
  }

  /**
   * Get events by address
   */
  async getEventsByAddress(
    contract: Contract,
    eventName: string,
    address: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    try {
      const currentBlock = await this.provider.getBlockNumber()
      const startBlock = fromBlock || Math.max(0, currentBlock - 1000)
      const endBlock = toBlock || currentBlock

      const filter = contract.filters[eventName](address)
      const events = await contract.queryFilter(filter, startBlock, endBlock)
      return events
    } catch (error) {
      console.error(`Failed to get events by address for ${eventName}:`, error)
      throw error
    }
  }
}

// Specific event handlers for GaiaGrid contracts
export class GaiaGridEventHandlers {
  private subscriptionManager: EventSubscriptionManager
  private historyManager: EventHistoryManager

  constructor(provider: ethers.Provider) {
    this.subscriptionManager = new EventSubscriptionManager(provider)
    this.historyManager = new EventHistoryManager(provider)
  }

  /**
   * Subscribe to node registration events
   */
  subscribeToNodeRegistration(
    nodeManagerContract: Contract,
    callback: (event: any) => void
  ): string {
    return this.subscriptionManager.subscribe(
      nodeManagerContract,
      'NodeRegistered',
      callback
    )
  }

  /**
   * Subscribe to energy trading events
   */
  subscribeToEnergyTrading(
    energyTradingContract: Contract,
    callback: (event: any) => void
  ): string {
    return this.subscriptionManager.subscribe(
      energyTradingContract,
      'EnergyPurchased',
      callback
    )
  }

  /**
   * Subscribe to NFT minting events
   */
  subscribeToNFTMinting(
    nftContract: Contract,
    callback: (event: any) => void
  ): string {
    return this.subscriptionManager.subscribe(
      nftContract,
      'EnergyAssetMinted',
      callback
    )
  }

  /**
   * Subscribe to governance events
   */
  subscribeToGovernance(
    governanceContract: Contract,
    callback: (event: any) => void
  ): string {
    return this.subscriptionManager.subscribe(
      governanceContract,
      'ProposalCreated',
      callback
    )
  }

  /**
   * Subscribe to token transfer events
   */
  subscribeToTokenTransfers(
    tokenContract: Contract,
    callback: (event: any) => void,
    fromAddress?: string,
    toAddress?: string
  ): string {
    const filter = {
      from: fromAddress,
      to: toAddress
    }

    return this.subscriptionManager.subscribe(
      tokenContract,
      'Transfer',
      callback,
      filter
    )
  }

  /**
   * Get node registration history
   */
  async getNodeRegistrationHistory(
    nodeManagerContract: Contract,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    const currentBlock = await this.subscriptionManager['provider'].getBlockNumber()
    const startBlock = fromBlock || Math.max(0, currentBlock - 1000)
    const endBlock = toBlock || currentBlock

    return this.historyManager.getEventHistory(
      nodeManagerContract,
      'NodeRegistered',
      startBlock,
      endBlock
    )
  }

  /**
   * Get energy trading history
   */
  async getEnergyTradingHistory(
    energyTradingContract: Contract,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    const currentBlock = await this.subscriptionManager['provider'].getBlockNumber()
    const startBlock = fromBlock || Math.max(0, currentBlock - 1000)
    const endBlock = toBlock || currentBlock

    return this.historyManager.getEventHistory(
      energyTradingContract,
      'EnergyPurchased',
      startBlock,
      endBlock
    )
  }

  /**
   * Get NFT minting history
   */
  async getNFTMintingHistory(
    nftContract: Contract,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    const currentBlock = await this.subscriptionManager['provider'].getBlockNumber()
    const startBlock = fromBlock || Math.max(0, currentBlock - 1000)
    const endBlock = toBlock || currentBlock

    return this.historyManager.getEventHistory(
      nftContract,
      'EnergyAssetMinted',
      startBlock,
      endBlock
    )
  }

  /**
   * Get governance proposal history
   */
  async getGovernanceHistory(
    governanceContract: Contract,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    const currentBlock = await this.subscriptionManager['provider'].getBlockNumber()
    const startBlock = fromBlock || Math.max(0, currentBlock - 1000)
    const endBlock = toBlock || currentBlock

    return this.historyManager.getEventHistory(
      governanceContract,
      'ProposalCreated',
      startBlock,
      endBlock
    )
  }

  /**
   * Get user's token transfer history
   */
  async getUserTokenTransfers(
    tokenContract: Contract,
    userAddress: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    return this.historyManager.getEventsByAddress(
      tokenContract,
      'Transfer',
      userAddress,
      fromBlock,
      toBlock
    )
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeAll(): void {
    this.subscriptionManager.unsubscribeAll()
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return this.subscriptionManager.getActiveSubscriptions()
  }
}

// Event data parsers
export class EventDataParsers {
  /**
   * Parse node registration event
   */
  static parseNodeRegistration(event: any): {
    nodeAddress: string
    owner: string
    name: string
    capacity: string
    blockNumber: number
    transactionHash: string
  } {
    return {
      nodeAddress: event.args.nodeAddress,
      owner: event.args.owner,
      name: event.args.name,
      capacity: event.args.capacity.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    }
  }

  /**
   * Parse energy trading event
   */
  static parseEnergyTrading(event: any): {
    transactionId: string
    listingId: string
    buyer: string
    seller: string
    energyAmount: string
    totalPrice: string
    paymentToken: string
    blockNumber: number
    transactionHash: string
  } {
    return {
      transactionId: event.args.transactionId.toString(),
      listingId: event.args.listingId.toString(),
      buyer: event.args.buyer,
      seller: event.args.seller,
      energyAmount: event.args.energyAmount.toString(),
      totalPrice: event.args.totalPrice.toString(),
      paymentToken: event.args.paymentToken,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    }
  }

  /**
   * Parse NFT minting event
   */
  static parseNFTMinting(event: any): {
    tokenId: string
    owner: string
    name: string
    assetType: string
    capacity: string
    blockNumber: number
    transactionHash: string
  } {
    return {
      tokenId: event.args.tokenId.toString(),
      owner: event.args.owner,
      name: event.args.name,
      assetType: event.args.assetType.toString(),
      capacity: event.args.capacity.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    }
  }

  /**
   * Parse governance proposal event
   */
  static parseGovernanceProposal(event: any): {
    proposalId: string
    proposer: string
    title: string
    startBlock: string
    endBlock: string
    blockNumber: number
    transactionHash: string
  } {
    return {
      proposalId: event.args.proposalId.toString(),
      proposer: event.args.proposer,
      title: event.args.title,
      startBlock: event.args.startBlock.toString(),
      endBlock: event.args.endBlock.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    }
  }

  /**
   * Parse token transfer event
   */
  static parseTokenTransfer(event: any): {
    from: string
    to: string
    value: string
    blockNumber: number
    transactionHash: string
  } {
    return {
      from: event.args.from,
      to: event.args.to,
      value: event.args.value.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    }
  }
}
