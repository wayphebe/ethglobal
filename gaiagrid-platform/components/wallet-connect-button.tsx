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
  11155111: "Ethereum Sepolia",
  137: "Polygon",
  42161: "Arbitrum",
  421614: "Arbitrum Sepolia",
}

export function WalletConnectButton() {
  const { 
    account, 
    chainId, 
    isConnecting, 
    walletType,
    balances,
    currentNetwork,
    isSupportedNetwork,
    connectWallet, 
    disconnectWallet, 
    switchChain 
  } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (id: number | null) => {
    if (!id) return "Unknown"
    return SUPPORTED_CHAINS[id as keyof typeof SUPPORTED_CHAINS] || `Chain ${id}`
  }

  const getWalletName = (type: string | null) => {
    if (!type) return "Unknown"
    const walletNames: Record<string, string> = {
      metamask: "MetaMask",
      coinbase: "Coinbase Wallet",
      rainbow: "Rainbow Wallet",
      brave: "Brave Wallet",
      trust: "Trust Wallet",
      unknown: "Unknown Wallet"
    }
    return walletNames[type] || "Unknown Wallet"
  }

  const getPrimaryBalance = () => {
    if (!balances || balances.length === 0) return "0.00"
    return balances[0]?.balanceFormatted || "0.00"
  }

  const getPrimarySymbol = () => {
    if (!balances || balances.length === 0) return "ETH"
    return balances[0]?.symbol || "ETH"
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
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{formatAddress(account)}</span>
            <span className="text-xs text-muted-foreground">
              {getPrimaryBalance()} {getPrimarySymbol()}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col items-start">
          <span className="font-medium">{getWalletName(walletType)}</span>
          <span className="text-xs text-muted-foreground">{formatAddress(account)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Balance Display */}
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Balance</DropdownMenuLabel>
        {balances.map((balance, index) => (
          <DropdownMenuItem key={index} className="flex items-center justify-between">
            <span className="text-sm">{balance.symbol}</span>
            <span className="text-sm font-medium">{balance.balanceFormatted}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Network Display */}
        <DropdownMenuItem className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <span className={`text-sm font-medium ${isSupportedNetwork ? 'text-green-600' : 'text-red-600'}`}>
            {currentNetwork || getChainName(chainId)}
          </span>
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
