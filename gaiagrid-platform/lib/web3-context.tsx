"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { ethers } from 'ethers'
import { supportedChains, networkConfig } from './contracts/config'
import { setupGlobalErrorHandlers, isChromeExtensionError } from './error-handler'

interface TokenBalance {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: string
  usdValue: number
}

interface Web3ContextType {
  // Connection state
  account: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
  
  // Wallet management
  walletType: string | null
  connectWallet: (walletType?: string) => Promise<void>
  disconnectWallet: () => void
  switchChain: (chainId: number) => Promise<void>
  
  // Balance management
  balances: TokenBalance[]
  refreshBalances: () => Promise<void>
  
  // Network info
  currentNetwork: string | null
  isSupportedNetwork: boolean
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<string | null>(null)
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  // Load connection state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedConnection = localStorage.getItem('gaiagrid-wallet-connection')
    if (savedConnection) {
      try {
        const { account, chainId, walletType } = JSON.parse(savedConnection)
        if (account && chainId && walletType) {
          setAccount(account)
          setChainId(chainId)
          setWalletType(walletType)
        }
      } catch (err) {
        console.error('Failed to load saved connection:', err)
        localStorage.removeItem('gaiagrid-wallet-connection')
      }
    }
  }, [])

  const refreshBalances = useCallback(async () => {
    if (!account || !chainId || !provider) return

    try {
      const balancesList: TokenBalance[] = []

      // Check if provider is still connected to the same network
      try {
        const currentChainId = await provider.getNetwork().then(net => Number(net.chainId))
        if (currentChainId !== chainId) {
          console.warn(`Provider network mismatch: expected ${chainId}, got ${currentChainId}`)
          // Update the provider to match the current network
          if (typeof window !== "undefined" && window.ethereum) {
            const newProvider = new ethers.BrowserProvider(window.ethereum)
            setProvider(newProvider)
          }
          return
        }
      } catch (networkErr: any) {
        if (isChromeExtensionError(networkErr)) {
          console.warn('Chrome extension communication error during network check (non-critical):', networkErr.message)
          return
        }
        throw networkErr
      }

      // Get native balance (ETH)
      const nativeBalance = await provider.getBalance(account)
      const nativeConfig = networkConfig[chainId as keyof typeof networkConfig]
      
      if (nativeConfig) {
        balancesList.push({
          address: ethers.ZeroAddress,
          symbol: nativeConfig.nativeCurrency.symbol,
          name: nativeConfig.nativeCurrency.name,
          decimals: nativeConfig.nativeCurrency.decimals,
          balance: nativeBalance.toString(),
          balanceFormatted: ethers.formatEther(nativeBalance),
          usdValue: 0 // Would need price feed integration
        })
      }

      // TODO: Add token balances (GAIA, USDC, etc.)
      // This would require contract instances and token contracts

      setBalances(balancesList)
    } catch (err: any) {
      if (isChromeExtensionError(err)) {
        console.warn('Chrome extension communication error (non-critical):', err.message)
        return
      }
      console.error('Failed to refresh balances:', err)
    }
  }, [account, chainId, provider])

  useEffect(() => {
    // Set up global error handlers for Chrome extension errors
    const cleanupErrorHandlers = setupGlobalErrorHandlers()

    // Check if wallet is already connected
    checkConnection()

    // Listen for account changes with error handling
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
      } catch (err) {
        if (isChromeExtensionError(err)) {
          console.warn("Chrome extension communication error (non-critical):", err)
        } else {
          console.warn("Failed to set up wallet event listeners:", err)
        }
      }
    }

    return () => {
      // Clean up error handlers
      cleanupErrorHandlers()
      
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        } catch (err) {
          if (isChromeExtensionError(err)) {
            console.warn("Chrome extension communication error (non-critical):", err)
          } else {
            console.warn("Failed to remove wallet event listeners:", err)
          }
        }
      }
    }
  }, [])

  // Load balances when account or chainId changes (with debounce)
  useEffect(() => {
    if (account && chainId && provider && refreshBalances) {
      const timeoutId = setTimeout(() => {
        refreshBalances()
      }, 1000) // Wait 1 second after network change
      
      return () => clearTimeout(timeoutId)
    }
  }, [account, chainId, provider, refreshBalances])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          const chainIdNum = Number.parseInt(chainId, 16)
          
          // Check if chain is supported
          const supportedChainIds = [1, 11155111, 137, 42161, 421614] // Mainnet, Sepolia, Polygon, Arbitrum, Arbitrum Sepolia
          if (!supportedChainIds.includes(chainIdNum)) {
            console.warn(`Unsupported network (Chain ID: ${chainIdNum}). Please switch to a supported network.`)
            setError(`Unsupported network (Chain ID: ${chainIdNum}). Please switch to Ethereum, Polygon, or Arbitrum.`)
            return
          }
          
          setChainId(chainIdNum)
          
          // Initialize provider
          const newProvider = new ethers.BrowserProvider(window.ethereum)
          setProvider(newProvider)
          
          // Detect wallet type
          const detectedWalletType = detectWalletType()
          setWalletType(detectedWalletType)
        }
      } catch (err: any) {
        if (isChromeExtensionError(err)) {
          console.warn('Chrome extension communication error (non-critical):', err.message)
          return
        }
        console.error("[v0] Error checking connection:", err)
      }
    }
  }

  const detectWalletType = (): string => {
    if (typeof window === "undefined") return "unknown"
    
    if (window.ethereum?.isMetaMask) return "metamask"
    if (window.ethereum?.isCoinbaseWallet) return "coinbase"
    if (window.ethereum?.isRainbow) return "rainbow"
    if (window.ethereum?.isBraveWallet) return "brave"
    if (window.ethereum?.isTrust) return "trust"
    
    return "unknown"
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
      // Save connection state
      saveConnectionState(accounts[0], chainId, walletType)
    }
  }

  const handleChainChanged = (chainId: string) => {
    try {
      const chainIdNum = Number.parseInt(chainId, 16)
      
      // Check if chain is supported
      const supportedChainIds = [1, 11155111, 137, 42161, 421614] // Mainnet, Sepolia, Polygon, Arbitrum, Arbitrum Sepolia
      if (!supportedChainIds.includes(chainIdNum)) {
        console.warn(`Unsupported network (Chain ID: ${chainIdNum}). Please switch to a supported network.`)
        setError(`Unsupported network (Chain ID: ${chainIdNum}). Please switch to Ethereum, Polygon, or Arbitrum.`)
        return
      }
      
      setChainId(chainIdNum)
      setError(null) // Clear any previous errors
      
      // Update provider for new network
      if (typeof window !== "undefined" && window.ethereum) {
        const newProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(newProvider)
      }
      
      // Save connection state
      saveConnectionState(account, chainIdNum, walletType)
    } catch (err: any) {
      if (isChromeExtensionError(err)) {
        console.warn('Chrome extension communication error during network change (non-critical):', err.message)
        return
      }
      console.error('Error handling chain change:', err)
    }
  }

  const saveConnectionState = (account: string | null, chainId: number | null, walletType: string | null) => {
    if (typeof window === 'undefined') return
    
    if (account && chainId && walletType) {
      // Ensure we only save primitive values to avoid circular references
      const connectionData = {
        account: String(account),
        chainId: Number(chainId),
        walletType: String(walletType)
      }
      
      try {
        localStorage.setItem('gaiagrid-wallet-connection', JSON.stringify(connectionData))
      } catch (error) {
        console.error('Failed to save connection state:', error)
      }
    } else {
      localStorage.removeItem('gaiagrid-wallet-connection')
    }
  }

  const clearConnectionState = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('gaiagrid-wallet-connection')
  }

  const connectWallet = async (walletType?: string) => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask or another Web3 wallet")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      setAccount(accounts[0])

      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const chainIdNum = Number.parseInt(chainId, 16)
      
      // Check if chain is supported
      const supportedChainIds = [1, 11155111, 137, 42161, 421614] // Mainnet, Sepolia, Polygon, Arbitrum, Arbitrum Sepolia
      if (!supportedChainIds.includes(chainIdNum)) {
        setError(`Unsupported network (Chain ID: ${chainIdNum}). Please switch to Ethereum, Polygon, or Arbitrum.`)
        setIsConnecting(false)
        return
      }
      
      setChainId(chainIdNum)

      // Initialize provider
      const newProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(newProvider)

      // Detect or set wallet type
      const detectedWalletType = walletType || detectWalletType()
      setWalletType(detectedWalletType)

      // Save connection state
      saveConnectionState(accounts[0], chainIdNum, detectedWalletType)
    } catch (err: any) {
      if (isChromeExtensionError(err)) {
        console.warn('Chrome extension communication error (non-critical):', err.message)
        setError("Please try connecting your wallet again")
      } else {
        setError(err.message || "Failed to connect wallet")
      }
      console.error("[v0] Error connecting wallet:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setChainId(null)
    setWalletType(null)
    setBalances([])
    setProvider(null)
    setError(null)
    clearConnectionState()
  }

  const switchChain = async (targetChainId: number) => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask or another Web3 wallet")
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      
      // Update chainId and save state
      setChainId(targetChainId)
      saveConnectionState(account, targetChainId, walletType)
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        setError("Please add this network to your wallet")
      } else {
        setError(err.message || "Failed to switch network")
      }
      console.error("[v0] Error switching chain:", err)
    }
  }

  const currentNetwork = chainId ? networkConfig[chainId as keyof typeof networkConfig]?.name || 'Unknown' : null
  const isSupportedNetwork = chainId ? supportedChains.some(chain => chain.id === chainId) : false

  return (
    <Web3Context.Provider
      value={{
        // Connection state
        account,
        chainId,
        isConnecting,
        error,
        
        // Wallet management
        walletType,
        connectWallet,
        disconnectWallet,
        switchChain,
        
        // Balance management
        balances,
        refreshBalances,
        
        // Network info
        currentNetwork,
        isSupportedNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
