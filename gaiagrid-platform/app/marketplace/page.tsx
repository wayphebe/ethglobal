"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Sun, 
  Wind, 
  Droplets, 
  Zap, 
  Leaf,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"
import { useRWANFT } from "@/lib/contracts/hooks/useRWANFT"
import { useWeb3 } from "@/lib/web3-context"
import { NFTPurchaseModal } from "@/components/nft-purchase-modal"

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [sortBy, setSortBy] = useState<string>("price")

  // Web3 context
  const { account, isSupportedNetwork } = useWeb3()

  // NFT hook
  const { 
    verifiedAssets, 
    allAssets, 
    isLoading, 
    formatAssetType, 
    formatCapacity, 
    formatValue,
    EnergyAssetType 
  } = useRWANFT()

  // Demo assets for when no real assets are available
  const demoAssets = [
    {
      tokenId: "demo-001",
      name: "Bali Solar Panel Array",
      assetType: EnergyAssetType.SOLAR_PANEL,
      capacity: "25000000", // 25kW in watts
      location: "Bali, Indonesia",
      installationDate: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
      efficiency: 92,
      currentValue: "5000000000000000000", // 5 ETH in wei
      verificationStatus: 1,
      verificationExpiry: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year from now
      verifier: "0x1234567890123456789012345678901234567890",
      metadataURI: "https://example.com/metadata/1",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
      owner: "0x0000000000000000000000000000000000000000"
    },
    {
      tokenId: "demo-002", 
      name: "Costa Rica Wind Farm",
      assetType: EnergyAssetType.WIND_TURBINE,
      capacity: "15000000", // 15kW
      location: "Costa Rica",
      installationDate: Math.floor(Date.now() / 1000) - 86400 * 60,
      efficiency: 88,
      currentValue: "3000000000000000000", // 3 ETH
      verificationStatus: 1,
      verificationExpiry: Math.floor(Date.now() / 1000) + 86400 * 365,
      verifier: "0x1234567890123456789012345678901234567890",
      metadataURI: "https://example.com/metadata/2",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 60,
      owner: "0x0000000000000000000000000000000000000000"
    },
    {
      tokenId: "demo-003",
      name: "Iceland Geothermal Plant",
      assetType: EnergyAssetType.GEOTHERMAL,
      capacity: "20000000", // 20kW
      location: "Iceland",
      installationDate: Math.floor(Date.now() / 1000) - 86400 * 90,
      efficiency: 95,
      currentValue: "8000000000000000000", // 8 ETH
      verificationStatus: 1,
      verificationExpiry: Math.floor(Date.now() / 1000) + 86400 * 365,
      verifier: "0x1234567890123456789012345678901234567890",
      metadataURI: "https://example.com/metadata/3",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 90,
      owner: "0x0000000000000000000000000000000000000000"
    }
  ]

  // Use demo assets if no real assets are available
  const availableAssets = (verifiedAssets && verifiedAssets.length > 0) ? verifiedAssets : 
                         (allAssets && allAssets.length > 0) ? allAssets : demoAssets

  // Filter and sort assets
  const filteredAssets = availableAssets
    .filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === "all" || 
                         asset.assetType === EnergyAssetType[selectedType.toUpperCase()]
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === "price") {
        return parseFloat(a.currentValue) - parseFloat(b.currentValue)
      }
      if (sortBy === "capacity") {
        return parseFloat(b.capacity) - parseFloat(a.capacity)
      }
      if (sortBy === "efficiency") {
        return b.efficiency - a.efficiency
      }
      return 0
    })

  // Get asset icon
  const getAssetIcon = (assetType: number) => {
    switch (assetType) {
      case EnergyAssetType.SOLAR_PANEL:
        return <Sun className="h-6 w-6 text-yellow-600" />
      case EnergyAssetType.WIND_TURBINE:
        return <Wind className="h-6 w-6 text-blue-600" />
      case EnergyAssetType.GEOTHERMAL:
        return <Droplets className="h-6 w-6 text-orange-600" />
      case EnergyAssetType.BATTERY_STORAGE:
        return <Zap className="h-6 w-6 text-purple-600" />
      case EnergyAssetType.HYDROELECTRIC:
        return <Droplets className="h-6 w-6 text-cyan-600" />
      case EnergyAssetType.HYBRID_SYSTEM:
        return <Zap className="h-6 w-6 text-green-600" />
      default:
        return <Leaf className="h-6 w-6 text-gray-600" />
    }
  }

  // Calculate daily earnings estimate
  const calculateDailyEarnings = (asset: any) => {
    const value = parseFloat(asset.currentValue)
    const capacity = parseFloat(asset.capacity)
    // Simple calculation: 0.1% of asset value per day
    return (value * 0.001).toFixed(4)
  }

  // Handle asset selection
  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset)
    setShowPurchaseModal(true)
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Leaf className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to browse and purchase energy asset NFTs.
            </p>
            <Button className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isSupportedNetwork) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Leaf className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold mb-2">Unsupported Network</h2>
            <p className="text-muted-foreground mb-6">
              Please switch to a supported network to access the marketplace.
            </p>
            <Button className="w-full">
              Switch Network
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Energy Asset Marketplace</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse and purchase tokenized renewable energy infrastructure
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Asset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="solar">Solar Panel</SelectItem>
              <SelectItem value="wind">Wind Turbine</SelectItem>
              <SelectItem value="geothermal">Geothermal</SelectItem>
              <SelectItem value="battery">Battery Storage</SelectItem>
              <SelectItem value="hydroelectric">Hydroelectric</SelectItem>
              <SelectItem value="hybrid">Hybrid System</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price (Low to High)</SelectItem>
              <SelectItem value="capacity">Capacity (High to Low)</SelectItem>
              <SelectItem value="efficiency">Efficiency (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading assets...</p>
            </div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <Leaf className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new listings.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => (
              <Card key={asset.tokenId} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAssetIcon(asset.assetType)}
                      <Badge variant="secondary">
                        {formatAssetType(asset.assetType)}
                      </Badge>
                    </div>
                    <Badge 
                      variant={asset.verificationStatus === 1 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {asset.verificationStatus === 1 ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {asset.location}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Capacity</div>
                      <div className="font-semibold">{formatCapacity(asset.capacity)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Efficiency</div>
                      <div className="font-semibold">{asset.efficiency}%</div>
                    </div>
                  </div>

                  {/* Price and Earnings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-bold text-lg">
                        {formatValue(asset.currentValue)} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Est. Daily Earnings</span>
                      <span className="font-semibold text-green-600">
                        {calculateDailyEarnings(asset)} ETH
                      </span>
                    </div>
                  </div>

                  {/* Installation Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Installed: {new Date(asset.installationDate * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Purchase Button */}
                  <Button 
                    className="w-full" 
                    onClick={() => handleAssetSelect(asset)}
                  >
                    Purchase Asset
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Purchase Modal */}
        {selectedAsset && (
          <NFTPurchaseModal
            asset={selectedAsset}
            isOpen={showPurchaseModal}
            onClose={() => {
              setShowPurchaseModal(false)
              setSelectedAsset(null)
            }}
            onPurchase={async (amount: number, paymentMethod: string) => {
              console.log('Purchasing asset:', selectedAsset.tokenId, amount, paymentMethod)
              // In a real implementation, this would call the purchase contract
              setShowPurchaseModal(false)
              setSelectedAsset(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
