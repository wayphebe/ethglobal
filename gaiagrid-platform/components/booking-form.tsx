"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, Zap, DollarSign, Network, AlertCircle, CheckCircle, Loader2, MapPin, Copy, Download, Leaf } from "lucide-react"
import { EnergyNode, BookingRequest, SUPPORTED_NETWORKS } from "@/lib/types/booking"
import { pricingManager } from "@/lib/pricing-manager"
import { demoModeManager } from "@/lib/demo-mode"
import { BookingConfirmation } from "./booking-confirmation"

interface BookingFormProps {
  node: EnergyNode | null
  isOpen: boolean
  onClose: () => void
  onBookingSuccess: (booking: BookingRequest) => void
  showDemoMode?: boolean
}

export function BookingForm({ 
  node, 
  isOpen, 
  onClose, 
  onBookingSuccess, 
  showDemoMode = true 
}: BookingFormProps) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [duration, setDuration] = useState(7)
  const [selectedNetwork, setSelectedNetwork] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null)
  const [allNetworkPrices, setAllNetworkPrices] = useState<any>(null)
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirm'>('details')
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRequest | null>(null)

  // Calculate dates when duration changes
  useEffect(() => {
    if (checkIn && duration) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkInDate)
      checkOutDate.setDate(checkOutDate.getDate() + duration)
      setCheckOut(checkOutDate.toISOString().split('T')[0])
    }
  }, [checkIn, duration])

  // Update prices when network or duration changes
  useEffect(() => {
    if (node && selectedNetwork && duration) {
      updatePrices()
    }
  }, [node, selectedNetwork, duration])

  // Load all network prices on mount
  useEffect(() => {
    if (node && duration) {
      loadAllNetworkPrices()
    }
  }, [node, duration])

  const updatePrices = async () => {
    if (!node) return

    try {
      const price = await pricingManager.getPrice(node.id, selectedNetwork, duration)
      setPriceBreakdown(price)
    } catch (error) {
      console.error('Failed to update prices:', error)
    }
  }

  const loadAllNetworkPrices = async () => {
    if (!node) return

    try {
      const prices = await pricingManager.getAllNetworkPrices(node.id, duration)
      setAllNetworkPrices(prices)
    } catch (error) {
      console.error('Failed to load network prices:', error)
    }
  }

  const handleBooking = async () => {
    if (!node || !checkIn || !checkOut) return

    setIsLoading(true)
    setBookingStep('payment')

    try {
      // Simulate booking process
      const bookingRequest: BookingRequest = {
        nodeId: node.id,
        userId: 'demo-user', // In real app, get from auth
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        duration,
        paymentMethod: SUPPORTED_NETWORKS.find(n => n.id === selectedNetwork)?.currency || 'ETH',
        networkId: selectedNetwork,
        totalCost: priceBreakdown?.totalCost || '0',
        fiatEquivalent: priceBreakdown?.fiatEquivalent || { usd: 0, eur: 0, currency: 'USD' },
        specialRequests,
        status: 'pending',
        isSimulated: showDemoMode,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (showDemoMode) {
        // Use demo mode for simulation
        const result = await demoModeManager.simulateBooking(bookingRequest)
        if (result.success) {
          bookingRequest.status = 'confirmed'
          setConfirmedBooking(bookingRequest)
          setBookingStep('confirm')
          onBookingSuccess(bookingRequest)
        } else {
          throw new Error('Payment failed')
        }
      } else {
        // Real payment processing would go here
        bookingRequest.status = 'confirmed'
        setConfirmedBooking(bookingRequest)
        setBookingStep('confirm')
        onBookingSuccess(bookingRequest)
      }
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getBestNetwork = () => {
    if (!allNetworkPrices) return 1
    
    let bestNetwork = 1
    let lowestCost = Infinity

    for (const [networkId, price] of Object.entries(allNetworkPrices.networkPrices)) {
      const totalCost = parseFloat(price.totalCost)
      if (totalCost < lowestCost) {
        lowestCost = totalCost
        bestNetwork = parseInt(networkId)
      }
    }

    return bestNetwork
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!node) return null

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600" />
              Book {node.name}
            </DialogTitle>
            <DialogDescription>
              Reserve your sustainable workspace powered by renewable energy
            </DialogDescription>
          </DialogHeader>

          <Tabs value={bookingStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="confirm">Confirm</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Node Image and Info */}
              <div className="flex gap-4">
                <img
                  src={node.image || "/placeholder.svg"}
                  alt={node.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{node.name}</h3>
                  <p className="text-sm text-muted-foreground">{node.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {node.energyCapacity.energyType} powered
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {node.energyCapacity.totalCapacity} kW
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkin">Check-in Date</Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout">Check-out Date</Label>
                  <Input
                    id="checkout"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-2">
                <Label>Duration: {duration} days</Label>
                <Slider
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special requirements or requests..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => setBookingStep('payment')}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={!checkIn || !checkOut}
              >
                Continue to Payment
              </Button>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              {/* Network Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Choose Payment Network</Label>
                  {allNetworkPrices && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs">
                          Best: {SUPPORTED_NETWORKS.find(n => n.id === getBestNetwork())?.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recommended network with lowest total cost</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                <div className="grid gap-3">
                  {SUPPORTED_NETWORKS.map((network) => {
                    const networkPrice = allNetworkPrices?.networkPrices[network.id]
                    const isSelected = selectedNetwork === network.id
                    const isBest = getBestNetwork() === network.id

                    return (
                      <Card 
                        key={network.id}
                        className={`cursor-pointer transition-all ${
                          isSelected 
                            ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedNetwork(network.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{network.icon}</div>
                              <div>
                                <div className="font-medium">{network.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {network.currency} • Gas: {network.gasEstimate}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {networkPrice && (
                                <>
                                  <div className="font-semibold">
                                    {networkPrice.totalCost} {network.currency}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    ~${networkPrice.fiatEquivalent.usd.toFixed(2)}
                                  </div>
                                </>
                              )}
                              {isBest && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Best Value
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              {priceBreakdown && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price Breakdown
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price ({duration} days)</span>
                        <span>{priceBreakdown.basePrice} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Fee</span>
                        <span>{priceBreakdown.networkFee} ETH</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total</span>
                        <span>{priceBreakdown.totalCost} ETH</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>USD Equivalent</span>
                        <span>~${priceBreakdown.fiatEquivalent.usd.toFixed(2)}</span>
                      </div>
                      {priceBreakdown.savings && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Savings</span>
                          <span>{priceBreakdown.savings}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Demo Mode Warning */}
              {showDemoMode && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div className="text-sm text-yellow-800">
                    <strong>Demo Mode:</strong> This is a simulation. No real payment will be processed.
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setBookingStep('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="confirm" className="space-y-6">
              {confirmedBooking ? (
                <div className="space-y-6">
                  {/* Success Header */}
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

                  {/* Booking Summary */}
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Booking Summary
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Location</h5>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {node.name}
                          </p>
                          <p className="text-sm text-muted-foreground ml-6">{node.location}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Duration</h5>
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {confirmedBooking.duration} days
                          </p>
                          <p className="text-sm text-muted-foreground ml-6">
                            {formatDate(confirmedBooking.checkIn)} - {formatDate(confirmedBooking.checkOut)}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Energy System</h5>
                          <p className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            {node.energyCapacity.energyType} powered
                          </p>
                          <p className="text-sm text-muted-foreground ml-6">
                            {node.energyCapacity.totalCapacity} kW capacity
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Total Cost</h5>
                          <p className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {confirmedBooking.totalCost} {confirmedBooking.paymentMethod}
                          </p>
                          <p className="text-sm text-muted-foreground ml-6">
                            ~${confirmedBooking.fiatEquivalent.usd.toFixed(2)} USD
                          </p>
                        </div>
                      </div>

                      {confirmedBooking.specialRequests && (
                        <div className="mt-4">
                          <h5 className="font-medium text-sm text-muted-foreground">Special Requests</h5>
                          <p className="text-sm">{confirmedBooking.specialRequests}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Booking ID */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">Booking ID</h4>
                          <p className="text-sm text-muted-foreground font-mono">
                            {confirmedBooking.nodeId}-{confirmedBooking.userId}-{confirmedBooking.createdAt.getTime()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(`${confirmedBooking.nodeId}-${confirmedBooking.userId}-${confirmedBooking.createdAt.getTime()}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Environmental Impact */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        Environmental Impact
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                          <div className="text-lg font-bold text-emerald-600">
                            {(node.carbonOffset * confirmedBooking.duration / 30).toFixed(1)}
                          </div>
                          <div className="text-sm text-emerald-800">Tons CO₂ Offset</div>
                        </div>
                        
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {(node.energyCapacity.totalCapacity * confirmedBooking.duration).toFixed(0)}
                          </div>
                          <div className="text-sm text-blue-800">kWh Clean Energy</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
                    <p className="text-muted-foreground">
                      Your sustainable workspace is reserved
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  )
}
