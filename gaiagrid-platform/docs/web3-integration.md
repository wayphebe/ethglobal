# GaiaGrid Web3 Integration Documentation

## Overview

This document provides technical details about the Web3 integration in the GaiaGrid MVP, including smart contracts, frontend integration, and deployment instructions.

## Architecture

### Frontend Architecture
```
lib/
├── web3-context.tsx          # Enhanced Web3 context with multi-wallet support
├── contracts/
│   ├── config.ts            # Network and contract configurations
│   ├── addresses.ts         # Contract addresses and ABI imports
│   ├── transactions.ts      # Transaction management and gas estimation
│   ├── events.ts            # Event listening and history management
│   └── hooks/
│       ├── useGAIAToken.ts      # GAIA token interactions
│       ├── useNodeManager.ts    # Energy node management
│       ├── useEnergyTrading.ts  # Energy trading marketplace
│       ├── useRWANFT.ts         # RWA NFT management
│       └── useGovernance.ts     # DAO governance system
```

### Smart Contract Architecture
```
contracts/
├── GAIAToken.sol            # ERC-20 governance token
├── NodeManager.sol          # Energy node registration and management
├── EnergyTrading.sol        # P2P energy trading marketplace
├── RWAEnergyNFT.sol         # ERC-721 for energy asset NFTs
└── SimpleGovernance.sol     # DAO governance system
```

## Smart Contracts

### 1. GAIAToken.sol
**Purpose**: ERC-20 governance token for the GaiaGrid ecosystem

**Key Features**:
- Standard ERC-20 implementation with mint/burn functionality
- Owner-controlled minting with reason tracking
- Pausable transfers for emergency situations
- Maximum supply cap (1 billion tokens)
- Minting history tracking per address

**Functions**:
- `mint(address to, uint256 amount, string reason)`: Mint new tokens
- `burn(uint256 amount, string reason)`: Burn tokens from caller
- `burnFrom(address from, uint256 amount, string reason)`: Burn tokens from specific address
- `getMintedTokens(address account)`: Get total minted tokens for an account
- `getRemainingMintable()`: Get remaining mintable tokens

### 2. NodeManager.sol
**Purpose**: Manage energy nodes in the GaiaGrid network

**Key Features**:
- Node registration with capacity and location data
- Status management (active/inactive)
- Rating system (1-5 scale)
- Earnings tracking
- Owner and admin controls

**Functions**:
- `registerNode(string name, string location, uint256 capacity)`: Register new node
- `updateNodeStatus(address nodeAddress, bool isActive)`: Update node status
- `rateNode(address nodeAddress, uint256 rating)`: Rate a node
- `updateNodeInfo(string name, string location, uint256 capacity)`: Update node info
- `getNode(address nodeAddress)`: Get node information
- `getStats()`: Get network statistics

### 3. EnergyTrading.sol
**Purpose**: Handle P2P energy trading between producers and consumers

**Key Features**:
- Energy listing creation with pricing
- Purchase mechanism with escrow
- Multi-token payment support (ETH + ERC-20)
- Platform fee system
- Order management and cancellation

**Functions**:
- `createListing(address nodeAddress, uint256 energyAmount, uint256 pricePerKWh, address paymentToken, uint256 expiresIn)`: Create energy listing
- `purchaseEnergy(uint256 listingId)`: Purchase energy from listing
- `cancelListing(uint256 listingId)`: Cancel active listing
- `getActiveListings()`: Get all active listings
- `getUserListings(address user)`: Get user's listings
- `getStats()`: Get trading statistics

### 4. RWAEnergyNFT.sol
**Purpose**: ERC-721 NFTs representing real-world energy assets

**Key Features**:
- Energy asset types (Solar, Wind, Geothermal, etc.)
- Verification system with authorized verifiers
- Asset metadata with IPFS integration
- Ownership and transfer management
- Asset statistics and filtering

**Functions**:
- `mintEnergyAsset(address to, string name, uint8 assetType, uint256 capacity, string location, uint256 installationDate, uint256 efficiency, uint256 currentValue, string metadataURI)`: Mint new asset NFT
- `verifyAsset(uint256 tokenId, uint8 status, uint256 expiryDays)`: Verify asset
- `updateAsset(uint256 tokenId, string name, uint256 capacity, uint256 efficiency, uint256 currentValue)`: Update asset info
- `getAsset(uint256 tokenId)`: Get asset information
- `getAssetsByOwner(address owner)`: Get assets by owner
- `getVerifiedAssets()`: Get all verified assets

