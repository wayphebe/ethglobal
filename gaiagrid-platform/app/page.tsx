import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Globe, Users, Shield, Leaf, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-blue-50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
              <Leaf className="h-4 w-4" />
              Powered by Blockchain & Renewable Energy
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl">GaiaGrid</h1>

            <p className="mt-6 text-pretty text-xl leading-relaxed text-muted-foreground">
              The world's first decentralized network connecting digital nomads with sustainable energy spaces. Compute
              + Energy + Space, all on-chain.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/nodes">Explore Nodes</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>127 Active Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>2.4 MW Energy Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Redefining Remote Work Infrastructure
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A decentralized protocol that tokenizes real-world energy assets and enables seamless coordination between
            travelers and communities.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-background dark:border-emerald-800 dark:from-emerald-950/20 dark:to-background">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Energy as NFTs</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Tokenize solar panels and storage devices as ERC-721 NFTs. Trade, lease, and monetize real-world energy
                assets on-chain.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-background dark:border-blue-800 dark:from-blue-950/20 dark:to-background">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Global Node Network</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Discover energy-powered workspaces and living spaces worldwide. Book instantly with crypto payments and
                smart contracts.
              </p>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-background dark:border-violet-800 dark:from-violet-950/20 dark:to-background">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">DAO Governance</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Community-driven decision making. Vote on protocol upgrades, node standards, and treasury allocation
                with GAIA tokens.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Shield className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Verified & Secure</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                IoT sensors provide real-time energy data. Smart contracts ensure transparent settlements and dispute
                resolution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <TrendingUp className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Earn Rewards</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Node operators earn GAIA tokens for providing infrastructure. Stake tokens for governance rights and
                revenue sharing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Leaf className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Carbon Neutral</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                100% renewable energy powered. Track your carbon footprint and contribute to global sustainability
                goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How GaiaGrid Works
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Three simple steps to join the decentralized energy network
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Connect Your Wallet</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Link your Web3 wallet (MetaMask, WalletConnect) to access the GaiaGrid protocol. Multi-chain support for
                Ethereum, Polygon, and Arbitrum.
              </p>
            </div>

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Discover & Book Nodes</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Browse available energy nodes on our interactive map. Filter by location, capacity, amenities, and
                price. Book instantly with smart contracts.
              </p>
            </div>

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Work & Earn</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Use clean energy for your remote work. Track consumption in real-time. Earn GAIA tokens through
                participation and governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600">127</div>
            <div className="mt-2 text-sm text-muted-foreground">Active Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">2.4 MW</div>
            <div className="mt-2 text-sm text-muted-foreground">Energy Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-violet-600">3,421</div>
            <div className="mt-2 text-sm text-muted-foreground">Community Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">89%</div>
            <div className="mt-2 text-sm text-muted-foreground">Carbon Reduction</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-br from-emerald-50 via-background to-blue-50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to Join the Energy Revolution?
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Connect your wallet and start exploring sustainable workspaces worldwide.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/nodes">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">Read Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Node Map
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Governance
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Resources</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Whitepaper
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Community</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Forum
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2025 GaiaGrid. Building the future of distributed energy.
          </div>
        </div>
      </footer>
    </div>
  )
}
