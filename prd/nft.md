基于你的需求，我来为GaiaGrid项目梳理RWA NFT系统的详细需求文档。

# GaiaGrid RWA NFT系统需求文档

## 📋 项目背景

GaiaGrid RWA (Real World Assets) NFT系统是将物理能源资产代币化的核心模块，实现：
- 能源资产数字化表示
- 所有权和收益权分离
- 资产流动性提升
- 去中心化资产管理

---

## 🎯 4. RWA NFT系统需求

### 4.1 NFT铸造和管理

#### 4.1.1 能源资产NFT铸造界面
**目标：** 提供用户友好的NFT铸造体验，支持多种能源资产类型

**功能需求：**
- [ ] **资产类型支持**
  - 太阳能板阵列
  - 风力发电机组
  - 地热发电设备
  - 储能电池系统
  - 混合能源系统
  - 能源基础设施

- [ ] **铸造流程**
  - 资产信息录入
  - 资产验证和认证
  - 元数据生成
  - NFT铸造确认
  - 铸造状态跟踪

- [ ] **用户界面**
  - 分步式铸造向导
  - 实时进度指示
  - 错误提示和帮助
  - 预览和确认界面

- [ ] **批量铸造**
  - 多资产批量铸造
  - 模板化铸造
  - 批量状态管理
  - 进度跟踪

**技术实现：**
```typescript
// 能源资产类型定义
enum EnergyAssetType {
  SOLAR_PANEL = 'solar_panel',
  WIND_TURBINE = 'wind_turbine',
  GEOTHERMAL = 'geothermal',
  BATTERY_STORAGE = 'battery_storage',
  HYDROELECTRIC = 'hydroelectric',
  HYBRID_SYSTEM = 'hybrid_system'
}

// 资产信息模型
interface EnergyAsset {
  id: string
  name: string
  type: EnergyAssetType
  capacity: number // kW
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    region: string
    country: string
  }
  specifications: {
    manufacturer: string
    model: string
    serialNumber: string
    installationDate: number
    warrantyExpiry: number
    efficiency: number
  }
  ownership: {
    owner: string
    coOwners?: string[]
    ownershipPercentage: number
  }
  financial: {
    purchasePrice: number
    currency: string
    depreciationRate: number
    currentValue: number
  }
  performance: {
    totalGeneration: number // kWh
    averageEfficiency: number
    uptime: number
    lastMaintenance: number
  }
}

// NFT铸造请求
interface NFTMintingRequest {
  assetId: string
  asset: EnergyAsset
  metadata: NFTMetadata
  ownership: OwnershipStructure
  revenueSharing: RevenueSharingConfig
  mintingFee: number
  gasEstimate: number
}

// 铸造界面组件
class NFTMintingInterface {
  createAssetForm(): AssetFormComponent
  validateAssetData(asset: EnergyAsset): ValidationResult
  generateMetadata(asset: EnergyAsset): NFTMetadata
  estimateMintingCost(asset: EnergyAsset): CostEstimate
  executeMinting(request: NFTMintingRequest): Promise<MintingResult>
}
```

#### 4.1.2 NFT元数据管理
**目标：** 提供完整的NFT元数据生命周期管理

**功能需求：**
- [ ] **元数据结构**
  - 标准元数据字段
  - 自定义属性支持
  - 版本控制机制
  - 元数据验证

- [ ] **元数据存储**
  - IPFS分布式存储
  - 本地缓存机制
  - 元数据备份
  - 存储优化

- [ ] **元数据更新**
  - 实时数据同步
  - 批量更新支持
  - 版本历史记录
  - 更新权限控制

- [ ] **元数据查询**
  - 快速检索功能
  - 复杂查询支持
  - 元数据统计
  - 导出功能

