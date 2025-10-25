"use client"

import { useWeb3 } from "@/lib/web3-context"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertTriangle } from "lucide-react"

export function NetworkStatus() {
  const { chainId, isSupportedNetwork, error } = useWeb3()

  if (!chainId) {
    return null
  }

  if (error) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Network Error
      </Badge>
    )
  }

  if (!isSupportedNetwork) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Unsupported Network
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="flex items-center gap-1 bg-emerald-600">
      <Wifi className="h-3 w-3" />
      Connected
    </Badge>
  )
}
