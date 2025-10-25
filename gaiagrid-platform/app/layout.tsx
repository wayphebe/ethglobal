import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Web3Provider } from "@/lib/web3-context"
import { Web3ErrorBoundary } from "@/components/web3-error-boundary"
import { Navbar } from "@/components/navbar"
import { ChromeExtensionWarning } from "@/components/chrome-extension-warning"
import "./globals.css"

import { Inter, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

const _inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "GaiaGrid - Decentralized Energy & Space Network",
  description:
    "The world's first blockchain-based distributed energy and space coordination protocol for digital nomads",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`font-sans antialiased`} suppressHydrationWarning={true}>
        <Web3ErrorBoundary>
          <Web3Provider>
            <ChromeExtensionWarning />
            <Navbar />
            {children}
          </Web3Provider>
        </Web3ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