**技术实现：**
```typescript
// NFT元数据模型
interface NFTMetadata {
  name: string
  description: string
  image: string
  animation_url?: string
  external_url?: string
  attributes: NFTAttribute[]
  properties: {
    assetType: EnergyAssetType
    capacity: number
    location: string
    installationDate: number
    efficiency: number
    currentValue: number
    revenue: number
    carbonOffset: number
  }
  version: string
  lastUpdated: number
  ipfsHash: string
}

// NFT属性定义
interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date'
  max_value?: number
}

// 元数据管理器
class MetadataManager {
  createMetadata(asset: EnergyAsset): Promise<NFTMetadata>
  updateMetadata(tokenId: string, updates: Partial<NFTMetadata>): Promise<void>
  getMetadata(tokenId: string): Promise<NFTMetadata>
  searchMetadata(query: MetadataQuery): Promise<NFTMetadata[]>
  uploadToIPFS(metadata: NFTMetadata): Promise<string>
  pinToIPFS(hash: string): Promise<void>
}

// 元数据查询器
class MetadataQuery {
  assetType?: EnergyAssetType
  minCapacity?: number
  maxCapacity?: number
  location?: string
  minEfficiency?: number
  minValue?: number
  maxValue?: number
  owner?: string
  sortBy?: 'capacity' | 'efficiency' | 'value' | 'revenue'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
```

#### 4.1.3 资产验证和认证
**目标：** 确保NFT代表的资产真实存在且符合标准

**功能需求：**
- [ ] **物理验证**
  - 设备存在性验证
  - 技术规格验证
  - 安装位置验证
  - 运行状态验证

- [ ] **认证流程**
  - 第三方认证机构
  - 技术专家审核
  - 现场检查报告
  - 认证证书颁发

- [ ] **持续监控**
  - 设备状态监控
  - 性能数据验证
  - 维护记录跟踪
  - 合规性检查

- [ ] **验证标准**
  - 国际能源标准
  - 环保认证标准
  - 安全认证标准
  - 质量认证标准

**技术实现：**
```typescript
// 验证状态
enum VerificationStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired'
}

// 验证记录
interface VerificationRecord {
  id: string
  assetId: string
  tokenId: string
  status: VerificationStatus
  verifier: string
  verificationType: 'initial' | 'renewal' | 'spot_check'
  documents: VerificationDocument[]
  findings: VerificationFinding[]
  score: number
  validUntil: number
  createdAt: number
  updatedAt: number
}

// 验证文档
interface VerificationDocument {
  id: string
  type: 'certificate' | 'inspection_report' | 'technical_spec' | 'photo' | 'video'
  title: string
  url: string
  hash: string
  uploadedBy: string
  uploadedAt: number
  verified: boolean
}

// 验证发现
interface VerificationFinding {
  category: 'safety' | 'performance' | 'compliance' | 'maintenance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
  status: 'open' | 'in_progress' | 'resolved'
}

// 资产验证器
class AssetVerifier {
  initiateVerification(
    assetId: string,
    verificationType: string
  ): Promise<VerificationRecord>
  
  submitDocument(
    verificationId: string,
    document: VerificationDocument
  ): Promise<void>
  
  reviewVerification(
    verificationId: string,
    findings: VerificationFinding[]
  ): Promise<void>
  
  approveVerification(
    verificationId: string,
    score: number
  ): Promise<void>
  
  rejectVerification(
    verificationId: string,
    reason: string
  ): Promise<void>
}

// 认证机构管理
class CertificationAuthority {
  registerVerifier(verifier: VerifierProfile): Promise<void>
  validateVerifier(verifierId: string): Promise<boolean>
  getVerifierCredentials(verifierId: string): Promise<VerifierCredentials>
  updateVerifierStatus(verifierId: string, status: string): Promise<void>
}
```

#### 4.1.4 NFT交易市场
**目标：** 提供去中心化的NFT交易平台

**功能需求：**
- [ ] **交易功能**
  - 固定价格销售
  - 拍卖机制
  - 报价系统
  - 批量交易

- [ ] **市场功能**
  - 商品展示
  - 搜索和筛选
  - 价格比较
  - 交易历史

