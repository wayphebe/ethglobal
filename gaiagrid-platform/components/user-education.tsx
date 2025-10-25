"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  HelpCircle, 
  Zap, 
  DollarSign, 
  BookOpen, 
  Shield, 
  Leaf, 
  ChevronRight, 
  ChevronLeft,
  X,
  Info,
  Lightbulb
} from "lucide-react"
import { UserEducation } from "@/lib/types/booking"

interface UserEducationProps {
  isOpen: boolean
  onClose: () => void
}

export function UserEducationModal({ isOpen, onClose }: UserEducationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  const education: UserEducation = {
    tooltips: {
      energyCapacity: 'This shows how much renewable energy this space can generate. Higher capacity means more reliable power for your devices.',
      pricing: 'Prices are shown in cryptocurrency. You can switch networks to find the best rate including transaction fees.',
      booking: 'Your booking will be recorded on the blockchain as an NFT, giving you verifiable proof of your sustainable energy usage.',
      nft: 'Energy NFTs represent your ownership or usage rights of renewable energy assets. They can be traded or used for governance.',
      governance: 'Participate in community decisions about energy infrastructure, pricing, and protocol upgrades using your GAIA tokens.'
    },
    
    guidedTour: {
      steps: [
        {
          target: 'energy-info',
          title: 'Understanding Energy Capacity',
          content: 'This shows the renewable energy system\'s capacity. Higher capacity means more reliable power for your devices.',
          action: 'Look at the energy metrics below'
        },
        {
          target: 'pricing-info',
          title: 'Multi-Network Pricing',
          content: 'Prices are calculated in real-time across different blockchain networks. Choose the network with the best rates.',
          action: 'Try switching between networks'
        },
        {
          target: 'booking-process',
          title: 'Booking Process',
          content: 'Your booking creates an NFT on the blockchain, proving your sustainable energy usage.',
          action: 'Click "Book Now" to start'
        }
      ]
    },
    
    faq: [
      {
        question: 'What is energy capacity and why does it matter?',
        answer: 'Energy capacity shows how much renewable energy a space can generate. Higher capacity means more reliable power for your devices and better environmental impact.',
        category: 'energy'
      },
      {
        question: 'Why are there different prices for different networks?',
        answer: 'Each blockchain network has different transaction fees and token values. We show prices across multiple networks so you can choose the most cost-effective option.',
        category: 'pricing'
      },
      {
        question: 'What happens when I book a space?',
        answer: 'Your booking is recorded on the blockchain as an NFT, providing verifiable proof of your sustainable energy usage. You also get access to the physical space.',
        category: 'booking'
      },
      {
        question: 'What are Energy NFTs?',
        answer: 'Energy NFTs represent your ownership or usage rights of renewable energy assets. They can be traded, used for governance, or held as digital assets.',
        category: 'nft'
      },
      {
        question: 'How does governance work?',
        answer: 'Holders of GAIA tokens can vote on protocol upgrades, energy infrastructure decisions, and community proposals. Your voting power depends on your token holdings.',
        category: 'governance'
      },
      {
        question: 'Is this a demo or real system?',
        answer: 'This is currently a demo version. All transactions are simulated and no real money is involved. This allows you to explore the system safely.',
        category: 'web3'
      }
    ]
  }

  const startGuidedTour = () => {
    setCurrentStep(0)
    setActiveTab('tour')
  }

  const nextStep = () => {
    if (currentStep < education.guidedTour.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFaqByCategory = (category: string) => {
    return education.faq.filter(item => item.category === category)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      energy: Zap,
      pricing: DollarSign,
      booking: BookOpen,
      nft: Shield,
      governance: Leaf,
      web3: Info
    }
    const Icon = icons[category as keyof typeof icons] || Info
    return <Icon className="h-4 w-4" />
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      energy: 'text-yellow-600 bg-yellow-100',
      pricing: 'text-green-600 bg-green-100',
      booking: 'text-blue-600 bg-blue-100',
      nft: 'text-purple-600 bg-purple-100',
      governance: 'text-emerald-600 bg-emerald-100',
      web3: 'text-orange-600 bg-orange-100'
    }
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-600" />
              Learn About GaiaGrid
            </DialogTitle>
            <DialogDescription>
              Understand how to use the decentralized energy booking system
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tour">Guided Tour</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Energy System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Each space is powered by renewable energy sources like solar, wind, or geothermal.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Real-time energy monitoring</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Carbon footprint tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Efficiency metrics</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Multi-Network Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Compare prices across different blockchain networks to find the best deal.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Ethereum, Polygon, Arbitrum</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Real-time price updates</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Gas fee optimization</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Energy NFTs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your bookings create NFTs that prove your sustainable energy usage.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Verifiable ownership</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Tradable assets</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Governance rights</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                      Environmental Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track your contribution to sustainable energy and carbon reduction.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>CO₂ offset tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>Sustainability metrics</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>Impact visualization</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button onClick={startGuidedTour} className="bg-emerald-600 hover:bg-emerald-700">
                  Start Guided Tour
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tour" className="space-y-6">
              {education.guidedTour.steps[currentStep] && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        Step {currentStep + 1} of {education.guidedTour.steps.length}
                      </CardTitle>
                      <Badge variant="outline">
                        {education.guidedTour.steps[currentStep].target}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {education.guidedTour.steps[currentStep].title}
                    </h3>
                    <p className="text-muted-foreground">
                      {education.guidedTour.steps[currentStep].content}
                    </p>
                    {education.guidedTour.steps[currentStep].action && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Action:</strong> {education.guidedTour.steps[currentStep].action}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={currentStep === education.guidedTour.steps.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {['energy', 'pricing', 'booking', 'nft', 'governance', 'web3'].map((category) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {getFaqByCategory(category).map((item, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-medium text-sm">{item.question}</h4>
                          <p className="text-sm text-muted-foreground">{item.answer}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Energy Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Check Energy Capacity</p>
                        <p className="text-xs text-muted-foreground">Higher capacity means more reliable power for your devices</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Monitor Efficiency</p>
                        <p className="text-xs text-muted-foreground">Higher efficiency means more sustainable energy usage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Check Availability</p>
                        <p className="text-xs text-muted-foreground">Available capacity shows how much power is free for booking</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Pricing Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Compare Networks</p>
                        <p className="text-xs text-muted-foreground">Check all networks to find the best total cost</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Consider Gas Fees</p>
                        <p className="text-xs text-muted-foreground">Factor in network fees when comparing prices</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Check Exchange Rates</p>
                        <p className="text-xs text-muted-foreground">Rates update in real-time, so prices may fluctuate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      NFT Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Keep Your NFTs</p>
                        <p className="text-xs text-muted-foreground">NFTs prove your sustainable energy usage and can be valuable</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Use for Governance</p>
                        <p className="text-xs text-muted-foreground">NFTs give you voting rights in community decisions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Trade or Hold</p>
                        <p className="text-xs text-muted-foreground">You can trade NFTs or hold them as digital assets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                      Sustainability Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Track Your Impact</p>
                        <p className="text-xs text-muted-foreground">Monitor your CO₂ offset and environmental contribution</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Choose Efficient Spaces</p>
                        <p className="text-xs text-muted-foreground">Higher efficiency means better environmental impact</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium text-sm">Share Your Impact</p>
                        <p className="text-xs text-muted-foreground">Use your NFTs to showcase your sustainability commitment</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

// Tooltip wrapper component for easy use
export function EducationTooltip({ 
  children, 
  content, 
  category = 'info' 
}: { 
  children: React.ReactNode
  content: string
  category?: 'energy' | 'pricing' | 'booking' | 'nft' | 'governance' | 'info'
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
