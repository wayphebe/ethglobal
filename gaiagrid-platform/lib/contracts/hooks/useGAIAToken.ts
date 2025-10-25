import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3-context'
import { getContractAddress } from '../addresses'
import { TransactionManager, TransactionType } from '../transactions'

// Mock ABI for GAIAToken (in real implementation, this would be imported from the compiled contract)
const GAIATokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount, string reason) external",
  "function burn(uint256 amount, string reason) external",
  "function getMintedTokens(address account) view returns (uint256)",
  "function getRemainingMintable() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount, string reason)",
  "event TokensBurned(address indexed from, uint256 amount, string reason)"
]

interface TokenBalance {
  balance: string
  balanceFormatted: string
  mintedTokens: string
  remainingMintable: string
}

interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  totalSupplyFormatted: string
}

export function useGAIAToken() {
  const { account, chainId } = useWeb3()
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [balance, setBalance] = useState<TokenBalance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract instance
  const getContract = useCallback(() => {
    if (!account || !chainId) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contractAddress = getContractAddress(chainId, 'GAIAToken')
      
      // Check if contract is deployed (not zero address)
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('GAIAToken contract not deployed on this network')
        return null
      }
      
      return new ethers.Contract(contractAddress, GAIATokenABI, provider)
    } catch (err) {
      console.error('Failed to get contract:', err)
      return null
    }
  }, [account, chainId])

  // Get contract instance for transactions
  const getContractWithSigner = useCallback(() => {
    if (!account || !chainId) return null

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = provider.getSigner()
      const contractAddress = getContractAddress(chainId, 'GAIAToken')
      
      // Check if contract is deployed (not zero address)
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('GAIAToken contract not deployed on this network')
        return null
      }
      
      return new ethers.Contract(contractAddress, GAIATokenABI, signer)
    } catch (err) {
      console.error('Failed to get contract with signer:', err)
      return null
    }
  }, [account, chainId])

  // Load token information
  const loadTokenInfo = useCallback(async () => {
    const contract = getContract()
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ])

      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
        totalSupplyFormatted: ethers.formatUnits(totalSupply, decimals)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load token info')
    } finally {
      setIsLoading(false)
    }
  }, [getContract])

  // Load user balance
  const loadBalance = useCallback(async () => {
    const contract = getContract()
    if (!contract || !account) return

    try {
      setIsLoading(true)
      setError(null)

      const [balance, mintedTokens, remainingMintable] = await Promise.all([
        contract.balanceOf(account),
        contract.getMintedTokens(account),
        contract.getRemainingMintable()
      ])

      const decimals = tokenInfo?.decimals || 18

      setBalance({
        balance: balance.toString(),
        balanceFormatted: ethers.formatUnits(balance, decimals),
        mintedTokens: mintedTokens.toString(),
        remainingMintable: remainingMintable.toString()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance')
    } finally {
      setIsLoading(false)
    }
  }, [getContract, account, tokenInfo?.decimals])

  // Transfer tokens
  const transfer = useCallback(async (
    to: string,
    amount: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const amountWei = ethers.parseUnits(amount, tokenInfo?.decimals || 18)
      const tx = await contract.transfer(to, amountWei)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.TOKEN_TRANSFER,
        account,
        to,
        amountWei.toString(),
        { tokenSymbol: 'GAIA' }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Transfer failed')
    }
  }, [getContractWithSigner, account, tokenInfo?.decimals])

  // Approve tokens
  const approve = useCallback(async (
    spender: string,
    amount: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const amountWei = ethers.parseUnits(amount, tokenInfo?.decimals || 18)
      const tx = await contract.approve(spender, amountWei)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.CONTRACT_INTERACTION,
        account,
        spender,
        '0',
        { tokenSymbol: 'GAIA', action: 'approve' }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Approve failed')
    }
  }, [getContractWithSigner, account, tokenInfo?.decimals])

  // Mint tokens (only owner)
  const mint = useCallback(async (
    to: string,
    amount: string,
    reason: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const amountWei = ethers.parseUnits(amount, tokenInfo?.decimals || 18)
      const tx = await contract.mint(to, amountWei, reason)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.CONTRACT_INTERACTION,
        account,
        to,
        amountWei.toString(),
        { tokenSymbol: 'GAIA', action: 'mint', reason }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Mint failed')
    }
  }, [getContractWithSigner, account, tokenInfo?.decimals])

  // Burn tokens
  const burn = useCallback(async (
    amount: string,
    reason: string,
    transactionManager: TransactionManager
  ) => {
    const contract = getContractWithSigner()
    if (!contract || !account) throw new Error('Contract not available')

    try {
      const amountWei = ethers.parseUnits(amount, tokenInfo?.decimals || 18)
      const tx = await contract.burn(amountWei, reason)
      
      const transaction = transactionManager.addTransaction(
        tx.hash,
        TransactionType.CONTRACT_INTERACTION,
        account,
        account,
        amountWei.toString(),
        { tokenSymbol: 'GAIA', action: 'burn', reason }
      )

      return transaction
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Burn failed')
    }
  }, [getContractWithSigner, account, tokenInfo?.decimals])

  // Get allowance
  const getAllowance = useCallback(async (spender: string) => {
    const contract = getContract()
    if (!contract || !account) return '0'

    try {
      const allowance = await contract.allowance(account, spender)
      return ethers.formatUnits(allowance, tokenInfo?.decimals || 18)
    } catch (err) {
      console.error('Failed to get allowance:', err)
      return '0'
    }
  }, [getContract, account, tokenInfo?.decimals])

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadTokenInfo()
  }, [loadTokenInfo])

  useEffect(() => {
    if (account && tokenInfo) {
      loadBalance()
    }
  }, [account, tokenInfo, loadBalance])

  return {
    // Data
    tokenInfo,
    balance,
    isLoading,
    error,
    
    // Actions
    loadTokenInfo,
    loadBalance,
    transfer,
    approve,
    mint,
    burn,
    getAllowance,
    
    // Utils
    getContract,
    getContractWithSigner
  }
}