- [ ] **交易管理**
  - 订单管理
  - 交易执行
  - 支付处理
  - 所有权转移

- [ ] **市场分析**
  - 价格趋势
  - 交易统计
  - 市场报告
  - 预测分析

**技术实现：**
```typescript
// 交易类型
enum TradeType {
  FIXED_PRICE = 'fixed_price',
  AUCTION = 'auction',
  OFFER = 'offer',
  BUNDLE = 'bundle'
}

// 交易订单
interface TradeOrder {
  id: string
  tokenId: string
  seller: string
  buyer?: string
  type: TradeType
  price: number
  currency: string
  status: 'active' | 'sold' | 'cancelled' | 'expired'
  createdAt: number
  expiresAt?: number
  metadata: {
    description?: string
    images?: string[]
    attributes?: NFTAttribute[]
  }
}

// 拍卖订单
interface AuctionOrder extends TradeOrder {
  type: 'auction'
  startingPrice: number
  reservePrice?: number
  currentBid?: number
  bidIncrement: number
  endTime: number
  bids: Bid[]
}

// 出价记录
interface Bid {
  id: string
  bidder: string
  amount: number
  timestamp: number
  status: 'active' | 'outbid' | 'winning' | 'won'
}

// 交易市场
class NFTMarketplace {
  createOrder(
    tokenId: string,
    orderType: TradeType,
    price: number,
    currency: string,
    duration?: number
  ): Promise<TradeOrder>
  
  placeBid(
    auctionId: string,
    amount: number,
    bidder: string
  ): Promise<Bid>
  
  buyNow(
    orderId: string,
    buyer: string
  ): Promise<TradeResult>
  
  cancelOrder(orderId: string): Promise<void>
  
  getOrders(filters: OrderFilters): Promise<TradeOrder[]>
  getOrderById(orderId: string): Promise<TradeOrder | null>
  getAuctionBids(auctionId: string): Promise<Bid[]>
}

// 订单筛选器
interface OrderFilters {
  tokenId?: string
  seller?: string
  buyer?: string
  type?: TradeType
  minPrice?: number
  maxPrice?: number
  currency?: string
  status?: string
  sortBy?: 'price' | 'created_at' | 'expires_at'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// 市场分析器
class MarketAnalyzer {
  getPriceHistory(tokenId: string, period: string): Promise<PricePoint[]>
  getMarketStats(filters: MarketFilters): Promise<MarketStats>
  getTrendingAssets(limit: number): Promise<TrendingAsset[]>
  getPricePrediction(tokenId: string): Promise<PricePrediction>
}

// 价格数据点
interface PricePoint {
  timestamp: number
  price: number
  volume: number
  marketCap: number
}

// 市场统计
interface MarketStats {
  totalVolume: number
  totalTrades: number
  averagePrice: number
  priceChange24h: number
  volumeChange24h: number
  activeListings: number
  floorPrice: number
}
```

---

## 🛠️ 技术架构设计

### 1. 系统架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   物理资产层     │    │   NFT铸造层      │    │   交易市场层     │
│                 │    │                 │    │                 │
│ • 太阳能板      │───▶│ • 元数据生成    │───▶│ • 订单管理      │
│ • 风力发电机    │    │ • 资产验证      │    │ • 拍卖系统      │
│ • 储能设备      │    │ • NFT铸造      │    │ • 交易执行      │
│ • 基础设施      │    │ • 所有权管理    │    │ • 支付处理      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   存储层        │    │   用户界面层     │
                       │                 │    │                 │
                       │ • IPFS存储     │    │ • 铸造界面      │
                       │ • 区块链存储    │    │ • 市场界面      │
                       │ • 本地缓存      │    │ • 资产管理      │
                       │ • 备份系统      │    │ • 交易界面      │
                       └─────────────────┘    └─────────────────┘
