import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { NetworkStatus } from "@/components/network-status"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-foreground">
            GaiaGrid
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/nodes" className="text-sm text-muted-foreground hover:text-foreground">
              Explore Nodes
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/governance" className="text-sm text-muted-foreground hover:text-foreground">
              Governance
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NetworkStatus />
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  )
}