### 5. SimpleGovernance.sol
**Purpose**: DAO governance system for community decision making

**Key Features**:
- Proposal creation with execution parameters
- Token-weighted voting (1 token = 1 vote)
- Proposal states and lifecycle management
- Quorum and execution requirements
- Parameter updates

**Functions**:
- `propose(string title, string description, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas)`: Create proposal
- `castVote(uint256 proposalId, uint8 support)`: Cast vote
- `execute(uint256 proposalId)`: Execute successful proposal
- `cancel(uint256 proposalId)`: Cancel proposal
- `getProposal(uint256 proposalId)`: Get proposal details
- `getProposalState(uint256 proposalId)`: Get proposal state

## Frontend Integration

### Web3 Context Enhancement
The enhanced Web3 context provides:
- Multi-wallet support (MetaMask, Coinbase, Rainbow, etc.)
- Balance tracking for ETH and tokens
- Connection state persistence
- Network switching with validation
- Error handling and user feedback

### Contract Hooks
Each contract has a dedicated React hook that provides:
- Type-safe contract interactions
- Loading states and error handling
- Real-time data updates
- Transaction management
- Event listening

### Transaction Management
The transaction manager handles:
- Transaction status tracking
- Gas estimation and optimization
- Error parsing and user-friendly messages
- Transaction history
- Retry mechanisms

### Event System
The event system provides:
- Real-time event listening
- Event history queries
- Event data parsing
- Subscription management

## Network Configuration

### Supported Networks
- **Ethereum Sepolia** (Testnet)
- **Polygon Mumbai** (Testnet)
- **Arbitrum Sepolia** (Testnet)

### Network Settings
Each network includes:
- RPC URL configuration
- Block explorer URLs
- Native currency settings
- Contract addresses
- Gas settings

## Deployment Instructions

### 1. Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible wallet
- Testnet ETH for gas fees

### 2. Installation
```bash
cd gaiagrid-platform
npm install
```

### 3. Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_INFURA_KEY=your_infura_key
```

### 4. Smart Contract Deployment
```bash
# Install Hardhat
npm install --save-dev hardhat

# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Update Contract Addresses
Update `lib/contracts/addresses.ts` with deployed contract addresses.

### 6. Run Development Server
```bash
npm run dev
```

## Security Considerations

### Smart Contract Security
- Access controls on sensitive functions
- Input validation and sanitization
- Reentrancy protection
- Gas limit considerations
- Upgrade patterns for future improvements

### Frontend Security
- Input validation on all user inputs
- Secure wallet connection handling
- Error message sanitization
- Rate limiting on API calls
- HTTPS enforcement

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Smart Contract Tests
```bash
npx hardhat test
```

## Monitoring and Analytics

### Blockchain Events
- Contract event monitoring
- Transaction success/failure tracking
- Gas usage analytics
- User interaction patterns

### Performance Metrics
- Page load times
- Transaction confirmation times
- Error rates
- User engagement metrics

## Troubleshooting

### Common Issues
1. **Wallet Connection Failed**
   - Check MetaMask installation
   - Verify network connection
   - Clear browser cache

2. **Transaction Failed**
   - Check gas fees
   - Verify wallet balance
   - Check network congestion

3. **Contract Not Found**
   - Verify contract addresses
   - Check network configuration
   - Ensure contracts are deployed

### Debug Mode
Enable debug logging:
```javascript
localStorage.setItem('debug', 'gaiagrid:*')
```

## Future Enhancements

### Planned Features
- Mobile wallet support (WalletConnect v2)
- Cross-chain asset transfers
- Advanced trading algorithms
- IoT device integration
- Real-time energy data feeds

### Technical Improvements
- Gas optimization
- Contract upgrade mechanisms
- Advanced error handling
- Performance optimizations
- Security audits

## Support

For technical support or questions:
- GitHub Issues: [Repository URL]
- Documentation: [Documentation URL]
- Community Discord: [Discord URL]

## License

This project is licensed under the MIT License - see the LICENSE file for details.
