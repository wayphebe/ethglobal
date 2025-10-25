You're absolutely right! Let me update the PRD to address these important clarifications. The current implementation is too vague and needs to be more precise about what these values mean to users.
GaiaGrid 数字游民空间预订系统 PRD (修订版)
📋 项目概述
产品名称: GaiaGrid 数字游民空间预订系统
版本: v1.1 (修订版)
创建日期: 2024年12月
目标用户: 数字游民、远程工作者、可持续生活倡导者
重要说明: 当前版本为演示版本，所有交易均为模拟交易，不涉及真实资金转移
产品愿景
为数字游民提供基于区块链的可持续能源空间预订服务，让用户能够预订全球范围内的绿色能源工作空间，并通过Web3技术实现透明的支付和资产管理。
🎯 核心功能需求 (修订版)
1. 空间预订核心流程
1.1 预订流程设计
目标: 提供直观、流畅的空间预订体验
功能需求:
[ ] 空间浏览
展示全球可持续能源节点
实时显示可用性状态
支持地理位置筛选
价格和设施对比
明确标注演示模式: 所有交易均为模拟
[ ] 预订详情页面
空间详细信息展示
设施和能源类型说明
用户评价和评分
实时价格计算 (支持多网络)
法币价格显示 (USD/EUR等)
[ ] 预订配置
入住/退房日期选择
预订时长选择（1-30天）
支付方式选择 (支持多网络代币)
特殊需求备注
网络选择器 (影响价格显示)
[ ] 支付确认
钱包连接状态检查
余额充足性验证
交易费用预估
模拟支付确认流程 (明确标注为演示)
技术实现:
interface BookingRequest {
  nodeId: string
  userId: string
  checkIn: Date
  checkOut: Date
  duration: number // days
  paymentMethod: 'ETH' | 'USDC' | 'GAIA' | 'MATIC' | 'ARB'
  networkId: number // 1=Mainnet, 137=Polygon, 42161=Arbitrum
  totalCost: string
  fiatEquivalent: {
    usd: number
    eur: number
    currency: string
  }
  specialRequests?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  isSimulated: boolean // 明确标注为模拟交易
}

interface EnergyNode {
  id: string
  name: string
  location: string
  // 能源容量说明 - 更精确的定义
  energyCapacity: {
    totalCapacity: number // kW - 总发电容量
    availableCapacity: number // kW - 可用容量
    currentLoad: number // kW - 当前负载
    efficiency: number // % - 能源效率
    description: string // 对用户的说明
  }
  // 多网络价格
  pricing: {
    [networkId: number]: {
      dailyRate: string // 原始代币价格
      fiatEquivalent: {
        usd: number
        eur: number
      }
      currency: string // ETH, MATIC, ARB等
    }
  }
  amenities: string[]
  rating: number
  image: string
  operator: string
}
1.2 能源容量信息优化
目标: 让用户清楚理解能源容量的含义和价值
功能需求:
[ ] 容量信息展示
总发电容量 (Total Generation Capacity): 该节点的最大发电能力
可用容量 (Available Capacity): 当前可供预订使用的容量
当前负载 (Current Load): 正在使用的容量
能源效率 (Energy Efficiency): 发电效率百分比
用户价值说明: 解释为什么这个信息对用户重要
[ ] 用户价值说明
高容量 = 更稳定的电力供应
高效率 = 更环保的能源使用
可用容量 = 确保有足够电力支持用户设备
实时负载 = 了解当前使用情况
技术实现:
interface EnergyCapacityDisplay {
  totalCapacity: {
    value: number
    unit: 'kW'
    label: 'Total Generation Capacity'
    description: 'Maximum power this node can generate'
    userBenefit: 'Ensures reliable power supply for your devices'
  }
  availableCapacity: {
    value: number
    unit: 'kW'
    label: 'Available for Booking'
    description: 'Power capacity available for new bookings'
    userBenefit: 'Guarantees sufficient power for your stay'
  }
  currentLoad: {
    value: number
    unit: 'kW'
    label: 'Currently in Use'
    description: 'Power being used by current occupants'
    userBenefit: 'Shows real-time usage and availability'
  }
  efficiency: {
    value: number
    unit: '%'
    label: 'Energy Efficiency'
    description: 'How efficiently this node converts renewable energy'
    userBenefit: 'Higher efficiency means more sustainable energy'
  }
}
1.3 多网络价格系统
目标: 支持多区块链网络，价格根据网络自动调整
功能需求:
[ ] 网络选择器
支持 Ethereum Mainnet, Polygon, Arbitrum
实时网络切换
网络状态指示
切换确认机制
[ ] 动态价格计算
基于网络代币的实时价格
法币等价物显示 (USD, EUR)
汇率自动更新
价格历史记录
[ ] 价格透明度
显示基础价格和网络费用
总成本计算器
价格比较工具
最佳网络推荐
技术实现:
interface MultiNetworkPricing {
  // 基础价格 (USD)
  basePriceUSD: number
  
