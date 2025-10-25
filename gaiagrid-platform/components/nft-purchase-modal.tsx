"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Sun, 
  Wind, 
  Droplets, 
  Zap, 
  Leaf,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useRWANFT } from "@/lib/contracts/hooks/useRWANFT"

interface NFTPurchaseModalProps {
  asset: any
  isOpen: boolean
  onClose: () => void
  onPurchase: (amount: number, paymentMethod: string) => Promise<void>
}

export function NFTPurchaseModal({ 
  asset, 
  isOpen, 
  onClose, 
  onPurchase 
}: NFTPurchaseModalProps) {
  const [purchaseStep, setPurchaseStep] = useState<'details' | 'payment' | 'confirm' | 'processing' | 'success'>('details')
  const [paymentMethod, setPaymentMethod] = useState<string>('ETH')
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { formatAssetType, formatCapacity, formatValue, EnergyAssetType } = useRWANFT()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPurchaseStep('details')
      setPaymentMethod('ETH')
      setPurchaseAmount(1)
      setError(null)
    }
  }, [isOpen])

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

  // Calculate total cost
  const totalCost = parseFloat(asset.currentValue) * purchaseAmount

  // Calculate daily earnings
  const dailyEarnings = (totalCost * 0.001).toFixed(4)
  const monthlyEarnings = (totalCost * 0.03).toFixed(4)

  // Handle purchase
  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setPurchaseStep('processing')
      
      await onPurchase(purchaseAmount, paymentMethod)
      
      setPurchaseStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed')
      setPurchaseStep('payment')
    } finally {
      setIsLoading(false)
    }
  }

  // Get step progress
  const getStepProgress = () => {
    switch (purchaseStep) {
      case 'details': return 20
      case 'payment': return 40
      case 'confirm': return 60
      case 'processing': return 80
      case 'success': return 100
      default: return 0
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getAssetIcon(asset.assetType)}
            Purchase Energy Asset
          </DialogTitle>
          <DialogDescription>
            Complete your purchase of {asset.name}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Purchase Progress</span>
            <span>{getStepProgress()}%</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Content */}
        {purchaseStep === 'details' && (
          <div className="space-y-6">
            {/* Asset Details */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getAssetIcon(asset.assetType)}
                  <div>
                    <h3 className="font-semibold">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {asset.location}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {formatAssetType(asset.assetType)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Capacity</div>
                  <div className="font-semibold">{formatCapacity(asset.capacity)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Efficiency</div>
                  <div className="font-semibold">{asset.efficiency}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-semibold">{formatValue(asset.currentValue)} ETH</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-semibold">
                    {asset.verificationStatus === 1 ? 'Verified' : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Purchase Amount</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max="100"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 1)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">shares</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Each share represents a portion of this energy asset
              </p>
            </div>

            <Button onClick={() => setPurchaseStep('payment')} className="w-full">
              Continue to Payment
            </Button>
          </div>
        )}

        {purchaseStep === 'payment' && (
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                  <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                  <SelectItem value="GAIA">GAIA (Governance Token)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Cost Breakdown</h4>
              <div className="flex justify-between text-sm">
                <span>Asset Price ({purchaseAmount} shares)</span>
                <span>{formatValue(asset.currentValue)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Network Fee</span>
                <span>~0.005 ETH</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total Cost</span>
                <span>{formatValue(asset.currentValue)} ETH</span>
              </div>
            </div>

            {/* Earnings Estimate */}
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2">
              <h4 className="font-semibold text-green-800 dark:text-green-200">Earnings Estimate</h4>
              <div className="flex justify-between text-sm">
                <span>Daily Earnings</span>
                <span className="text-green-600 font-semibold">{dailyEarnings} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Earnings</span>
                <span className="text-green-600 font-semibold">{monthlyEarnings} ETH</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                *Earnings are estimates based on current asset performance
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPurchaseStep('details')} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setPurchaseStep('confirm')} className="flex-1">
                Review Purchase
              </Button>
            </div>
          </div>
        )}

        {purchaseStep === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Confirm Your Purchase</h3>
              <p className="text-muted-foreground">
                Please review your purchase details before proceeding
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Asset</span>
                <span className="font-semibold">{asset.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Shares</span>
                <span>{purchaseAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cost</span>
                <span className="font-semibold">{formatValue(asset.currentValue)} ETH</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Est. Daily Earnings</span>
                <span className="font-semibold">{dailyEarnings} ETH</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPurchaseStep('payment')} className="flex-1">
                Back
              </Button>
              <Button onClick={handlePurchase} className="flex-1">
                Confirm Purchase
              </Button>
            </div>
          </div>
        )}

        {purchaseStep === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Processing Purchase</h3>
            <p className="text-muted-foreground">
              Please wait while we process your transaction...
            </p>
          </div>
        )}

        {purchaseStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Purchase Successful!</h3>
            <p className="text-muted-foreground mb-4">
              You now own {purchaseAmount} shares of {asset.name}
            </p>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg mb-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                You can expect to earn approximately {dailyEarnings} ETH daily from this asset.
              </p>
            </div>
            <Button onClick={onClose} className="w-full">
              View in Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
