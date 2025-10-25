import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3-context'
import { getContractAddress } from '../addresses'
import { TransactionManager, TransactionType } from '../transactions'

// Mock ABI for NodeManager
const NodeManagerABI = [
  "function registerNode(string name, string location, uint256 capacity) external",
  "function updateNodeStatus(address nodeAddress, bool isActive) external",
  "function rateNode(address nodeAddress, uint256 rating) external",
  "function updateNodeInfo(string name, string location, uint256 capacity) external",
  "function getNode(address nodeAddress) view returns (tuple(address owner, string name, string location, uint256 capacity, bool isActive, uint256 rating, uint256 totalEarnings, uint256 createdAt, uint256 lastUpdated))",
  "function getAllNodeAddresses() view returns (address[])",
  "function getActiveNodeAddresses() view returns (address[])",
  "function getNodesByOwner(address owner) view returns (address[])",
  "function getStats() view returns (uint256, uint256, uint256)",
  "event NodeRegistered(address indexed nodeAddress, address indexed owner, string name, uint256 capacity)",
  "event NodeStatusUpdated(address indexed nodeAddress, bool isActive)",
  "event NodeRated(address indexed nodeAddress, uint256 rating, address indexed rater)",
  "event NodeUpdated(address indexed nodeAddress, string name, string location, uint256 capacity)"
]

interface Node {
  owner: string
  name: string
  location: string
  capacity: string
  isActive: boolean
  rating: number
  totalEarnings: string
  createdAt: number
  lastUpdated: number
}

interface NodeStats {
  totalNodes: number
  activeNodes: number
  totalCapacity: string
}

