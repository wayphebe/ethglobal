"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWeb3 } from "@/lib/web3-context"
import { Wallet, ChevronDown, LogOut, Network } from "lucide-react"

const SUPPORTED_CHAINS = {
  1: "Ethereum",
  137: "Polygon",
  42161: "Arbitrum",
}

export function WalletConnectButton() {
  const { account, chainId, isConnecting, connectWallet, disconnectWallet, switchChain } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (id: number | null) => {
    if (!id) return "Unknown"
    return SUPPORTED_CHAINS[id as keyof typeof SUPPORTED_CHAINS] || `Chain ${id}`
  }

  if (!account) {
    return (
      <Button onClick={connectWallet} disabled={isConnecting} className="gap-2">
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Wallet className="h-4 w-4" />
          {formatAddress(account)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <span className="text-sm font-medium">{getChainName(chainId)}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Switch Network</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => switchChain(1)}>
          <Network className="mr-2 h-4 w-4" />
          Ethereum
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchChain(137)}>
          <Network className="mr-2 h-4 w-4" />
          Polygon
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchChain(42161)}>
          <Network className="mr-2 h-4 w-4" />
          Arbitrum
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
