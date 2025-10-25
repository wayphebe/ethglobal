import { mainnet, sepolia, polygon, arbitrum, arbitrumSepolia } from 'viem/chains'

// Project ID from WalletConnect Cloud (you'll need to get this from https://cloud.walletconnect.com)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id'

// Supported networks for the demo
export const supportedChains = [mainnet, sepolia, polygon, arbitrum, arbitrumSepolia] as const

// Network configurations
export const networkConfig = {
  [mainnet.id]: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [sepolia.id]: {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/your-infura-key',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [polygon.id]: {
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [arbitrum.id]: {
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [arbitrumSepolia.id]: {
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const

// AppKit configuration - using createAppKit instead of defineConfig
export const appKitConfig = {
  projectId,
  chains: supportedChains,
  metadata: {
    name: 'GaiaGrid',
    description: 'Decentralized Energy Trading Platform',
    url: 'https://gaiagrid.xyz',
    icons: ['https://gaiagrid.xyz/logo.png'],
  },
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-z-index': '1000',
  },
}

// Contract addresses (will be populated after deployment)
export const contractAddresses = {
  [mainnet.id]: {
    GAIAToken: '0x0000000000000000000000000000000000000000', // Placeholder for mainnet
    NodeManager: '0x0000000000000000000000000000000000000000',
    EnergyTrading: '0x0000000000000000000000000000000000000000',
    RWAEnergyNFT: '0x0000000000000000000000000000000000000000',
    SimpleGovernance: '0x0000000000000000000000000000000000000000',
  },
  [sepolia.id]: {
    GAIAToken: '0x0000000000000000000000000000000000000000', // Will be updated after deployment
    NodeManager: '0x0000000000000000000000000000000000000000',
    EnergyTrading: '0x0000000000000000000000000000000000000000',
    RWAEnergyNFT: '0x0000000000000000000000000000000000000000',
    SimpleGovernance: '0x0000000000000000000000000000000000000000',
  },
  [polygon.id]: {
    GAIAToken: '0x0000000000000000000000000000000000000000',
    NodeManager: '0x0000000000000000000000000000000000000000',
    EnergyTrading: '0x0000000000000000000000000000000000000000',
    RWAEnergyNFT: '0x0000000000000000000000000000000000000000',
    SimpleGovernance: '0x0000000000000000000000000000000000000000',
  },
  [arbitrum.id]: {
    GAIAToken: '0x0000000000000000000000000000000000000000',
    NodeManager: '0x0000000000000000000000000000000000000000',
    EnergyTrading: '0x0000000000000000000000000000000000000000',
    RWAEnergyNFT: '0x0000000000000000000000000000000000000000',
    SimpleGovernance: '0x0000000000000000000000000000000000000000',
  },
  [arbitrumSepolia.id]: {
    GAIAToken: '0x0000000000000000000000000000000000000000',
    NodeManager: '0x0000000000000000000000000000000000000000',
    EnergyTrading: '0x0000000000000000000000000000000000000000',
    RWAEnergyNFT: '0x0000000000000000000000000000000000000000',
    SimpleGovernance: '0x0000000000000000000000000000000000000000',
  },
} as const

// Gas settings
export const gasSettings = {
  maxFeePerGas: '20000000000', // 20 gwei
  maxPriorityFeePerGas: '2000000000', // 2 gwei
  gasLimit: '500000', // 500k gas limit
}

// Token configurations
export const tokenConfig = {
  GAIA: {
    name: 'GaiaGrid Token',
    symbol: 'GAIA',
    decimals: 18,
    totalSupply: '1000000000000000000000', // 1000 GAIA tokens (1000 * 10^18 wei)
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    // USDC addresses on different networks
    addresses: {
      [sepolia.id]: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // Mock USDC on Sepolia
      [polygon.id]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Real USDC on Polygon
      [arbitrumSepolia.id]: '0x0000000000000000000000000000000000000000', // Mock USDC on Arbitrum Sepolia
    },
  },
} as const

// Energy trading settings
export const energyTradingConfig = {
  minEnergyAmount: '1000000000000000000', // 1 kWh in wei
  maxEnergyAmount: '1000000000000000000000', // 1000 kWh in wei
  minPrice: '60000000000000', // 0.00006 ETH per kWh (1 GAIA = 0.00006 ETH)
  maxPrice: '6000000000000000', // 0.006 ETH per kWh (100 GAIA = 0.006 ETH)
  defaultPrice: '600000000000000', // 0.0006 ETH per kWh (10 GAIA = 0.0006 ETH)
} as const

// Node management settings
export const nodeConfig = {
  minCapacity: '1000000000000000000', // 1 kW minimum
  maxCapacity: '1000000000000000000000', // 1000 kW maximum
  minRating: 1,
  maxRating: 5,
  defaultRating: 3,
} as const

// Governance settings
export const governanceConfig = {
  minProposalThreshold: '100000000000000000000', // 100 GAIA tokens (10% of total supply)
  votingPeriod: 3 * 24 * 60 * 60, // 3 days in seconds
  executionDelay: 24 * 60 * 60, // 1 day in seconds
  quorumPercentage: 20, // 20% of total supply
} as const

// Import ABI definitions
import { 
  GAIATokenABI, 
  NodeManagerABI, 
  EnergyTradingABI, 
  RWAEnergyNFTABI, 
  SimpleGovernanceABI 
} from './addresses'

export const contractABIs = {
  GAIAToken: GAIATokenABI,
  NodeManager: NodeManagerABI,
  EnergyTrading: EnergyTradingABI,
  RWAEnergyNFT: RWAEnergyNFTABI,
  SimpleGovernance: SimpleGovernanceABI,
}
