import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3-context'
import { getContractAddress } from '../addresses'
import { TransactionManager, TransactionType } from '../transactions'

// Mock ABI for EnergyTrading
const EnergyTradingABI = [
  "function createListing(address nodeAddress, uint256 energyAmount, uint256 pricePerKWh, address paymentToken, uint256 expiresIn) external",
  "function purchaseEnergy(uint256 listingId) external payable",
  "function cancelListing(uint256 listingId) external",
  "function getActiveListings() view returns (uint256[])",
  "function getUserListings(address user) view returns (uint256[])",
  "function getUserTransactions(address user) view returns (uint256[])",
  "function getStats() view returns (uint256, uint256, uint256, uint256)",
  "event EnergyListed(uint256 indexed listingId, address indexed seller, address indexed nodeAddress, uint256 energyAmount, uint256 pricePerKWh, address paymentToken)",
  "event EnergyPurchased(uint256 indexed transactionId, uint256 indexed listingId, address indexed buyer, address seller, uint256 energyAmount, uint256 totalPrice, address paymentToken)"
]

interface EnergyListing {
  id: string
  seller: string
  nodeAddress: string
  energyAmount: string
  pricePerKWh: string
  paymentToken: string
  isActive: boolean
  createdAt: number
  expiresAt: number
}

interface EnergyTransaction {
  id: string
  buyer: string
  seller: string
  nodeAddress: string
  energyAmount: string
  totalPrice: string
  paymentToken: string
  isCompleted: boolean
  createdAt: number
  completedAt: number
}

interface EnergyStats {
  totalListings: number
  totalTransactions: number
  totalEnergyTraded: string
  totalVolume: string
}

