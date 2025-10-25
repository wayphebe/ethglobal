import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3-context'
import { getContractAddress } from '../addresses'
import { TransactionManager, TransactionType } from '../transactions'

// Mock ABI for SimpleGovernance
const SimpleGovernanceABI = [
  "function propose(string title, string description, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas) external",
  "function castVote(uint256 proposalId, uint8 support) external",
  "function execute(uint256 proposalId) external",
  "function cancel(uint256 proposalId) external",
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string title, string description, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool executed, bool cancelled, uint256 createdAt))",
  "function getProposalState(uint256 proposalId) view returns (uint8)",
  "function getVote(uint256 proposalId, address voter) view returns (tuple(bool hasVoted, uint8 support, uint256 votes))",
  "function getStats() view returns (uint256, uint256, uint256, uint256)",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 startBlock, uint256 endBlock)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 votes)",
  "event ProposalExecuted(uint256 indexed proposalId)",
  "event ProposalCancelled(uint256 indexed proposalId)"
]

// Vote types enum (matching contract)
export enum VoteType {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2
}

// Proposal states enum (matching contract)
export enum ProposalState {
  PENDING = 0,
  ACTIVE = 1,
  SUCCEEDED = 2,
  DEFEATED = 3,
  EXECUTED = 4,
  CANCELLED = 5
}

export interface Proposal {
  id: string
  proposer: string
  title: string
  description: string
  targets: string[]
  values: string[]
  signatures: string[]
  calldatas: string[]
  startBlock: number
  endBlock: number
  forVotes: string
  againstVotes: string
  abstainVotes: string
  executed: boolean
  cancelled: boolean
  createdAt: number
  state: ProposalState
}

interface Vote {
  hasVoted: boolean
  support: VoteType
  votes: string
}

interface GovernanceStats {
  totalProposals: number
  activeProposals: number
  executedProposals: number
  totalVotingPower: string
}