export function useNodeManager() {
  const { account, chainId } = useWeb3()
  const [nodes, setNodes] = useState<Node[]>([])
  const [activeNodes, setActiveNodes] = useState<Node[]>([])
  const [userNodes, setUserNodes] = useState<Node[]>([])
  const [stats, setStats] = useState<NodeStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract instance
  const getContract = useCallback(() => {
    if (!chainId) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contractAddress = getContractAddress(chainId, 'NodeManager')
      
      // Check if contract is deployed (not zero address)
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('NodeManager contract not deployed on this network')
        return null
      }
      
      return new ethers.Contract(contractAddress, NodeManagerABI, provider)
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
      const contractAddress = getContractAddress(chainId, 'NodeManager')
      
      // Check if contract is deployed (not zero address)
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('NodeManager contract not deployed on this network')
        return null
      }
      
      return new ethers.Contract(contractAddress, NodeManagerABI, signer)
    } catch (err) {
      console.error('Failed to get contract with signer:', err)
      return null
    }
  }, [account, chainId])

  // Load all nodes
  const loadAllNodes = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)

      const nodeAddresses = await contract.getAllNodeAddresses()
      const nodePromises = nodeAddresses.map(async (address: string) => {
        const nodeData = await contract.getNode(address)
        return {
          owner: nodeData.owner,
          name: nodeData.name,
          location: nodeData.location,
          capacity: nodeData.capacity.toString(),
          isActive: nodeData.isActive,
          rating: Number(nodeData.rating),
          totalEarnings: nodeData.totalEarnings.toString(),
          createdAt: Number(nodeData.createdAt),
          lastUpdated: Number(nodeData.lastUpdated)
        }
      })

      const allNodes = await Promise.all(nodePromises)
      setNodes(allNodes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nodes')
    } finally {
      setIsLoading(false)
    }
  }, [getContract])

  // Load active nodes
  const loadActiveNodes = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)

      const activeNodeAddresses = await contract.getActiveNodeAddresses()
      const nodePromises = activeNodeAddresses.map(async (address: string) => {
        const nodeData = await contract.getNode(address)
        return {
          owner: nodeData.owner,
          name: nodeData.name,
          location: nodeData.location,
          capacity: nodeData.capacity.toString(),
          isActive: nodeData.isActive,
          rating: Number(nodeData.rating),
          totalEarnings: nodeData.totalEarnings.toString(),
          createdAt: Number(nodeData.createdAt),
          lastUpdated: Number(nodeData.lastUpdated)
        }
      })

      const activeNodesList = await Promise.all(nodePromises)
      setActiveNodes(activeNodesList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active nodes')
    } finally {
      setIsLoading(false)
    }
  }, [getContract])

  // Load user nodes
  const loadUserNodes = useCallback(async () => {
    const contract = getContract()
    if (!contract || !account) return

    try {
      setIsLoading(true)
      setError(null)

      const userNodeAddresses = await contract.getNodesByOwner(account)
      const nodePromises = userNodeAddresses.map(async (address: string) => {
        const nodeData = await contract.getNode(address)
        return {
          owner: nodeData.owner,
          name: nodeData.name,
          location: nodeData.location,
          capacity: nodeData.capacity.toString(),
          isActive: nodeData.isActive,
          rating: Number(nodeData.rating),
          totalEarnings: nodeData.totalEarnings.toString(),
          createdAt: Number(nodeData.createdAt),
          lastUpdated: Number(nodeData.lastUpdated)
        }
      })

      const userNodesList = await Promise.all(nodePromises)
      setUserNodes(userNodesList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user nodes')
    } finally {
      setIsLoading(false)
    }
  }, [getContract, account])

  // Load stats
  const loadStats = useCallback(async () => {
    const contract = getContract()
    if (!contract) {
      // Set mock stats when contract is not available (demo mode)
      setStats({
        totalNodes: 12,
        activeNodes: 8,
        totalCapacity: '2500000000000000000000' // 2500 kW
      })
      return
    }

    try {
      const [totalNodes, activeNodes, totalCapacity] = await contract.getStats()
      setStats({
        totalNodes: Number(totalNodes),
        activeNodes: Number(activeNodes),
        totalCapacity: totalCapacity.toString()
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
      // Set default stats on error
      setStats({
        totalNodes: 0,
        activeNodes: 0,
        totalCapacity: '0'
      })
    }
  }, [getContract])

  // Register a new node
  const registerNode = useCallback(async (
    name: string,
    location: string,
    capacity: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const capacityWei = ethers.parseUnits(capacity, 0) // Capacity in watts
      const tx = await contract.registerNode(name, location, capacityWei)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.NODE_REGISTRATION,
        account,
        account,
        '0',
        { nodeName: name, location, capacity }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Node registration failed')
    }
  }, [getContractWithSigner, account])

  // Update node status
  const updateNodeStatus = useCallback(async (
    nodeAddress: string,
    isActive: boolean,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const tx = await contract.updateNodeStatus(nodeAddress, isActive)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.CONTRACT_INTERACTION,
        account,
        nodeAddress,
        '0',
        { action: 'updateNodeStatus', isActive }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Node status update failed')
    }
  }, [getContractWithSigner, account])

  // Rate a node
  const rateNode = useCallback(async (
    nodeAddress: string,
    rating: number,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const tx = await contract.rateNode(nodeAddress, rating)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.CONTRACT_INTERACTION,
        account,
        nodeAddress,
        '0',
        { action: 'rateNode', rating }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Node rating failed')
    }
  }, [getContractWithSigner, account])

  // Update node info
  const updateNodeInfo = useCallback(async (
    name: string,
    location: string,
    capacity: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const capacityWei = ethers.parseUnits(capacity, 0) // Capacity in watts
      const tx = await contract.updateNodeInfo(name, location, capacityWei)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.CONTRACT_INTERACTION,
        account,
        account,
        '0',
        { action: 'updateNodeInfo', name, location, capacity }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Node info update failed')
    }
  }, [getContractWithSigner, account])

  // Get specific node
  const getNode = useCallback(async (nodeAddress: string) => {
    const contract = getContract()
    if (!contract) return null

    try {
      const nodeData = await contract.getNode(nodeAddress)
      return {
        owner: nodeData.owner,
        name: nodeData.name,
        location: nodeData.location,
        capacity: nodeData.capacity.toString(),
        isActive: nodeData.isActive,
        rating: Number(nodeData.rating),
        totalEarnings: nodeData.totalEarnings.toString(),
        createdAt: Number(nodeData.createdAt),
        lastUpdated: Number(nodeData.lastUpdated)
      }
    } catch (err) {
      console.error('Failed to get node:', err)
      return null
    }
  }, [getContract])

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadAllNodes()
    loadActiveNodes()
    loadStats()
  }, [loadAllNodes, loadActiveNodes, loadStats])

  useEffect(() => {
    if (account) {
      loadUserNodes()
    }
  }, [account, loadUserNodes])

  return {
    // Data
    nodes,
    activeNodes,
    userNodes,
    stats,
    isLoading,
    error,
    
    // Actions
    loadAllNodes,
    loadActiveNodes,
    loadUserNodes,
    loadStats,
    registerNode,
    updateNodeStatus,
    rateNode,
    updateNodeInfo,
    getNode,
    
    // Utils
    getContract,
    getContractWithSigner
  }
}
