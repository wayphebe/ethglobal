import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3-context'
import { getContractAddress } from '../addresses'
import { TransactionManager, TransactionType } from '../transactions'

// Mock ABI for RWAEnergyNFT
const RWAEnergyNFTABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getAssetsByOwner(address owner) view returns (uint256[])",
  "function getVerifiedAssets() view returns (uint256[])",
  "function getAssetsByType(uint8 assetType) view returns (uint256[])",
  "function getStats() view returns (uint256, uint256, uint256, uint256)",
  "function getAsset(uint256 tokenId) view returns (tuple(string name, uint8 assetType, uint256 capacity, string location, uint256 installationDate, uint256 efficiency, uint256 currentValue, uint8 verificationStatus, uint256 verificationExpiry, address verifier, string metadataURI, uint256 createdAt))",
  "event EnergyAssetMinted(uint256 indexed tokenId, address indexed owner, string name, uint8 assetType, uint256 capacity)",
  "event AssetVerified(uint256 indexed tokenId, address indexed verifier, uint8 status)",
  "event AssetUpdated(uint256 indexed tokenId, string name, uint256 capacity, uint256 efficiency, uint256 currentValue)"
]

// Asset types enum (matching contract)
enum EnergyAssetType {
  SOLAR_PANEL = 0,
  WIND_TURBINE = 1,
  GEOTHERMAL = 2,
  BATTERY_STORAGE = 3,
  HYDROELECTRIC = 4,
  HYBRID_SYSTEM = 5
}

// Verification status enum (matching contract)
enum VerificationStatus {
  PENDING = 0,
  VERIFIED = 1,
  REJECTED = 2,
  EXPIRED = 3
}

interface EnergyAsset {
  tokenId: string
  name: string
  assetType: EnergyAssetType
  capacity: string
  location: string
  installationDate: number
  efficiency: number
  currentValue: string
  verificationStatus: VerificationStatus
  verificationExpiry: number
  verifier: string
  metadataURI: string
  createdAt: number
  owner: string
}

interface NFTStats {
  totalAssets: number
  verifiedAssets: number
  totalCapacity: string
  totalValue: string
}