  // 各网络价格
  networkPrices: {
    [networkId: number]: {
      networkName: string
      currency: string
      dailyRate: string
      gasEstimate: string
      totalCost: string
      fiatEquivalent: {
        usd: number
        eur: number
      }
      exchangeRate: number
    }
  }
  
  // 价格计算
  calculatePrice(networkId: number, duration: number): PriceBreakdown
  getBestNetwork(): number // 基于Gas费和汇率推荐最佳网络
  updateExchangeRates(): Promise<void>
}

interface PriceBreakdown {
  basePrice: string
  networkFee: string
  totalCost: string
  fiatEquivalent: {
    usd: number
    eur: number
  }
  savings?: string // 相比其他网络的节省
}
2. 演示模式功能
2.1 模拟交易系统
目标: 提供安全的演示环境，不涉及真实资金
功能需求:
[ ] 模拟钱包
虚拟余额显示
模拟交易确认
交易历史记录
余额变化动画
[ ] 模拟智能合约
预订记录模拟
NFT铸造模拟
状态变更模拟
事件触发模拟
[ ] 演示数据
预设的预订场景
模拟的用户评价
虚拟的交易历史
演示用的NFT资产
技术实现:
interface DemoMode {
  isEnabled: boolean
  virtualWallet: {
    address: string
    balances: {
      [token: string]: string
    }
    transactionHistory: Transaction[]
  }
  simulatedContracts: {
    bookingContract: SimulatedContract
    nftContract: SimulatedContract
    governanceContract: SimulatedContract
  }
  demoScenarios: {
    successfulBooking: () => void
    paymentFailure: () => void
    networkSwitch: () => void
    refundProcess: () => void
  }
}

// 模拟交易结果
interface SimulatedTransactionResult {
  success: boolean
  transactionHash: string // 模拟的哈希
  blockNumber: number // 模拟的区块号
  gasUsed: string
  status: 'pending' | 'confirmed' | 'failed'
  message: string
  isSimulated: true // 明确标注为模拟
}
2.2 用户教育功能
目标: 帮助用户理解Web3预订流程
功能需求:
[ ] 流程引导
步骤说明动画
关键概念解释
操作提示
常见问题解答
[ ] 概念解释
什么是能源节点
为什么需要Web3
如何理解能源容量
多网络价格差异
技术实现:
interface UserEducation {
  tooltips: {
    energyCapacity: 'This shows how much renewable energy this space can generate. Higher capacity means more reliable power for your devices.'
    pricing: 'Prices are shown in cryptocurrency. You can switch networks to find the best rate including transaction fees.'
    booking: 'Your booking will be recorded on the blockchain as an NFT, giving you verifiable proof of your sustainable energy usage.'
  }
  
  guidedTour: {
    steps: Array<{
      target: string
      title: string
      content: string
      action?: string
    }>
  }
  
  faq: Array<{
    question: string
    answer: string
    category: 'pricing' | 'energy' | 'booking' | 'web3'
  }>
}
🛠️ 技术架构设计 (修订版)
1. 多网络价格架构
// 价格管理器
class MultiNetworkPriceManager {
  private exchangeRates: Map<string, number> = new Map()
  private networkConfigs: Map<number, NetworkConfig> = new Map()
  
  // 获取实时价格
  async getPrice(nodeId: string, networkId: number, duration: number): Promise<PriceBreakdown> {
    const basePrice = await this.getBasePrice(nodeId)
    const networkConfig = this.networkConfigs.get(networkId)
    const exchangeRate = await this.getExchangeRate(networkConfig.currency, 'USD')
    
    return {
      basePrice: this.calculateTokenPrice(basePrice, exchangeRate),
      networkFee: this.estimateGasFee(networkId),
      totalCost: this.calculateTotalCost(basePrice, networkId, duration),
      fiatEquivalent: {
        usd: basePrice,
        eur: basePrice * (await this.getExchangeRate('USD', 'EUR'))
      },
      savings: this.calculateSavings(networkId, basePrice)
    }
  }
  
