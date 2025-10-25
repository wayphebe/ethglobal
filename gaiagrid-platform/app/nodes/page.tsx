"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Zap, Users, Star, Search, Filter, HelpCircle, BookOpen } from "lucide-react"
import { EnergyNode, BookingRequest } from "@/lib/types/booking"
import { EnergyNodeCard } from "@/components/energy-node-card"
import { BookingForm } from "@/components/booking-form"
import { UserEducationModal } from "@/components/user-education"

// Enhanced mock data for energy nodes with detailed energy capacity information
const MOCK_NODES: EnergyNode[] = [
  {
    id: "bali-solar",
    name: "Bali Solar Hub",
    location: "Ubud, Bali, Indonesia",
    coordinates: { lat: -8.5069, lng: 115.2625 },
    energyCapacity: {
      totalCapacity: 25,
      availableCapacity: 18,
      currentLoad: 7,
      efficiency: 95,
      description: "High-efficiency solar panels with battery storage",
      energyType: "solar",
      status: "online"
    },
    pricing: {
      1: { dailyRate: "0.05", fiatEquivalent: { usd: 150, eur: 127.5 }, currency: "ETH", gasEstimate: "0.005" },
      137: { dailyRate: "50", fiatEquivalent: { usd: 150, eur: 127.5 }, currency: "MATIC", gasEstimate: "0.00001" },
      42161: { dailyRate: "0.05", fiatEquivalent: { usd: 150, eur: 127.5 }, currency: "ETH", gasEstimate: "0.0005" }
    },
    isAvailable: true,
    rating: 4.8,
    amenities: ["High-speed WiFi", "Co-working Space", "Solar Powered", "Battery Storage"],
    image: "/bali-solar-workspace.jpg",
    operator: "0x1234...5678",
    carbonOffset: 2.1,
    uptime: 99.2
  },
  {
    id: "costa-rica-eco",
    name: "Costa Rica Eco Lodge",
    location: "Monteverde, Costa Rica",
    coordinates: { lat: 10.3009, lng: -84.8249 },
    energyCapacity: {
      totalCapacity: 40,
      availableCapacity: 25,
      currentLoad: 15,
      efficiency: 88,
      description: "Hydroelectric power with grid backup",
      energyType: "hydroelectric",
      status: "online"
    },
    pricing: {
      1: { dailyRate: "0.08", fiatEquivalent: { usd: 200, eur: 170 }, currency: "ETH", gasEstimate: "0.005" },
      137: { dailyRate: "80", fiatEquivalent: { usd: 200, eur: 170 }, currency: "MATIC", gasEstimate: "0.00001" },
      42161: { dailyRate: "0.08", fiatEquivalent: { usd: 200, eur: 170 }, currency: "ETH", gasEstimate: "0.0005" }
    },
    isAvailable: true,
    rating: 4.9,
    amenities: ["Private Rooms", "Restaurant", "Hydroelectric Power", "Nature Trails"],
    image: "/costa-rica-eco-lodge.jpg",
    operator: "0xabcd...efgh",
    carbonOffset: 3.2,
    uptime: 98.8
  },
  {
    id: "portugal-wind",
    name: "Portugal Wind Station",
    location: "Lagos, Portugal",
    coordinates: { lat: 37.1028, lng: -8.6731 },
    energyCapacity: {
      totalCapacity: 60,
      availableCapacity: 0,
      currentLoad: 60,
      efficiency: 92,
      description: "Wind turbines with smart grid integration",
      energyType: "wind",
      status: "online"
    },
    pricing: {
      1: { dailyRate: "0.12", fiatEquivalent: { usd: 180, eur: 153 }, currency: "ETH", gasEstimate: "0.005" },
      137: { dailyRate: "120", fiatEquivalent: { usd: 180, eur: 153 }, currency: "MATIC", gasEstimate: "0.00001" },
      42161: { dailyRate: "0.12", fiatEquivalent: { usd: 180, eur: 153 }, currency: "ETH", gasEstimate: "0.0005" }
    },
    isAvailable: false,
    rating: 4.7,
    amenities: ["Ocean View", "Gym", "Wind Powered", "Smart Grid"],
    image: "/portugal-wind-station.jpg",
    operator: "0x9876...5432",
    carbonOffset: 4.5,
    uptime: 97.5
  },
  {
    id: "thailand-beach",
    name: "Thailand Beach Node",
    location: "Koh Phangan, Thailand",
    coordinates: { lat: 9.7384, lng: 100.0083 },
    energyCapacity: {
      totalCapacity: 30,
      availableCapacity: 22,
      currentLoad: 8,
      efficiency: 90,
      description: "Solar panels with backup generator",
      energyType: "solar",
      status: "online"
    },
    pricing: {
      1: { dailyRate: "0.06", fiatEquivalent: { usd: 120, eur: 102 }, currency: "ETH", gasEstimate: "0.005" },
      137: { dailyRate: "60", fiatEquivalent: { usd: 120, eur: 102 }, currency: "MATIC", gasEstimate: "0.00001" },
      42161: { dailyRate: "0.06", fiatEquivalent: { usd: 120, eur: 102 }, currency: "ETH", gasEstimate: "0.0005" }
    },
    isAvailable: true,
    rating: 4.6,
    amenities: ["Beach Access", "Yoga Studio", "Solar Powered", "Backup Generator"],
    image: "/thailand-beach-workspace.jpg",
    operator: "0x5555...6666",
    carbonOffset: 1.8,
    uptime: 96.3
  },
  {
    id: "iceland-geothermal",
    name: "Iceland Geothermal Base",
    location: "Reykjavik, Iceland",
    coordinates: { lat: 64.1466, lng: -21.9426 },
    energyCapacity: {
      totalCapacity: 100,
      availableCapacity: 60,
      currentLoad: 40,
      efficiency: 98,
      description: "Geothermal power plant with district heating",
      energyType: "geothermal",
      status: "online"
    },
    pricing: {
      1: { dailyRate: "0.15", fiatEquivalent: { usd: 250, eur: 212.5 }, currency: "ETH", gasEstimate: "0.005" },
      137: { dailyRate: "150", fiatEquivalent: { usd: 250, eur: 212.5 }, currency: "MATIC", gasEstimate: "0.00001" },
      42161: { dailyRate: "0.15", fiatEquivalent: { usd: 250, eur: 212.5 }, currency: "ETH", gasEstimate: "0.0005" }
    },
    isAvailable: true,
    rating: 5.0,
    amenities: ["Hot Springs", "Conference Room", "Geothermal Power", "District Heating"],
    image: "/iceland-geothermal-workspace.jpg",
    operator: "0x7777...8888",
    carbonOffset: 6.8,
    uptime: 99.9
  },
  {
    id: "morocco-desert",
    name: "Morocco Desert Camp",
    location: "Merzouga, Morocco",
    coordinates: { lat: 31.0801, lng: -4.0133 },
    energyCapacity: {
      totalCapacity: 20,
      availableCapacity: 15,
      currentLoad: 5,
      efficiency: 85,
      description: "Solar panels with battery storage for desert conditions",
      energyType: "solar",
      status: "online"
    },
    pricing: {
      1: { dailyRate: "0.04", fiatEquivalent: { usd: 100, eur: 85 }, currency: "ETH", gasEstimate: "0.005" },
      137: { dailyRate: "40", fiatEquivalent: { usd: 100, eur: 85 }, currency: "MATIC", gasEstimate: "0.00001" },
      42161: { dailyRate: "0.04", fiatEquivalent: { usd: 100, eur: 85 }, currency: "ETH", gasEstimate: "0.0005" }
    },
    isAvailable: true,
    rating: 4.5,
    amenities: ["Desert Views", "Traditional Meals", "Solar Powered", "Battery Storage"],
    image: "/morocco-desert-camp.jpg",
    operator: "0x3333...4444",
    carbonOffset: 1.2,
    uptime: 94.7
  },
]