export function useEnergyTrading() {
  const { account, chainId } = useWeb3()
  const [listings, setListings] = useState<EnergyListing[]>([])
  const [userListings, setUserListings] = useState<EnergyListing[]>([])
  const [userTransactions, setUserTransactions] = useState<EnergyTransaction[]>([])
  const [stats, setStats] = useState<EnergyStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract instance
  const getContract = useCallback(() => {
    if (!chainId) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contractAddress = getContractAddress(chainId, 'EnergyTrading')
      return new ethers.Contract(contractAddress, EnergyTradingABI, provider)
    } catch (err) {
      console.error('Failed to get contract:', err)
      return null
    }
  }, [chainId])

  // Get contract instance for transactions
  const getContractWithSigner = useCallback(() => {
    if (!account || !chainId) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = provider.getSigner()
      const contractAddress = getContractAddress(chainId, 'EnergyTrading')
      return new ethers.Contract(contractAddress, EnergyTradingABI, signer)
    } catch (err) {
      console.error('Failed to get contract with signer:', err)
      return null
    }
  }, [account, chainId])

  // Load active listings
  const loadActiveListings = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)

      const listingIds = await contract.getActiveListings()
      const listingPromises = listingIds.map(async (id: string) => {
        // Note: In a real implementation, you'd need to add a function to get listing details
        // For now, we'll create a mock structure
        return {
          id: id.toString(),
          seller: '', // Would need to get from contract
          nodeAddress: '', // Would need to get from contract
          energyAmount: '0', // Would need to get from contract
          pricePerKWh: '0', // Would need to get from contract
          paymentToken: '', // Would need to get from contract
          isActive: true,
          createdAt: Date.now(),
          expiresAt: Date.now() + 86400000 // 24 hours
        }
      })

      const listingsList = await Promise.all(listingPromises)
      setListings(listingsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }, [getContract])

  // Load user listings
  const loadUserListings = useCallback(async () => {
    const contract = getContract()
    if (!contract || !account) return

    try {
      setIsLoading(true)
      setError(null)

      const listingIds = await contract.getUserListings(account)
      const listingPromises = listingIds.map(async (id: string) => {
        // Note: In a real implementation, you'd need to add a function to get listing details
        return {
          id: id.toString(),
          seller: account,
          nodeAddress: '', // Would need to get from contract
          energyAmount: '0', // Would need to get from contract
          pricePerKWh: '0', // Would need to get from contract
          paymentToken: '', // Would need to get from contract
          isActive: true,
          createdAt: Date.now(),
          expiresAt: Date.now() + 86400000
        }
      })

      const userListingsList = await Promise.all(listingPromises)
      setUserListings(userListingsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user listings')
    } finally {
      setIsLoading(false)
    }
  }, [getContract, account])

  // Load user transactions
  const loadUserTransactions = useCallback(async () => {
    const contract = getContract()
    if (!contract || !account) return

    try {
      setIsLoading(true)
      setError(null)

      const transactionIds = await contract.getUserTransactions(account)
      const transactionPromises = transactionIds.map(async (id: string) => {
        // Note: In a real implementation, you'd need to add a function to get transaction details
        return {
          id: id.toString(),
          buyer: account,
          seller: '', // Would need to get from contract
          nodeAddress: '', // Would need to get from contract
          energyAmount: '0', // Would need to get from contract
          totalPrice: '0', // Would need to get from contract
          paymentToken: '', // Would need to get from contract
          isCompleted: true,
          createdAt: Date.now(),
          completedAt: Date.now()
        }
      })

      const userTransactionsList = await Promise.all(transactionPromises)
      setUserTransactions(userTransactionsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user transactions')
    } finally {
      setIsLoading(false)
    }
  }, [getContract, account])

  // Load stats
  const loadStats = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      const [totalListings, totalTransactions, totalEnergyTraded, totalVolume] = await contract.getStats()
      setStats({
        totalListings: Number(totalListings),
        totalTransactions: Number(totalTransactions),
        totalEnergyTraded: totalEnergyTraded.toString(),
        totalVolume: totalVolume.toString()
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [getContract])

  // Create energy listing
  const createListing = useCallback(async (
    nodeAddress: string,
    energyAmount: string,
    pricePerKWh: string,
    paymentToken: string,
    expiresIn: number,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const energyAmountWei = ethers.parseUnits(energyAmount, 18) // Energy in kWh
      const priceWei = ethers.parseUnits(pricePerKWh, 18) // Price per kWh in wei
      const paymentTokenAddress = paymentToken === 'ETH' ? ethers.ZeroAddress : paymentToken

      const tx = await contract.createListing(
        nodeAddress,
        energyAmountWei,
        priceWei,
        paymentTokenAddress,
        expiresIn
      )
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.ENERGY_TRADING,
        account,
        nodeAddress,
        '0',
        { 
          action: 'createListing', 
          energyAmount, 
          pricePerKWh, 
          paymentToken,
          expiresIn 
        }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Listing creation failed')
    }
  }, [getContractWithSigner, account])

  // Purchase energy
  const purchaseEnergy = useCallback(async (
    listingId: string,
    value: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const valueWei = ethers.parseEther(value)
      const tx = await contract.purchaseEnergy(listingId, { value: valueWei })
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.ENERGY_TRADING,
        account,
        account,
        valueWei.toString(),
        { action: 'purchaseEnergy', listingId }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Energy purchase failed')
    }
  }, [getContractWithSigner, account])

  // Cancel listing
  const cancelListing = useCallback(async (
    listingId: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const tx = await contract.cancelListing(listingId)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.ENERGY_TRADING,
        account,
        account,
        '0',
        { action: 'cancelListing', listingId }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Listing cancellation failed')
    }
  }, [getContractWithSigner, account])

  // Calculate total price for energy
  const calculateTotalPrice = useCallback((energyAmount: string, pricePerKWh: string) => {
    try {
      const energy = parseFloat(energyAmount)
      const price = parseFloat(pricePerKWh)
      const total = energy * price
      return total.toString()
    } catch {
      return '0'
    }
  }, [])

  // Format energy amount for display
  const formatEnergyAmount = useCallback((amount: string) => {
    try {
      return ethers.formatUnits(amount, 18)
    } catch {
      return amount
    }
  }, [])

  // Format price for display
  const formatPrice = useCallback((price: string) => {
    try {
      return ethers.formatEther(price)
    } catch {
      return price
    }
  }, [])

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadActiveListings()
    loadStats()
  }, [loadActiveListings, loadStats])

  useEffect(() => {
    if (account) {
      loadUserListings()
      loadUserTransactions()
    }
  }, [account, loadUserListings, loadUserTransactions])

  return {
    // Data
    listings,
    userListings,
    userTransactions,
    stats,
    isLoading,
    error,
    
    // Actions
    loadActiveListings,
    loadUserListings,
    loadUserTransactions,
    loadStats,
    createListing,
    purchaseEnergy,
    cancelListing,
    
    // Utils
    calculateTotalPrice,
    formatEnergyAmount,
    formatPrice,
    getContract,
    getContractWithSigner
  }
}