  // 推荐最佳网络
  getBestNetwork(nodeId: string, duration: number): number {
    const networks = Array.from(this.networkConfigs.keys())
    const prices = networks.map(networkId => 
      this.getPrice(nodeId, networkId, duration)
    )
    
    return prices.reduce((best, current, index) => 
      current.totalCost < best.totalCost ? current : best
    ).networkId
  }
}
2. 演示模式架构
// 演示模式管理器
class DemoModeManager {
  private isDemoMode: boolean = true
  private virtualState: VirtualState = new VirtualState()
  
  // 模拟交易
  async simulateTransaction(
    type: TransactionType,
    params: any
  ): Promise<SimulatedTransactionResult> {
    if (!this.isDemoMode) {
      throw new Error('Not in demo mode')
    }
    
    // 模拟交易延迟
    await this.delay(2000)
    
    // 生成模拟结果
    return {
      success: Math.random() > 0.1, // 90% 成功率
      transactionHash: this.generateMockHash(),
      blockNumber: this.generateMockBlockNumber(),
      gasUsed: this.estimateGasUsed(type),
      status: 'confirmed',
      message: 'Transaction simulated successfully',
      isSimulated: true
    }
  }
  
  // 更新虚拟状态
  updateVirtualState(transaction: SimulatedTransactionResult): void {
    this.virtualState.applyTransaction(transaction)
  }
}
📊 验收标准 (修订版)
1. 功能验收标准
[ ] 演示模式标识 100% 界面元素明确标注为演示
[ ] 能源容量说明 用户理解率 > 90%
[ ] 多网络价格 价格切换响应时间 < 2秒
[ ] 法币显示 汇率更新延迟 < 30秒
[ ] 模拟交易 成功率 > 95%
2. 用户体验标准
[ ] 概念理解 用户能解释能源容量的含义
[ ] 价格透明度 用户能理解不同网络的价格差异
[ ] 操作流畅性 网络切换无卡顿
[ ] 教育效果 用户完成引导后理解Web3预订流程
3. 技术标准
[ ] 多网络支持 支持3+区块链网络
[ ] 价格准确性 汇率误差 < 1%
[ ] 响应速度 价格计算 < 1秒
[ ] 数据一致性 多网络数据同步 < 5秒
🎯 用户故事验证 (修订版)
基于用户故事中的Luna场景，本PRD确保：
✅ 入住后连接钱包: 自动显示当前空间能源消耗数据，明确标注为演示模式
✅ 查看Dashboard数据: 实时能源使用情况监控，包含能源容量说明
✅ 购买能源NFT: 通过预订获得能源资产权益，支持多网络价格选择
✅ DAO治理投票: 基于预订NFT的治理参与权，模拟交易记录
✅ 查看碳减排记录: 可持续贡献的可视化展示，包含法币等价物
🚀 开发计划 (修订版)
Phase 1: 基础功能 + 演示模式 (2周)
[ ] 预订界面开发
[ ] 演示模式标识
[ ] 能源容量说明优化
[ ] 基础多网络支持
Phase 2: 多网络价格系统 (2周)
[ ] 动态价格计算
[ ] 法币等价物显示
[ ] 网络切换优化
[ ] 汇率服务集成
Phase 3: 用户教育功能 (1周)
[ ] 概念解释工具
[ ] 引导流程设计
[ ] FAQ系统
[ ] 演示场景完善
Phase 4: 测试和优化 (1周)
[ ] 多网络测试
[ ] 用户体验测试
[ ] 性能优化
[ ] 文档完善
这个修订版PRD解决了您提出的所有关键问题，确保用户能够清楚理解能源容量的含义、价格的多网络差异，以及当前系统的演示性质。
------
I'll update the PRD with specific UX/UI design specifications for the cards and forms, with clear energy information display. Let me enhance the document with detailed design guidelines.

