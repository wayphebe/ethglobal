"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Zap, Users, Star, Search, Filter } from "lucide-react"

// Mock data for energy nodes
const MOCK_NODES = [
  {
    id: 1,
    name: "Bali Solar Hub",
    location: "Ubud, Bali, Indonesia",
    coordinates: { lat: -8.5069, lng: 115.2625 },
    capacity: "25 kW",
    available: true,
    price: "0.05 ETH/day",
    rating: 4.8,
    amenities: ["High-speed WiFi", "Co-working Space", "Solar Powered"],
    image: "/bali-solar-workspace.jpg",
    operator: "0x1234...5678",
  },
  {
    id: 2,
    name: "Costa Rica Eco Lodge",
    location: "Monteverde, Costa Rica",
    coordinates: { lat: 10.3009, lng: -84.8249 },
    capacity: "40 kW",
    available: true,
    price: "0.08 ETH/day",
    rating: 4.9,
    amenities: ["Private Rooms", "Restaurant", "Hydroelectric Power"],
    image: "/costa-rica-eco-lodge.jpg",
    operator: "0xabcd...efgh",
  },
  {
    id: 3,
    name: "Portugal Wind Station",
    location: "Lagos, Portugal",
    coordinates: { lat: 37.1028, lng: -8.6731 },
    capacity: "60 kW",
    available: false,
    price: "0.12 ETH/day",
    rating: 4.7,
    amenities: ["Ocean View", "Gym", "Wind Powered"],
    image: "/portugal-wind-station.jpg",
    operator: "0x9876...5432",
  },
  {
    id: 4,
    name: "Thailand Beach Node",
    location: "Koh Phangan, Thailand",
    coordinates: { lat: 9.7384, lng: 100.0083 },
    capacity: "30 kW",
    available: true,
    price: "0.06 ETH/day",
    rating: 4.6,
    amenities: ["Beach Access", "Yoga Studio", "Solar Powered"],
    image: "/thailand-beach-workspace.jpg",
    operator: "0x5555...6666",
  },
  {
    id: 5,
    name: "Iceland Geothermal Base",
    location: "Reykjavik, Iceland",
    coordinates: { lat: 64.1466, lng: -21.9426 },
    capacity: "100 kW",
    available: true,
    price: "0.15 ETH/day",
    rating: 5.0,
    amenities: ["Hot Springs", "Conference Room", "Geothermal Power"],
    image: "/iceland-geothermal-workspace.jpg",
    operator: "0x7777...8888",
  },
  {
    id: 6,
    name: "Morocco Desert Camp",
    location: "Merzouga, Morocco",
    coordinates: { lat: 31.0801, lng: -4.0133 },
    capacity: "20 kW",
    available: true,
    price: "0.04 ETH/day",
    rating: 4.5,
    amenities: ["Desert Views", "Traditional Meals", "Solar Powered"],
    image: "/morocco-desert-camp.jpg",
    operator: "0x3333...4444",
  },
]

export default function NodesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAvailable, setFilterAvailable] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")

  const filteredNodes = MOCK_NODES.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAvailability = filterAvailable === "all" || (filterAvailable === "available" && node.available)
    return matchesSearch && matchesAvailability
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "price") return Number.parseFloat(a.price) - Number.parseFloat(b.price)
    return 0
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Discover Energy Nodes</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Find sustainable workspaces and living spaces powered by renewable energy
          </p>
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
                <Card key={node.id} className="overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <img
                      src={node.image || "/placeholder.svg"}
                      alt={node.name}
                      className="h-full w-full object-cover"
                    />
                    {node.available ? (
                      <Badge className="absolute right-2 top-2 bg-emerald-600">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="absolute right-2 top-2">
                        Booked
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{node.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {node.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">{node.capacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{node.rating}</span>
                      </div>
                    </div>

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

                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <div className="text-2xl font-bold text-foreground">{node.price}</div>
                        <div className="text-xs text-muted-foreground">per day</div>
                      </div>
                      <Button disabled={!node.available} className="bg-emerald-600 hover:bg-emerald-700">
                        {node.available ? "Book Now" : "Unavailable"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
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
                  {MOCK_NODES.reduce((sum, node) => sum + Number.parseInt(node.capacity), 0)} kW
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
                <div className="text-2xl font-bold text-foreground">{MOCK_NODES.filter((n) => n.available).length}</div>
                <div className="text-sm text-muted-foreground">Available Now</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