export default function NodesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAvailable, setFilterAvailable] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [selectedNode, setSelectedNode] = useState<EnergyNode | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showEducation, setShowEducation] = useState(false)
  const [bookings, setBookings] = useState<BookingRequest[]>([])

  const filteredNodes = MOCK_NODES.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAvailability = filterAvailable === "all" || (filterAvailable === "available" && node.isAvailable)
    return matchesSearch && matchesAvailability
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "price") return Number.parseFloat(a.pricing[1]?.dailyRate || "0") - Number.parseFloat(b.pricing[1]?.dailyRate || "0")
    return 0
  })

  const handleBookNode = (nodeId: string) => {
    const node = MOCK_NODES.find(n => n.id === nodeId)
    if (node) {
      setSelectedNode(node)
      setShowBookingForm(true)
    }
  }

  const handleBookingSuccess = (booking: BookingRequest) => {
    setBookings(prev => [...prev, booking])
    setShowBookingForm(false)
    setSelectedNode(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Discover Energy Nodes</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Find sustainable workspaces and living spaces powered by renewable energy
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEducation(true)}
                className="flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Learn More
              </Button>
              {bookings.length > 0 && (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  My Bookings ({bookings.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by location or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAvailable} onValueChange={setFilterAvailable}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Nodes</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price">Lowest Price</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for Map and List View */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNodes.map((node) => (
                <EnergyNodeCard
                  key={node.id}
                  node={node}
                  onBook={handleBookNode}
                  showDemoMode={true}
                />
              ))}
            </div>

            {filteredNodes.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No nodes found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-[600px] w-full bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium text-foreground">Interactive Map</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Map integration with Mapbox or Google Maps would be implemented here
                      </p>
                      <div className="mt-6 grid gap-4 text-left">
                        {filteredNodes.slice(0, 3).map((node) => (
                          <div
                            key={node.id}
                            className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
                          >
                            <MapPin className="h-5 w-5 text-emerald-600" />
                            <div className="flex-1">
                              <div className="font-medium">{node.name}</div>
                              <div className="text-sm text-muted-foreground">{node.location}</div>
                            </div>
                            <Badge variant={node.available ? "default" : "secondary"}>
                              {node.available ? "Available" : "Booked"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="mt-12 grid gap-6 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{MOCK_NODES.length}</div>
                <div className="text-sm text-muted-foreground">Total Nodes</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {MOCK_NODES.reduce((sum, node) => sum + node.energyCapacity.totalCapacity, 0)} kW
                </div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{MOCK_NODES.filter((n) => n.isAvailable).length}</div>
                <div className="text-sm text-muted-foreground">Available Now</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{bookings.length}</div>
                <div className="text-sm text-muted-foreground">Your Bookings</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form Modal */}
        <BookingForm
          node={selectedNode}
          isOpen={showBookingForm}
          onClose={() => {
            setShowBookingForm(false)
            setSelectedNode(null)
          }}
          onBookingSuccess={handleBookingSuccess}
          showDemoMode={true}
        />

        {/* User Education Modal */}
        <UserEducationModal
          isOpen={showEducation}
          onClose={() => setShowEducation(false)}
        />
      </div>
    </div>
  )
}
