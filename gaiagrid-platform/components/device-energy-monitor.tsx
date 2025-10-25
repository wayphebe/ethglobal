"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  Sun, 
  Battery, 
  Monitor, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { UserDevice, IoTDataPoint } from "@/lib/types/energy"

interface DeviceEnergyMonitorProps {
  devices: UserDevice[]
  realTimeData: IoTDataPoint[]
  onDeviceSelect: (deviceId: string) => void
  showOptimizationTips: boolean
}

export function DeviceEnergyMonitor({ 
  devices, 
  realTimeData, 
  onDeviceSelect,
  showOptimizationTips = true 
}: DeviceEnergyMonitorProps) {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  // Get real-time data for each device
  const getDeviceCurrentData = (deviceId: string): IoTDataPoint | null => {
    return realTimeData.find(data => data.deviceId === deviceId) || null
  }

  // Get device icon based on type
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'ai_render': return <Monitor className="h-5 w-5 text-blue-600" />
      case 'solar_panel': return <Sun className="h-5 w-5 text-yellow-600" />
      case 'battery': return <Battery className="h-5 w-5 text-green-600" />
      case 'general': return <Zap className="h-5 w-5 text-purple-600" />
      default: return <Zap className="h-5 w-5 text-gray-600" />
    }
  }

  // Get status indicator
  const getStatusIndicator = (device: UserDevice, data: IoTDataPoint | null) => {
    if (device.status === 'offline') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (data?.quality === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (data?.quality === 'warning') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  // Calculate efficiency trend
  const getEfficiencyTrend = (device: UserDevice, data: IoTDataPoint | null) => {
    if (!data) return null
    
    const expectedPower = device.type === 'solar_panel' ? 8 : 2
    const actualPower = data.power
    const efficiency = actualPower / expectedPower
    
    if (efficiency > 1.1) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (efficiency < 0.9) return <TrendingDown className="h-4 w-4 text-red-500" />
    return null
  }

  // Format power value
  const formatPower = (power: number) => {
    return `${power.toFixed(1)} kW`
  }

  // Format energy value
  const formatEnergy = (energy: number) => {
    return `${energy.toFixed(2)} kWh`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Device Energy Monitor
        </CardTitle>
        <CardDescription>
          Real-time energy consumption and generation by device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices.map((device) => {
            const currentData = getDeviceCurrentData(device.id)
            const isSelected = selectedDevice === device.id
            
            return (
              <div
                key={device.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-border hover:border-blue-300'
                }`}
                onClick={() => {
                  setSelectedDevice(isSelected ? null : device.id)
                  onDeviceSelect(device.id)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-semibold text-sm">{device.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {device.location} • {device.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIndicator(device, currentData)}
                    {getEfficiencyTrend(device, currentData)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Current Power</div>
                    <div className="font-semibold">
                      {currentData ? formatPower(currentData.power) : '0.0 kW'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Daily Usage</div>
                    <div className="font-semibold">
                      {formatEnergy(device.dailyConsumption)}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Efficiency</span>
                    <span>{device.efficiency * 100}%</span>
                  </div>
                  <Progress value={device.efficiency * 100} className="h-2" />
                </div>

                {showOptimizationTips && device.recommendations.length > 0 && (
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">Recommendation</span>
                    </div>
                    <div className="text-muted-foreground">
                      {device.recommendations[0]}
                    </div>
                  </div>
                )}

                {isSelected && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground">Voltage</div>
                        <div className="font-medium">
                          {currentData ? `${currentData.voltage?.toFixed(1)}V` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-medium">
                          {currentData ? `${currentData.current?.toFixed(1)}A` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Temperature</div>
                        <div className="font-medium">
                          {currentData ? `${currentData.temperature?.toFixed(1)}°C` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Quality</div>
                        <div className="font-medium capitalize">
                          {currentData?.quality || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Devices Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your energy devices to start monitoring consumption and generation.
            </p>
            <Button size="sm">Add Device</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
