"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Zap, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  Copy,
  Share2,
  Download,
  Leaf,
  Shield,
  Activity
} from "lucide-react"
import { BookingRequest, EnergyNode } from "@/lib/types/booking"
import { demoModeManager } from "@/lib/demo-mode"

interface BookingConfirmationProps {
  booking: BookingRequest
  node: EnergyNode
  isOpen: boolean
  onClose: () => void
  onViewNFT?: (nftId: string) => void
}

export function BookingConfirmation({ 
  booking, 
  node, 
  isOpen, 
  onClose, 
  onViewNFT 
}: BookingConfirmationProps) {
  const [nftMinted, setNftMinted] = useState(false)
  const [nftId, setNftId] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)

  // Simulate NFT minting when component mounts
  useEffect(() => {
    if (booking.status === 'confirmed' && !nftMinted) {
      mintNFT()
    }
  }, [booking.status, nftMinted])

  const mintNFT = async () => {
    setIsMinting(true)
    try {
      // Simulate NFT minting delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const result = await demoModeManager.simulateNFTMint(booking.nodeId, booking.userId)
      
      if (result.success) {
        setNftId(result.transactionHash)
        setNftMinted(true)
      }
    } catch (error) {
      console.error('NFT minting failed:', error)
    } finally {
      setIsMinting(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `My GaiaGrid Booking: ${node.name}`,
        text: `I just booked a sustainable workspace at ${node.name} powered by ${node.energyCapacity.energyType} energy!`,
        url: window.location.href
      })
    } else {
      copyToClipboard(window.location.href)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
          <p className="text-muted-foreground">
            Your sustainable workspace is reserved and your Energy NFT is being minted
          </p>
        </div>
      </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="nft">Energy NFT</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Location</h4>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {node.name}
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">{node.location}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {booking.duration} days
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Energy System</h4>
                    <p className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      {node.energyCapacity.energyType} powered
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">
                      {node.energyCapacity.totalCapacity} kW capacity
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Total Cost</h4>
                    <p className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {booking.totalCost} {booking.paymentMethod}
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">
                      ~${booking.fiatEquivalent.usd.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Special Requests</h4>
                    <p className="text-sm">{booking.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking ID and Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Booking ID</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {booking.nodeId}-{booking.userId}-{booking.createdAt.getTime()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${booking.nodeId}-${booking.userId}-${booking.createdAt.getTime()}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareBooking}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nft" className="space-y-6">
            {/* NFT Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Energy NFT
                </CardTitle>
                <CardDescription>
                  Your booking creates a verifiable NFT proving your sustainable energy usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isMinting ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <h3 className="font-semibold mb-2">Minting Your Energy NFT...</h3>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments. Your NFT will appear here once ready.
                    </p>
                  </div>
                ) : nftMinted && nftId ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-2">NFT Minted Successfully!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your Energy NFT has been created and is now in your wallet.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        Transaction: {nftId}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(nftId)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Hash
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewNFT?.(nftId)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View NFT
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold mb-2">NFT Pending</h3>
                    <p className="text-sm text-muted-foreground">
                      Your Energy NFT will be minted shortly.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* NFT Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You Can Do With Your Energy NFT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium text-sm">Governance Rights</p>
                    <p className="text-xs text-muted-foreground">Vote on community proposals and protocol upgrades</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium text-sm">Trade or Sell</p>
                    <p className="text-xs text-muted-foreground">Exchange your NFT on secondary markets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium text-sm">Prove Sustainability</p>
                    <p className="text-xs text-muted-foreground">Showcase your environmental commitment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium text-sm">Earn Rewards</p>
                    <p className="text-xs text-muted-foreground">Participate in staking and reward programs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            {/* Environmental Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Environmental Impact
                </CardTitle>
                <CardDescription>
                  Your booking contributes to sustainable energy usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {(node.carbonOffset * booking.duration / 30).toFixed(1)}
                    </div>
                    <div className="text-sm text-emerald-800">Tons CO₂ Offset</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(node.energyCapacity.totalCapacity * booking.duration).toFixed(0)}
                    </div>
                    <div className="text-sm text-blue-800">kWh Clean Energy</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {node.energyCapacity.efficiency}%
                    </div>
                    <div className="text-sm text-purple-800">System Efficiency</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {node.uptime}%
                    </div>
                    <div className="text-sm text-orange-800">System Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sustainability Badge */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-4">
                    <Leaf className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Sustainability Champion</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've chosen a {node.energyCapacity.energyType}-powered workspace, 
                    contributing to a more sustainable future.
                  </p>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <Activity className="h-3 w-3 mr-1" />
                    Sustainable Choice
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {nftMinted && (
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          )}
        </div>
    </div>
  )
}
