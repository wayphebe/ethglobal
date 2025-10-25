import { contractAddresses } from './config'

// Helper function to get contract address for current chain
export function getContractAddress(chainId: number, contractName: keyof typeof contractAddresses[1]) {
  const addresses = contractAddresses[chainId as keyof typeof contractAddresses]
  if (!addresses) {
    console.warn(`Unsupported chain ID: ${chainId}. Please switch to a supported network.`)
    return '0x0000000000000000000000000000000000000000' // Return zero address for unsupported chains
  }
  
  const address = addresses[contractName]
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    console.warn(`Contract ${contractName} not deployed on chain ${chainId}`)
    return '0x0000000000000000000000000000000000000000' // Return zero address for undeployed contracts
  }
  
  return address
}

// Helper function to check if contract is deployed
export function isContractDeployed(chainId: number, contractName: keyof typeof contractAddresses[1]): boolean {
  try {
    const address = getContractAddress(chainId, contractName)
    return address !== '0x0000000000000000000000000000000000000000'
  } catch {
    return false
  }
}

// Contract ABI definitions (simplified for MVP)
export const GAIATokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
] as const

export const NodeManagerABI = [
  "function registerNode(string memory _name, string memory _location, uint256 _capacity)",
  "function updateNodeStatus(bool _isActive)",
  "function getNode(address _nodeAddress) view returns (tuple(address owner, string name, string location, uint256 capacity, bool isActive, uint256 registeredAt))",
  "function getAllNodeAddresses() view returns (address[])",
  "event NodeRegistered(address indexed owner, string name, string location, uint256 capacity)",
  "event NodeStatusUpdated(address indexed owner, bool isActive)"
] as const

export const EnergyTradingABI = [
  "function createAndPurchaseEnergy(address _seller, uint256 _energyAmount, uint256 _pricePerWh)",
  "function getOrder(uint256 _orderId) view returns (tuple(uint256 id, address seller, address buyer, uint256 energyAmount, uint256 pricePerWh, uint256 totalPrice, uint256 createdAt, bool isCompleted))",
  "function nextOrderId() view returns (uint256)",
  "event EnergyPurchased(uint256 indexed orderId, address indexed seller, address indexed buyer, uint256 energyAmount, uint256 totalPrice)"
] as const

export const RWAEnergyNFTABI = [
  "function mintAsset(address to, string memory _name, uint8 _assetType, uint256 _capacity, string memory _location, uint256 _installationDate, uint256 _efficiency, uint256 _currentValue, string memory _tokenURI) returns (uint256)",
  "function updateAsset(uint256 _tokenId, string memory _name, uint256 _capacity, string memory _location, uint256 _efficiency, uint256 _currentValue)",
  "function setVerificationStatus(uint256 _tokenId, uint256 _status)",
  "function getAsset(uint256 _tokenId) view returns (tuple(string name, uint8 assetType, uint256 capacity, string location, uint256 installationDate, uint256 efficiency, uint256 currentValue, uint256 verificationStatus))",
  "function getAssetsByOwner(address _owner) view returns (uint256[])",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event AssetMinted(uint256 indexed tokenId, address indexed owner, string name, uint8 assetType)",
  "event AssetUpdated(uint256 indexed tokenId, string name, uint256 capacity, uint256 efficiency)",
  "event AssetVerified(uint256 indexed tokenId, uint256 verificationStatus)"
] as const

export const SimpleGovernanceABI = [
  "function createProposal(string memory _description) returns (uint256)",
  "function vote(uint256 _proposalId)",
  "function executeProposal(uint256 _proposalId)",
  "function getProposal(uint256 _proposalId) view returns (tuple(uint256 id, string description, uint256 voteCount, bool executed, bool passed, uint256 deadline))",
  "function nextProposalId() view returns (uint256)",
  "event ProposalCreated(uint256 indexed id, string description, uint256 deadline)",
  "event Voted(uint256 indexed proposalId, address indexed voter, uint256 votes)",
  "event ProposalExecuted(uint256 indexed id, bool passed)"
] as const