export function useGovernance() {
  const { account, chainId } = useWeb3()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [activeProposals, setActiveProposals] = useState<Proposal[]>([])
  const [userVotes, setUserVotes] = useState<Map<string, Vote>>(new Map())
  const [stats, setStats] = useState<GovernanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract instance
  const getContract = useCallback(() => {
    if (!chainId) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contractAddress = getContractAddress(chainId, 'SimpleGovernance')
      
      // Check if contract is deployed (not zero address)
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('SimpleGovernance contract not deployed on this network')
        return null
      }
      
      return new ethers.Contract(contractAddress, SimpleGovernanceABI, provider)
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
      const contractAddress = getContractAddress(chainId, 'SimpleGovernance')
      
      // Check if contract is deployed (not zero address)
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('SimpleGovernance contract not deployed on this network')
        return null
      }
      
      return new ethers.Contract(contractAddress, SimpleGovernanceABI, signer)
    } catch (err) {
      console.error('Failed to get contract with signer:', err)
      return null
    }
  }, [account, chainId])

  // Load all proposals
  const loadProposals = useCallback(async () => {
    const contract = getContract()
    
    // If contract is not available (demo mode), use mock data
    if (!contract) {
      console.log('Demo mode: Loading mock proposals')
      setIsLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProposals: Proposal[] = [
        {
          id: '0',
          proposer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          title: 'Increase Solar Energy Incentive Program',
          description: 'Proposal to increase the GAIA token rewards for solar energy production by 25% to encourage more renewable energy adoption.',
          targets: ['0x0000000000000000000000000000000000000000'],
          values: ['0'],
          signatures: [''],
          calldatas: ['0x'],
          startBlock: 18000000,
          endBlock: 18000000 + 17280, // 3 days
          forVotes: '15000000000000000000000', // 15 GAIA
          againstVotes: '2000000000000000000000', // 2 GAIA
          abstainVotes: '1000000000000000000000', // 1 GAIA
          executed: false,
          cancelled: false,
          createdAt: Date.now() - 86400000, // 1 day ago
          state: ProposalState.ACTIVE
        },
        {
          id: '1',
          proposer: '0x8ba1f109551bD432803012645Hac136c',
          title: 'Implement Carbon Credit Trading',
          description: 'Add a carbon credit trading system where users can trade verified carbon offsets as NFTs on the platform.',
          targets: ['0x0000000000000000000000000000000000000000'],
          values: ['0'],
          signatures: [''],
          calldatas: ['0x'],
          startBlock: 18000000 - 17280,
          endBlock: 18000000,
          forVotes: '25000000000000000000000', // 25 GAIA
          againstVotes: '5000000000000000000000', // 5 GAIA
          abstainVotes: '2000000000000000000000', // 2 GAIA
          executed: true,
          cancelled: false,
          createdAt: Date.now() - 172800000, // 2 days ago
          state: ProposalState.EXECUTED
        },
        {
          id: '2',
          proposer: '0x1234567890123456789012345678901234567890',
          title: 'Reduce Wind Energy Requirements',
          description: 'Proposal to lower the minimum wind energy capacity requirements for node registration from 1kW to 500W.',
          targets: ['0x0000000000000000000000000000000000000000'],
          values: ['0'],
          signatures: [''],
          calldatas: ['0x'],
          startBlock: 18000000 - 34560,
          endBlock: 18000000 - 17280,
          forVotes: '8000000000000000000000', // 8 GAIA
          againstVotes: '12000000000000000000000', // 12 GAIA
          abstainVotes: '3000000000000000000000', // 3 GAIA
          executed: false,
          cancelled: false,
          createdAt: Date.now() - 259200000, // 3 days ago
          state: ProposalState.DEFEATED
        }
      ]
      
      setProposals(mockProposals)
      setActiveProposals(mockProposals.filter(p => p.state === ProposalState.ACTIVE))
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const stats = await contract.getStats()
      const totalProposals = Number(stats[0])
      const proposalsList: Proposal[] = []

      for (let i = 0; i < totalProposals; i++) {
        try {
          const proposalData = await contract.getProposal(i)
          const state = await contract.getProposalState(i)
          
          const proposal: Proposal = {
            id: i.toString(),
            proposer: proposalData.proposer,
            title: proposalData.title,
            description: proposalData.description,
            targets: proposalData.targets,
            values: proposalData.values.map((v: any) => v.toString()),
            signatures: proposalData.signatures,
            calldatas: proposalData.calldatas,
            startBlock: Number(proposalData.startBlock),
            endBlock: Number(proposalData.endBlock),
            forVotes: proposalData.forVotes.toString(),
            againstVotes: proposalData.againstVotes.toString(),
            abstainVotes: proposalData.abstainVotes.toString(),
            executed: proposalData.executed,
            cancelled: proposalData.cancelled,
            createdAt: Number(proposalData.createdAt),
            state: Number(state) as ProposalState
          }

          proposalsList.push(proposal)
        } catch (err) {
          console.error(`Failed to load proposal ${i}:`, err)
        }
      }

      setProposals(proposalsList)
      setActiveProposals(proposalsList.filter(p => p.state === ProposalState.ACTIVE))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposals')
    } finally {
      setIsLoading(false)
    }
  }, [getContract])

  // Load user votes
  const loadUserVotes = useCallback(async () => {
    const contract = getContract()
    if (!contract || !account) return

    try {
      const votesMap = new Map<string, Vote>()
      
      for (const proposal of proposals) {
        try {
          const voteData = await contract.getVote(proposal.id, account)
          votesMap.set(proposal.id, {
            hasVoted: voteData.hasVoted,
            support: Number(voteData.support) as VoteType,
            votes: voteData.votes.toString()
          })
        } catch (err) {
          console.error(`Failed to load vote for proposal ${proposal.id}:`, err)
        }
      }

      setUserVotes(votesMap)
    } catch (err) {
      console.error('Failed to load user votes:', err)
    }
  }, [getContract, account, proposals])

  // Load stats
  const loadStats = useCallback(async () => {
    const contract = getContract()
    if (!contract) {
      // Set mock stats when contract is not available (demo mode)
      setStats({
        totalProposals: 3,
        activeProposals: 1,
        executedProposals: 1,
        totalVotingPower: '5000000000000000000000000' // 50 GAIA (50 * 10^18 wei)
      })
      return
    }

    try {
      const [totalProposals, activeProposals, executedProposals, totalVotingPower] = await contract.getStats()
      setStats({
        totalProposals: Number(totalProposals),
        activeProposals: Number(activeProposals),
        executedProposals: Number(executedProposals),
        totalVotingPower: totalVotingPower.toString()
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
      // Set default stats on error
      setStats({
        totalProposals: 0,
        activeProposals: 0,
        executedProposals: 0,
        totalVotingPower: '0'
      })
    }
  }, [getContract])

  // Create proposal
  const createProposal = useCallback(async (
    title: string,
    description: string,
    targets: string[],
    values: string[],
    signatures: string[],
    calldatas: string[],
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    
    // If contract is not available (demo mode), simulate the transaction
    if (!contract || !account) {
      console.log('Demo mode: Simulating proposal creation')
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
      
      // Generate mock transaction hash
      const mockHash = '0x' + Math.random().toString(16).substr(2, 64)
      
      const transaction = transactionManager.addTransaction(
        mockHash,
        TransactionType.GOVERNANCE_VOTE,
        account || '0x0000000000000000000000000000000000000000',
        account || '0x0000000000000000000000000000000000000000',
        '0',
        { action: 'createProposal', title, targets: targets.length, isSimulated: true }
      )

      return transaction
    }

    try {
      const valuesWei = values.map(v => ethers.parseEther(v))
      const tx = await contract.propose(title, description, targets, valuesWei, signatures, calldatas)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.GOVERNANCE_VOTE,
        account,
        account,
        '0',
        { action: 'createProposal', title, targets: targets.length }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Proposal creation failed')
    }
  }, [getContractWithSigner, account])

  // Cast vote
  const castVote = useCallback(async (
    proposalId: string,
    support: VoteType,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    
    // If contract is not available (demo mode), simulate the transaction
    if (!contract || !account) {
      console.log('Demo mode: Simulating vote casting')
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
      
      // Generate mock transaction hash
      const mockHash = '0x' + Math.random().toString(16).substr(2, 64)
      
      const transaction = transactionManager.addTransaction(
        mockHash,
        TransactionType.GOVERNANCE_VOTE,
        account || '0x0000000000000000000000000000000000000000',
        account || '0x0000000000000000000000000000000000000000',
        '0',
        { action: 'castVote', proposalId, support, isSimulated: true }
      )

      return transaction
    }

    try {
      const tx = await contract.castVote(proposalId, support)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.GOVERNANCE_VOTE,
        account,
        account,
        '0',
        { action: 'castVote', proposalId, support }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Vote casting failed')
    }
  }, [getContractWithSigner, account])

  // Execute proposal
  const executeProposal = useCallback(async (
    proposalId: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    
    // If contract is not available (demo mode), simulate the transaction
    if (!contract || !account) {
      console.log('Demo mode: Simulating proposal execution')
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
      
      // Generate mock transaction hash
      const mockHash = '0x' + Math.random().toString(16).substr(2, 64)
      
      const transaction = transactionManager.addTransaction(
        mockHash,
        TransactionType.GOVERNANCE_VOTE,
        account || '0x0000000000000000000000000000000000000000',
        account || '0x0000000000000000000000000000000000000000',
        '0',
        { action: 'executeProposal', proposalId, isSimulated: true }
      )

      return transaction
    }

    try {
      const tx = await contract.execute(proposalId)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.GOVERNANCE_VOTE,
        account,
        account,
        '0',
        { action: 'executeProposal', proposalId }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Proposal execution failed')
    }
  }, [getContractWithSigner, account])

  // Cancel proposal
  const cancelProposal = useCallback(async (
    proposalId: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    
    // If contract is not available (demo mode), simulate the transaction
    if (!contract || !account) {
      console.log('Demo mode: Simulating proposal cancellation')
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
      
      // Generate mock transaction hash
      const mockHash = '0x' + Math.random().toString(16).substr(2, 64)
      
      const transaction = transactionManager.addTransaction(
        mockHash,
        TransactionType.GOVERNANCE_VOTE,
        account || '0x0000000000000000000000000000000000000000',
        account || '0x0000000000000000000000000000000000000000',
        '0',
        { action: 'cancelProposal', proposalId, isSimulated: true }
      )

      return transaction
    }

    try {
      const tx = await contract.cancel(proposalId)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.GOVERNANCE_VOTE,
        account,
        account,
        '0',
        { action: 'cancelProposal', proposalId }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Proposal cancellation failed')
    }
  }, [getContractWithSigner, account])

  // Get specific proposal
  const getProposal = useCallback(async (proposalId: string) => {
    const contract = getContract()
    if (!contract) return null

    try {
      const proposalData = await contract.getProposal(proposalId)
      const state = await contract.getProposalState(proposalId)
      
      return {
        id: proposalId,
        proposer: proposalData.proposer,
        title: proposalData.title,
        description: proposalData.description,
        targets: proposalData.targets,
        values: proposalData.values.map((v: any) => v.toString()),
        signatures: proposalData.signatures,
        calldatas: proposalData.calldatas,
        startBlock: Number(proposalData.startBlock),
        endBlock: Number(proposalData.endBlock),
        forVotes: proposalData.forVotes.toString(),
        againstVotes: proposalData.againstVotes.toString(),
        abstainVotes: proposalData.abstainVotes.toString(),
        executed: proposalData.executed,
        cancelled: proposalData.cancelled,
        createdAt: Number(proposalData.createdAt),
        state: Number(state) as ProposalState
      }
    } catch (err) {
      console.error('Failed to get proposal:', err)
      return null
    }
  }, [getContract])

  // Get user vote for proposal
  const getUserVote = useCallback(async (proposalId: string) => {
    const contract = getContract()
    if (!contract || !account) return null

    try {
      const voteData = await contract.getVote(proposalId, account)
      return {
        hasVoted: voteData.hasVoted,
        support: Number(voteData.support) as VoteType,
        votes: voteData.votes.toString()
      }
    } catch (err) {
      console.error('Failed to get user vote:', err)
      return null
    }
  }, [getContract, account])

  // Format vote type for display
  const formatVoteType = useCallback((voteType: VoteType) => {
    switch (voteType) {
      case VoteType.AGAINST:
        return 'Against'
      case VoteType.FOR:
        return 'For'
      case VoteType.ABSTAIN:
        return 'Abstain'
      default:
        return 'Unknown'
    }
  }, [])

  // Format proposal state for display
  const formatProposalState = useCallback((state: ProposalState) => {
    switch (state) {
      case ProposalState.PENDING:
        return 'Pending'
      case ProposalState.ACTIVE:
        return 'Active'
      case ProposalState.SUCCEEDED:
        return 'Succeeded'
      case ProposalState.DEFEATED:
        return 'Defeated'
      case ProposalState.EXECUTED:
        return 'Executed'
      case ProposalState.CANCELLED:
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }, [])

  // Calculate voting power percentage
  const calculateVotingPowerPercentage = useCallback((votes: string, totalVotingPower: string) => {
    try {
      const votesNum = parseFloat(votes)
      const totalNum = parseFloat(totalVotingPower)
      if (totalNum === 0) return 0
      return (votesNum / totalNum) * 100
    } catch {
      return 0
    }
  }, [])

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadProposals()
    loadStats()
  }, [loadProposals, loadStats])

  useEffect(() => {
    if (proposals.length > 0) {
      loadUserVotes()
    }
  }, [proposals, loadUserVotes])

  return {
    // Data
    proposals,
    activeProposals,
    userVotes,
    stats,
    isLoading,
    error,
    
    // Actions
    loadProposals,
    loadUserVotes,
    loadStats,
    createProposal,
    castVote,
    executeProposal,
    cancelProposal,
    getProposal,
    getUserVote,
    
    // Utils
    formatVoteType,
    formatProposalState,
    calculateVotingPowerPercentage,
    getContract,
    getContractWithSigner,
    
    // Enums
    VoteType,
    ProposalState
  }
}
