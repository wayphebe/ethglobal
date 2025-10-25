"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap, Star, Users, Leaf, Battery, Activity, TrendingUp } from "lucide-react"
import { EnergyNode, EnergyInfoCard } from "@/lib/types/booking"
import { EnergyInfoTemplates } from "@/lib/types/booking"

interface EnergyNodeCardProps {
  node: EnergyNode
  onBook: (nodeId: string) => void
  showDemoMode?: boolean
}

export function EnergyNodeCard({ node, onBook, showDemoMode = true }: EnergyNodeCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Get energy info template based on energy type
  const energyTemplate = EnergyInfoTemplates[node.energyCapacity.energyType] || EnergyInfoTemplates.solar

  // Create energy info card data
  const energyInfo: EnergyInfoCard = {
    primary: {
      icon: getEnergyIcon(node.energyCapacity.energyType),
      title: `${energyTemplate.primary} (${node.energyCapacity.totalCapacity} kW)`,
      subtitle: energyTemplate.subtitle,
      status: node.energyCapacity.status
    },
    metrics: {
      capacity: { 
        value: node.energyCapacity.totalCapacity.toString(), 
        unit: 'kW', 
        label: 'Total Capacity' 
      },
      efficiency: { 
        value: node.energyCapacity.efficiency.toString(), 
        unit: '%', 
        label: 'Efficiency' 
      },
      carbonOffset: { 
        value: node.carbonOffset.toString(), 
        unit: 'tons/month', 
        label: 'CO₂ Offset' 
      },
      uptime: { 
        value: node.uptime.toString(), 
        unit: '%', 
        label: 'Uptime' 
      }
    },
    realtime: {
      currentLoad: { 
        value: node.energyCapacity.currentLoad.toString(), 
        unit: 'kW', 
        label: 'Current Load' 
      },
      available: { 
        value: node.energyCapacity.availableCapacity.toString(), 
        unit: 'kW', 
        label: 'Available' 
      },
      batteryLevel: node.energyCapacity.energyType === 'solar' ? {
        value: '78',
        unit: '%',
        label: 'Battery'
      } : undefined
    }
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={node.image || "/placeholder.svg"}
            alt={node.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Status Badges */}
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            {node.isAvailable ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-700">
                Available
              </Badge>
            ) : (
              <Badge variant="secondary">
                Booked
              </Badge>
            )}
            
            {showDemoMode && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Demo Mode
              </Badge>
            )}
          </div>

          {/* Energy Status Indicator */}
          <div className="absolute left-2 top-2">
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              node.energyCapacity.status === 'online' 
                ? 'bg-green-100 text-green-800' 
                : node.energyCapacity.status === 'maintenance'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                node.energyCapacity.status === 'online' 
                  ? 'bg-green-500' 
                  : node.energyCapacity.status === 'maintenance'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`} />
              {node.energyCapacity.status === 'online' ? 'Online' : 
               node.energyCapacity.status === 'maintenance' ? 'Maintenance' : 'Offline'}
            </div>
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{node.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {node.location}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Energy Information Section */}
          <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">{energyInfo.primary.icon}</div>
              <div>
                <div className="font-semibold text-emerald-800 text-sm">
                  {energyInfo.primary.title}
                </div>
                <div className="text-xs text-emerald-600">
                  {energyInfo.primary.subtitle}
                </div>
              </div>
            </div>

            {/* Energy Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1 text-emerald-700">
                <Zap className="h-3 w-3" />
                <span className="font-medium">{energyInfo.metrics.capacity.value} {energyInfo.metrics.capacity.unit}</span>
              </div>

              <div className="flex items-center gap-1 text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">{energyInfo.metrics.efficiency.value}%</span>
              </div>

              <div className="flex items-center gap-1 text-emerald-700">
                <Activity className="h-3 w-3" />
                <span className="font-medium">{energyInfo.realtime.currentLoad.value} kW</span>
              </div>

              <div className="flex items-center gap-1 text-emerald-700">
                <Battery className="h-3 w-3" />
                <span className="font-medium">{energyInfo.realtime.available.value} kW</span>
              </div>
            </div>

            {/* Carbon Offset */}
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
              <Leaf className="h-3 w-3" />
              <span>{energyInfo.metrics.carbonOffset.value} {energyInfo.metrics.carbonOffset.unit} CO₂ offset</span>
            </div>
          </div>

          {/* Rating and Uptime */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{node.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>{node.uptime}% uptime</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            {node.amenities.slice(0, 2).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {node.amenities.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{node.amenities.length - 2}
              </Badge>
            )}
          </div>

          {/* Price and Booking Section */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {node.pricing[1]?.dailyRate || '0.05'} ETH
              </div>
              <div className="text-xs text-muted-foreground">
                per day • ~${node.pricing[1]?.fiatEquivalent.usd || 150}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                disabled={!node.isAvailable} 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onBook(node.id)}
              >
                {node.isAvailable ? "Book Now" : "Unavailable"}
              </Button>
              {showDemoMode && (
                <div className="text-xs text-center text-muted-foreground">
                  Demo Mode
                </div>
              )}
            </div>
          </div>

          {/* Detailed View Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-xs"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>

          {/* Detailed Information */}
          {showDetails && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="text-sm">
                <div className="font-medium mb-2">Energy System Details:</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>• Total Capacity: {node.energyCapacity.totalCapacity} kW</div>
                  <div>• Available: {node.energyCapacity.availableCapacity} kW</div>
                  <div>• Current Load: {node.energyCapacity.currentLoad} kW</div>
                  <div>• Efficiency: {node.energyCapacity.efficiency}%</div>
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium mb-2">Environmental Impact:</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>• CO₂ Offset: {node.carbonOffset} tons/month</div>
                  <div>• System Uptime: {node.uptime}%</div>
                  <div>• Energy Type: {node.energyCapacity.energyType}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  )
}

// Helper function to get energy icon based on type
function getEnergyIcon(energyType: string): "🔋" | "⚡" | "🌱" | "🌊" | "💨" {
  const iconMap = {
    solar: "🔋" as const,
    wind: "💨" as const,
    geothermal: "🌱" as const,
    hydroelectric: "🌊" as const,
    hybrid: "⚡" as const
  }
  
  return iconMap[energyType as keyof typeof iconMap] || "🔋"
}