```

### 2. 智能合约架构
```solidity
// RWA NFT合约
contract RWAEnergyNFT is ERC721, Ownable {
    struct EnergyAsset {
        string name;
        EnergyAssetType assetType;
        uint256 capacity;
        string location;
        uint256 installationDate;
        uint256 efficiency;
        uint256 currentValue;
        bool isVerified;
        uint256 verificationExpiry;
    }
    
    mapping(uint256 => EnergyAsset) public assets;
    mapping(address => uint256[]) public ownerAssets;
    
    function mintAsset(
        address to,
        EnergyAsset memory asset,
        string memory tokenURI
    ) external onlyOwner returns (uint256);
    
    function updateAsset(
        uint256 tokenId,
        EnergyAsset memory asset
    ) external onlyOwner;
    
    function verifyAsset(
        uint256 tokenId,
        bool verified,
        uint256 expiry
    ) external onlyVerifier;
}

// 交易市场合约
contract NFTMarketplace {
    struct Order {
        uint256 tokenId;
        address seller;
        uint256 price;
        address currency;
        bool isActive;
        uint256 expiresAt;
    }
    
    mapping(uint256 => Order) public orders;
    mapping(uint256 => Bid[]) public auctionBids;
    
    function createOrder(
        uint256 tokenId,
        uint256 price,
        address currency,
        uint256 duration
    ) external;
    
    function buyOrder(uint256 orderId) external payable;
    
    function placeBid(uint256 auctionId, uint256 amount) external;
    
    function endAuction(uint256 auctionId) external;
}
```

### 3. 数据流设计
```typescript
// NFT生命周期管理
class NFTLifecycleManager {
  // 铸造流程
  async mintNFT(asset: EnergyAsset): Promise<NFTMintingResult> {
    // 1. 验证资产数据
    const validation = await this.validateAsset(asset)
    if (!validation.valid) throw new Error(validation.error)
    
    // 2. 生成元数据
    const metadata = await this.generateMetadata(asset)
    
    // 3. 上传到IPFS
    const ipfsHash = await this.uploadToIPFS(metadata)
    
    // 4. 铸造NFT
    const tokenId = await this.mintToken(asset.owner, ipfsHash)
    
    // 5. 更新数据库
    await this.updateAssetRecord(asset.id, tokenId)
    
    return { tokenId, ipfsHash, metadata }
  }
  
  // 交易流程
  async executeTrade(orderId: string, buyer: string): Promise<TradeResult> {
    // 1. 验证订单
    const order = await this.getOrder(orderId)
    if (!order || !order.isActive) throw new Error('Invalid order')
    
    // 2. 验证支付
    const payment = await this.verifyPayment(buyer, order.price)
    if (!payment.valid) throw new Error('Payment failed')
    
    // 3. 转移所有权
    await this.transferOwnership(order.tokenId, order.seller, buyer)
    
    // 4. 更新订单状态
    await this.updateOrderStatus(orderId, 'completed')
    
    // 5. 记录交易
    await this.recordTrade(orderId, buyer, order.price)
    
    return { success: true, transactionHash: payment.hash }
  }
}
```

---

## 📊 验收标准

### 4.1 NFT铸造和管理
- [ ] 铸造成功率 > 99%
- [ ] 元数据准确性 > 99%
- [ ] 验证通过率 > 95%
- [ ] 铸造时间 < 5分钟

### 4.2 NFT交易市场
- [ ] 交易成功率 > 99%
- [ ] 交易确认时间 < 30秒
- [ ] 市场响应时间 < 2秒
- [ ] 用户满意度 > 90%

---

## 🚀 开发计划

### Phase 1 (3周)
- [ ] NFT铸造界面
- [ ] 元数据管理系统
- [ ] 基础验证流程

### Phase 2 (3周)
- [ ] 资产验证和认证
- [ ] 交易市场基础功能
- [ ] 智能合约部署

### Phase 3 (2周)
- [ ] 高级交易功能
- [ ] 市场分析工具
- [ ] 性能优化和测试

这个需求文档为GaiaGrid的RWA NFT系统提供了完整的技术规范和实现路径，确保系统能够提供安全、高效、用户友好的NFT铸造和交易体验。