export function useRWANFT() {
  const { account, chainId } = useWeb3()
  const [userAssets, setUserAssets] = useState<EnergyAsset[]>([])
  const [verifiedAssets, setVerifiedAssets] = useState<EnergyAsset[]>([])
  const [allAssets, setAllAssets] = useState<EnergyAsset[]>([])
  const [stats, setStats] = useState<NFTStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract instance
  const getContract = useCallback(() => {
    if (!chainId) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contractAddress = getContractAddress(chainId, 'RWAEnergyNFT')
      return new ethers.Contract(contractAddress, RWAEnergyNFTABI, provider)
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
      const contractAddress = getContractAddress(chainId, 'RWAEnergyNFT')
      return new ethers.Contract(contractAddress, RWAEnergyNFTABI, signer)
    } catch (err) {
      console.error('Failed to get contract with signer:', err)
      return null
    }
  }, [account, chainId])

  // Load user assets
  const loadUserAssets = useCallback(async () => {
    const contract = getContract()
    if (!contract || !account) return

    try {
      setIsLoading(true)
      setError(null)

      const tokenIds = await contract.getAssetsByOwner(account)
      const assetPromises = tokenIds.map(async (tokenId: string) => {
        const assetData = await contract.getAsset(tokenId)
        return {
          tokenId: tokenId.toString(),
          name: assetData.name,
          assetType: Number(assetData.assetType) as EnergyAssetType,
          capacity: assetData.capacity.toString(),
          location: assetData.location,
          installationDate: Number(assetData.installationDate),
          efficiency: Number(assetData.efficiency),
          currentValue: assetData.currentValue.toString(),
          verificationStatus: Number(assetData.verificationStatus) as VerificationStatus,
          verificationExpiry: Number(assetData.verificationExpiry),
          verifier: assetData.verifier,
          metadataURI: assetData.metadataURI,
          createdAt: Number(assetData.createdAt),
          owner: account
        }
      })

      const userAssetsList = await Promise.all(assetPromises)
      setUserAssets(userAssetsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user assets')
    } finally {
      setIsLoading(false)
    }
  }, [getContract, account])

  // Load verified assets
  const loadVerifiedAssets = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)

      const tokenIds = await contract.getVerifiedAssets()
      const assetPromises = tokenIds.map(async (tokenId: string) => {
        const assetData = await contract.getAsset(tokenId)
        const owner = await contract.ownerOf(tokenId)
        return {
          tokenId: tokenId.toString(),
          name: assetData.name,
          assetType: Number(assetData.assetType) as EnergyAssetType,
          capacity: assetData.capacity.toString(),
          location: assetData.location,
          installationDate: Number(assetData.installationDate),
          efficiency: Number(assetData.efficiency),
          currentValue: assetData.currentValue.toString(),
          verificationStatus: Number(assetData.verificationStatus) as VerificationStatus,
          verificationExpiry: Number(assetData.verificationExpiry),
          verifier: assetData.verifier,
          metadataURI: assetData.metadataURI,
          createdAt: Number(assetData.createdAt),
          owner
        }
      })

      const verifiedAssetsList = await Promise.all(assetPromises)
      setVerifiedAssets(verifiedAssetsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verified assets')
    } finally {
      setIsLoading(false)
    }
  }, [getContract])

  // Load all assets
  const loadAllAssets = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)

      // Get assets by each type
      const allTokenIds: string[] = []
      for (let i = 0; i <= 5; i++) {
        const tokenIds = await contract.getAssetsByType(i)
        allTokenIds.push(...tokenIds.map((id: string) => id.toString()))
      }

      const assetPromises = allTokenIds.map(async (tokenId: string) => {
        const assetData = await contract.getAsset(tokenId)
        const owner = await contract.ownerOf(tokenId)
        return {
          tokenId,
          name: assetData.name,
          assetType: Number(assetData.assetType) as EnergyAssetType,
          capacity: assetData.capacity.toString(),
          location: assetData.location,
          installationDate: Number(assetData.installationDate),
          efficiency: Number(assetData.efficiency),
          currentValue: assetData.currentValue.toString(),
          verificationStatus: Number(assetData.verificationStatus) as VerificationStatus,
          verificationExpiry: Number(assetData.verificationExpiry),
          verifier: assetData.verifier,
          metadataURI: assetData.metadataURI,
          createdAt: Number(assetData.createdAt),
          owner
        }
      })

      const allAssetsList = await Promise.all(assetPromises)
      setAllAssets(allAssetsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load all assets')
    } finally {
      setIsLoading(false)
    }
  }, [getContract])

  // Load stats
  const loadStats = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      const [totalAssets, verifiedAssets, totalCapacity, totalValue] = await contract.getStats()
      setStats({
        totalAssets: Number(totalAssets),
        verifiedAssets: Number(verifiedAssets),
        totalCapacity: totalCapacity.toString(),
        totalValue: totalValue.toString()
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [getContract])

  // Get specific asset
  const getAsset = useCallback(async (tokenId: string) => {
    const contract = getContract()
    if (!contract) return null

    try {
      const assetData = await contract.getAsset(tokenId)
      const owner = await contract.ownerOf(tokenId)
      return {
        tokenId,
        name: assetData.name,
        assetType: Number(assetData.assetType) as EnergyAssetType,
        capacity: assetData.capacity.toString(),
        location: assetData.location,
        installationDate: Number(assetData.installationDate),
        efficiency: Number(assetData.efficiency),
        currentValue: assetData.currentValue.toString(),
        verificationStatus: Number(assetData.verificationStatus) as VerificationStatus,
        verificationExpiry: Number(assetData.verificationExpiry),
        verifier: assetData.verifier,
        metadataURI: assetData.metadataURI,
        createdAt: Number(assetData.createdAt),
        owner
      }
    } catch (err) {
      console.error('Failed to get asset:', err)
      return null
    }
  }, [getContract])

  // Get asset metadata from URI
  const getAssetMetadata = useCallback(async (metadataURI: string) => {
    try {
      const response = await fetch(metadataURI)
      if (!response.ok) throw new Error('Failed to fetch metadata')
      return await response.json()
    } catch (err) {
      console.error('Failed to get asset metadata:', err)
      return null
    }
  }, [])

  // Format asset type for display
  const formatAssetType = useCallback((assetType: EnergyAssetType) => {
    switch (assetType) {
      case EnergyAssetType.SOLAR_PANEL:
        return 'Solar Panel'
      case EnergyAssetType.WIND_TURBINE:
        return 'Wind Turbine'
      case EnergyAssetType.GEOTHERMAL:
        return 'Geothermal'
      case EnergyAssetType.BATTERY_STORAGE:
        return 'Battery Storage'
      case EnergyAssetType.HYDROELECTRIC:
        return 'Hydroelectric'
      case EnergyAssetType.HYBRID_SYSTEM:
        return 'Hybrid System'
      default:
        return 'Unknown'
    }
  }, [])

  // Format verification status for display
  const formatVerificationStatus = useCallback((status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return 'Pending'
      case VerificationStatus.VERIFIED:
        return 'Verified'
      case VerificationStatus.REJECTED:
        return 'Rejected'
      case VerificationStatus.EXPIRED:
        return 'Expired'
      default:
        return 'Unknown'
    }
  }, [])

  // Format capacity for display
  const formatCapacity = useCallback((capacity: string) => {
    try {
      const watts = parseFloat(capacity)
      if (watts >= 1000000) {
        return `${(watts / 1000000).toFixed(2)} MW`
      } else if (watts >= 1000) {
        return `${(watts / 1000).toFixed(2)} kW`
      } else {
        return `${watts.toFixed(2)} W`
      }
    } catch {
      return capacity
    }
  }, [])

  // Format value for display
  const formatValue = useCallback((value: string) => {
    try {
      return ethers.formatEther(value)
    } catch {
      return value
    }
  }, [])

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadVerifiedAssets()
    loadAllAssets()
    loadStats()
  }, [loadVerifiedAssets, loadAllAssets, loadStats])

  useEffect(() => {
    if (account) {
      loadUserAssets()
    }
  }, [account, loadUserAssets])

  return {
    // Data
    userAssets,
    verifiedAssets,
    allAssets,
    stats,
    isLoading,
    error,
    
    // Actions
    loadUserAssets,
    loadVerifiedAssets,
    loadAllAssets,
    loadStats,
    getAsset,
    getAssetMetadata,
    
    // Utils
    formatAssetType,
    formatVerificationStatus,
    formatCapacity,
    formatValue,
    getContract,
    getContractWithSigner,
    
    // Enums
    EnergyAssetType,
    VerificationStatus
  }
}