```markdown
# GaiaGrid 数字游民空间预订系统 PRD (修订版)

## 📋 项目概述

**产品名称**: GaiaGrid 数字游民空间预订系统  
**版本**: v1.1 (修订版)  
**创建日期**: 2024年12月  
**目标用户**: 数字游民、远程工作者、可持续生活倡导者  
**重要说明**: 当前版本为**演示版本**，所有交易均为模拟交易，不涉及真实资金转移

### 产品愿景
为数字游民提供基于区块链的可持续能源空间预订服务，让用户能够预订全球范围内的绿色能源工作空间，并通过Web3技术实现透明的支付和资产管理。

---

## 🎨 UX/UI 设计规范

### 1. 能源节点卡片设计

#### 1.1 卡片布局结构
```
┌─────────────────────────────────────┐
│ [图片]                    [状态标签] │
│                                     │
│ 节点名称                            │
│ 📍 位置信息                         │
│                                     │
│ 🔋 能源信息区域                      │
│ 💰 价格信息区域                      │
│                                     │
│ [设施标签] [设施标签] [+N]          │
│                                     │
│ [预订按钮]                          │
└─────────────────────────────────────┘
```

#### 1.2 能源信息显示规范
**目标**: 让用户立即理解能源系统的价值和可靠性

**设计规范**:
```typescript
interface EnergyInfoDisplay {
  // 主要能源信息 - 卡片顶部，图标+文字
  primaryInfo: {
    icon: "🔋" | "⚡" | "🌱"
    text: string // 简洁描述
    value: string // 数值+单位
    status: "self-sufficient" | "grid-connected" | "hybrid"
  }
  
  // 详细能源信息 - 悬停或点击展开
  detailedInfo: {
    totalCapacity: string // "100 kW"
    efficiency: string // "95% efficient"
    energyType: string // "Solar + Wind"
    carbonOffset: string // "2.4 tons CO₂/month"
  }
}
```

**能源信息文案规范**:
- **自给自足系统**: "🔋 Self-sufficient 100 kW system"
- **并网系统**: "⚡ Grid-connected 60 kW + storage"
- **混合系统**: "🌱 Hybrid 80 kW (Solar + Wind)"
- **离网系统**: "🔋 Off-grid 40 kW with battery"

#### 1.3 卡片视觉层次
```css
/* 卡片尺寸和间距 */
.energy-node-card {
  width: 320px;
  height: 480px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 16px;
  transition: transform 0.2s ease;
}

.energy-node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 能源信息区域 */
.energy-info-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 12px;
  margin: 12px 0;
  border-left: 4px solid #22c55e;
}

.energy-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #166534;
  font-size: 14px;
}

.energy-details {
  font-size: 12px;
  color: #15803d;
  margin-top: 4px;
}
```

### 2. 预订表单设计

#### 2.1 预订模态框布局
```
┌─────────────────────────────────────┐
│ × 预订 [节点名称]                    │
├─────────────────────────────────────┤
│ [节点图片]                          │
│                                     │
│ 📅 日期选择                         │
│ ┌─────────┐ ┌─────────┐             │
│ │ 入住日期 │ │ 退房日期 │             │
│ └─────────┘ └─────────┘             │
│                                     │
│ ⏱️ 预订时长: [1-30天] 滑块           │
│                                     │
│ 🌐 网络选择                         │
│ ○ Ethereum  ○ Polygon  ○ Arbitrum   │
│                                     │
│ 💰 价格明细                         │
│ 基础价格: 0.05 ETH/day              │
│ 网络费用: 0.002 ETH                 │
│ 总计: 0.052 ETH (~$156)             │
│                                     │
│ [取消] [确认预订]                   │
└─────────────────────────────────────┘
```

#### 2.2 表单组件规范
```typescript
interface BookingFormComponents {
  // 日期选择器
  datePicker: {
    type: "range"
    format: "YYYY-MM-DD"
    minDate: "today"
    maxDate: "+6months"
    placeholder: "选择入住和退房日期"
  }
  
  // 时长滑块
  durationSlider: {
    min: 1
    max: 30
    step: 1
    defaultValue: 7
    marks: [1, 7, 14, 30]
    tooltip: "预订天数"
  }
  
  // 网络选择器
  networkSelector: {
    type: "radio-group"
    options: [
      { value: 1, label: "Ethereum", icon: "⟠", gas: "~$15" },
      { value: 137, label: "Polygon", icon: "⬟", gas: "~$0.01" },
      { value: 42161, label: "Arbitrum", icon: "🔷", gas: "~$0.50" }
    ]
  }
  
  // 价格显示
  priceDisplay: {
    basePrice: { token: "ETH", amount: "0.05", fiat: "$150" }
    networkFee: { token: "ETH", amount: "0.002", fiat: "$6" }
    total: { token: "ETH", amount: "0.052", fiat: "$156" }
    savings: "Save $45 with Polygon"
  }
}
```

#### 2.3 表单交互状态
```css
/* 表单状态样式 */
.booking-form {
  max-width: 480px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* 网络选择器样式 */
.network-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.network-option {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.network-option:hover {
  border-color: #22c55e;
  background-color: #f0fdf4;
}

.network-option.selected {
  border-color: #22c55e;
  background-color: #dcfce7;
  color: #166534;
}

/* 价格显示区域 */
.price-breakdown {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.price-total {
  border-top: 2px solid #e5e7eb;
  padding-top: 12px;
  font-weight: 700;
  font-size: 18px;
  color: #111827;
}

.price-savings {
  color: #22c55e;
  font-size: 14px;
  font-weight: 600;
}
```

### 3. 能源信息详细设计

#### 3.1 能源信息卡片组件
```typescript
interface EnergyInfoCard {
  // 主要显示 - 卡片上
  primary: {
    icon: "🔋" | "⚡" | "🌱" | "🌊" | "💨"
    title: string // "Self-sufficient 100 kW"
    subtitle: string // "Solar + Wind + Storage"
    status: "online" | "offline" | "maintenance"
  }
  
  // 详细指标 - 悬停显示
  metrics: {
    capacity: { value: "100", unit: "kW", label: "Total Capacity" }
    efficiency: { value: "95", unit: "%", label: "Efficiency" }
    carbonOffset: { value: "2.4", unit: "tons/month", label: "CO₂ Offset" }
    uptime: { value: "99.8", unit: "%", label: "Uptime" }
  }
  
  // 实时状态
  realtime: {
    currentLoad: { value: "45", unit: "kW", label: "Current Load" }
    available: { value: "55", unit: "kW", label: "Available" }
    batteryLevel: { value: "78", unit: "%", label: "Battery" }
  }
}
```

#### 3.2 能源信息文案规范
```typescript
const EnergyInfoTemplates = {
  // 根据能源类型生成文案
  solar: {
    primary: "🔋 Solar-powered 100 kW system",
    subtitle: "Self-sufficient with battery storage",
    benefits: "Clean energy, off-grid capability"
  },
  
  wind: {
    primary: "💨 Wind-powered 60 kW system", 
    subtitle: "Grid-connected with backup",
    benefits: "Consistent power, low maintenance"
  },
  
  geothermal: {
    primary: "🌱 Geothermal 80 kW system",
    subtitle: "24/7 renewable energy",
    benefits: "Reliable baseload power"
  },
  
  hybrid: {
    primary: "⚡ Hybrid 120 kW system",
    subtitle: "Solar + Wind + Storage",
    benefits: "Maximum reliability and efficiency"
  }
}
```

### 4. 响应式设计规范

#### 4.1 移动端适配
```css
/* 移动端卡片 */
@media (max-width: 768px) {
  .energy-node-card {
    width: 100%;
    height: auto;
    margin: 8px 0;
  }
  
  .energy-info-section {
    padding: 8px;
    font-size: 12px;
  }
  
  .booking-form {
    margin: 16px;
    padding: 16px;
  }
  
  .network-selector {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* 平板端适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  .energy-node-card {
    width: 280px;
    height: 420px;
  }
  
  .network-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

#### 4.2 桌面端优化
```css
/* 桌面端网格布局 */
.energy-nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: 24px;
}

/* 悬停效果 */
.energy-node-card:hover .energy-info-section {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  transform: scale(1.02);
}
```

### 5. 交互状态设计

#### 5.1 预订按钮状态
```css
.booking-button {
  width: 100%;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.booking-button.available {
  background: #22c55e;
  color: white;
  border: none;
}

.booking-button.available:hover {
  background: #16a34a;
  transform: translateY(-1px);
}

.booking-button.unavailable {
  background: #f3f4f6;
  color: #9ca3af;
  border: 1px solid #d1d5db;
  cursor: not-allowed;
}

.booking-button.loading {
  background: #fbbf24;
  color: white;
  position: relative;
}

.booking-button.loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

#### 5.2 加载状态指示
```typescript
interface LoadingStates {
  // 预订处理中
  booking: {
    text: "Processing booking..."
    icon: "⏳"
    duration: "2-5 seconds"
  }
  
  // 网络切换中
  networkSwitch: {
    text: "Switching network..."
    icon: "🔄"
    duration: "1-3 seconds"
  }
  
  // 价格计算中
  priceCalculation: {
    text: "Calculating price..."
    icon: "💰"
    duration: "0.5-1 second"
  }
}
```

---

## 🎯 核心功能需求 (修订版)

### 1. 空间预订核心流程

#### 1.1 预订流程设计
**目标**: 提供直观、流畅的空间预订体验

**功能需求**:
- [ ] **空间浏览**
  - 展示全球可持续能源节点
  - 实时显示可用性状态
  - 支持地理位置筛选
  - 价格和设施对比
  - **明确标注演示模式**: 所有交易均为模拟

- [ ] **预订详情页面**
  - 空间详细信息展示
  - 设施和能源类型说明
  - 用户评价和评分
  - **实时价格计算** (支持多网络)
  - **法币价格显示** (USD/EUR等)

- [ ] **预订配置**
  - 入住/退房日期选择
  - 预订时长选择（1-30天）
  - **支付方式选择** (支持多网络代币)
  - 特殊需求备注
  - **网络选择器** (影响价格显示)

- [ ] **支付确认**
  - 钱包连接状态检查
  - 余额充足性验证
  - 交易费用预估
  - **模拟支付确认流程** (明确标注为演示)

**技术实现**:
```typescript
interface BookingRequest {
  nodeId: string
  userId: string
  checkIn: Date
  checkOut: Date
  duration: number // days
  paymentMethod: 'ETH' | 'USDC' | 'GAIA' | 'MATIC' | 'ARB'
  networkId: number // 1=Mainnet, 137=Polygon, 42161=Arbitrum
  totalCost: string
  fiatEquivalent: {
    usd: number
    eur: number
    currency: string
  }
  specialRequests?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  isSimulated: boolean // 明确标注为模拟交易
}

interface EnergyNode {
  id: string
  name: string
  location: string
  // 能源容量说明 - 更精确的定义
  energyCapacity: {
    totalCapacity: number // kW - 总发电容量
    availableCapacity: number // kW - 可用容量
    currentLoad: number // kW - 当前负载
    efficiency: number // % - 能源效率
    description: string // 对用户的说明
  }
  // 多网络价格
  pricing: {
    [networkId: number]: {
      dailyRate: string // 原始代币价格
      fiatEquivalent: {
        usd: number
        eur: number
      }
      currency: string // ETH, MATIC, ARB等
    }
  }
  amenities: string[]
  rating: number
  image: string
  operator: string
}
```

#### 1.2 能源容量信息优化
**目标**: 让用户清楚理解能源容量的含义和价值

**功能需求**:
- [ ] **容量信息展示**
  - **总发电容量** (Total Generation Capacity): 该节点的最大发电能力
  - **可用容量** (Available Capacity): 当前可供预订使用的容量
  - **当前负载** (Current Load): 正在使用的容量
  - **能源效率** (Energy Efficiency): 发电效率百分比
  - **用户价值说明**: 解释为什么这个信息对用户重要

- [ ] **用户价值说明**
  - 高容量 = 更稳定的电力供应
  - 高效率 = 更环保的能源使用
  - 可用容量 = 确保有足够电力支持用户设备
  - 实时负载 = 了解当前使用情况

**技术实现**:
```typescript
interface EnergyCapacityDisplay {
  totalCapacity: {
    value: number
    unit: 'kW'
    label: 'Total Generation Capacity'
    description: 'Maximum power this node can generate'
    userBenefit: 'Ensures reliable power supply for your devices'
  }
  availableCapacity: {
    value: number
    unit: 'kW'
    label: 'Available for Booking'
    description: 'Power capacity available for new bookings'
    userBenefit: 'Guarantees sufficient power for your stay'
  }
  currentLoad: {
    value: number
    unit: 'kW'
    label: 'Currently in Use'
    description: 'Power being used by current occupants'
    userBenefit: 'Shows real-time usage and availability'
  }
  efficiency: {
    value: number
    unit: '%'
    label: 'Energy Efficiency'
    description: 'How efficiently this node converts renewable energy'
    userBenefit: 'Higher efficiency means more sustainable energy'
  }
}
```

#### 1.3 多网络价格系统
**目标**: 支持多区块链网络，价格根据网络自动调整

**功能需求**:
- [ ] **网络选择器**
  - 支持 Ethereum Mainnet, Polygon, Arbitrum
  - 实时网络切换
  - 网络状态指示
  - 切换确认机制

- [ ] **动态价格计算**
  - 基于网络代币的实时价格
  - 法币等价物显示 (USD, EUR)
  - 汇率自动更新
  - 价格历史记录

- [ ] **价格透明度**
  - 显示基础价格和网络费用
  - 总成本计算器
  - 价格比较工具
  - 最佳网络推荐

**技术实现**:
```typescript
interface MultiNetworkPricing {
  // 基础价格 (USD)
  basePriceUSD: number
  
  // 各网络价格
  networkPrices: {
    [networkId: number]: {
      networkName: string
      currency: string
      dailyRate: string
      gasEstimate: string
      totalCost: string
      fiatEquivalent: {
        usd: number
        eur: number
      }
      exchangeRate: number
    }
  }
  
  // 价格计算
  calculatePrice(networkId: number, duration: number): PriceBreakdown
  getBestNetwork(): number // 基于Gas费和汇率推荐最佳网络
  updateExchangeRates(): Promise<void>
}

interface PriceBreakdown {
  basePrice: string
  networkFee: string
  totalCost: string
  fiatEquivalent: {
    usd: number
    eur: number
  }
  savings?: string // 相比其他网络的节省
}
```

### 2. 演示模式功能

#### 2.1 模拟交易系统
**目标**: 提供安全的演示环境，不涉及真实资金

**功能需求**:
- [ ] **模拟钱包**
  - 虚拟余额显示
  - 模拟交易确认
  - 交易历史记录
  - 余额变化动画

- [ ] **模拟智能合约**
  - 预订记录模拟
  - NFT铸造模拟
  - 状态变更模拟
  - 事件触发模拟

- [ ] **演示数据**
  - 预设的预订场景
  - 模拟的用户评价
  - 虚拟的交易历史
  - 演示用的NFT资产

**技术实现**:
```typescript
interface DemoMode {
  isEnabled: boolean
  virtualWallet: {
    address: string
    balances: {
      [token: string]: string
    }
    transactionHistory: Transaction[]
  }
  simulatedContracts: {
    bookingContract: SimulatedContract
    nftContract: SimulatedContract
    governanceContract: SimulatedContract
  }
  demoScenarios: {
    successfulBooking: () => void
    paymentFailure: () => void
    networkSwitch: () => void
    refundProcess: () => void
  }
}

// 模拟交易结果
interface SimulatedTransactionResult {
  success: boolean
  transactionHash: string // 模拟的哈希
  blockNumber: number // 模拟的区块号
  gasUsed: string
  status: 'pending' | 'confirmed' | 'failed'
  message: string
  isSimulated: true // 明确标注为模拟
}
```

#### 2.2 用户教育功能
**目标**: 帮助用户理解Web3预订流程

**功能需求**:
- [ ] **流程引导**
  - 步骤说明动画
  - 关键概念解释
  - 操作提示
  - 常见问题解答

- [ ] **概念解释**
  - 什么是能源节点
  - 为什么需要Web3
  - 如何理解能源容量
  - 多网络价格差异

**技术实现**:
```typescript
interface UserEducation {
  tooltips: {
    energyCapacity: 'This shows how much renewable energy this space can generate. Higher capacity means more reliable power for your devices.'
    pricing: 'Prices are shown in cryptocurrency. You can switch networks to find the best rate including transaction fees.'
    booking: 'Your booking will be recorded on the blockchain as an NFT, giving you verifiable proof of your sustainable energy usage.'
  }
  
  guidedTour: {
    steps: Array<{
      target: string
      title: string
      content: string
      action?: string
    }>
  }
  
  faq: Array<{
    question: string
    answer: string
    category: 'pricing' | 'energy' | 'booking' | 'web3'
  }>
}
```

---

## 🛠️ 技术架构设计 (修订版)

### 1. 多网络价格架构
```typescript
// 价格管理器
class MultiNetworkPriceManager {
  private exchangeRates: Map<string, number> = new Map()
  private networkConfigs: Map<number, NetworkConfig> = new Map()
  
  // 获取实时价格
  async getPrice(nodeId: string, networkId: number, duration: number): Promise<PriceBreakdown> {
    const basePrice = await this.getBasePrice(nodeId)
    const networkConfig = this.networkConfigs.get(networkId)
    const exchangeRate = await this.getExchangeRate(networkConfig.currency, 'USD')
    
    return {
      basePrice: this.calculateTokenPrice(basePrice, exchangeRate),
      networkFee: this.estimateGasFee(networkId),
      totalCost: this.calculateTotalCost(basePrice, networkId, duration),
      fiatEquivalent: {
        usd: basePrice,
        eur: basePrice * (await this.getExchangeRate('USD', 'EUR'))
      },
      savings: this.calculateSavings(networkId, basePrice)
    }
  }
  
  // 推荐最佳网络
  getBestNetwork(nodeId: string, duration: number): number {
    const networks = Array.from(this.networkConfigs.keys())
    const prices = networks.map(networkId => 
      this.getPrice(nodeId, networkId, duration)
    )
    
    return prices.reduce((best, current, index) => 
      current.totalCost < best.totalCost ? current : best
    ).networkId
  }
}
```

### 2. 演示模式架构
```typescript
// 演示模式管理器
class DemoModeManager {
  private isDemoMode: boolean = true
  private virtualState: VirtualState = new VirtualState()
  
  // 模拟交易
  async simulateTransaction(
    type: TransactionType,
    params: any
  ): Promise<SimulatedTransactionResult> {
    if (!this.isDemoMode) {
      throw new Error('Not in demo mode')
    }
    
    // 模拟交易延迟
    await this.delay(2000)
    
    // 生成模拟结果
    return {
      success: Math.random() > 0.1, // 90% 成功率
      transactionHash: this.generateMockHash(),
      blockNumber: this.generateMockBlockNumber(),
      gasUsed: this.estimateGasUsed(type),
      status: 'confirmed',
      message: 'Transaction simulated successfully',
      isSimulated: true
    }
  }
  
  // 更新虚拟状态
  updateVirtualState(transaction: SimulatedTransactionResult): void {
    this.virtualState.applyTransaction(transaction)
  }
}
```

---

## 📊 验收标准 (修订版)

### 1. 功能验收标准
- [ ] **演示模式标识** 100% 界面元素明确标注为演示
- [ ] **能源容量说明** 用户理解率 > 90%
- [ ] **多网络价格** 价格切换响应时间 < 2秒
- [ ] **法币显示** 汇率更新延迟 < 30秒
- [ ] **模拟交易** 成功率 > 95%

### 2. 用户体验标准
- [ ] **概念理解** 用户能解释能源容量的含义
- [ ] **价格透明度** 用户能理解不同网络的价格差异
- [ ] **操作流畅性** 网络切换无卡顿
- [ ] **教育效果** 用户完成引导后理解Web3预订流程

### 3. 技术标准
- [ ] **多网络支持** 支持3+区块链网络
- [ ] **价格准确性** 汇率误差 < 1%
- [ ] **响应速度** 价格计算 < 1秒
- [ ] **数据一致性** 多网络数据同步 < 5秒

---

## 🎯 用户故事验证 (修订版)

基于用户故事中的Luna场景，本PRD确保：

1. **✅ 入住后连接钱包**: 自动显示当前空间能源消耗数据，**明确标注为演示模式**
2. **✅ 查看Dashboard数据**: 实时能源使用情况监控，**包含能源容量说明**
3. **✅ 购买能源NFT**: 通过预订获得能源资产权益，**支持多网络价格选择**
4. **✅ DAO治理投票**: 基于预订NFT的治理参与权，**模拟交易记录**
5. **✅ 查看碳减排记录**: 可持续贡献的可视化展示，**包含法币等价物**

---

## 🚀 开发计划 (修订版)

### Phase 1: 基础功能 + 演示模式 (2周)
- [ ] 预订界面开发
- [ ] 演示模式标识
- [ ] 能源容量说明优化
- [ ] 基础多网络支持

### Phase 2: 多网络价格系统 (2周)
- [ ] 动态价格计算
- [ ] 法币等价物显示
- [ ] 网络切换优化
- [ ] 汇率服务集成

### Phase 3: 用户教育功能 (1周)
- [ ] 概念解释工具
- [ ] 引导流程设计
- [ ] FAQ系统
- [ ] 演示场景完善

### Phase 4: 测试和优化 (1周)
- [ ] 多网络测试
- [ ] 用户体验测试
- [ ] 性能优化
- [ ] 文档完善

This revised PRD addresses all the key issues you raised, ensuring users can clearly understand the meaning of energy capacity, multi-network price differences, and the current system's demo nature. It also provides detailed UX/UI design specifications to ensure interface consistency and user experience optimization.
```

This updated PRD includes detailed UX/UI design specifications, with particular focus on:

1. **Energy Information Display**: Using concise icons and copy, such as "🔋 Self-sufficient 100 kW system"
2. **Card Design**: Complete layout structure and visual hierarchy
3. **Form Design**: Detailed layout and interactive states for booking modals
4. **Responsive Design**: Mobile, tablet, and desktop adaptation
5. **Interactive States**: Button states, loading indicators, and other detailed design elements

These design specifications will ensure the development team can create a consistent, intuitive, and user-friendly interface.