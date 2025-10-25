"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle } from "lucide-react"

export function ChromeExtensionWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the warning
    const dismissedWarning = localStorage.getItem('gaiagrid-chrome-extension-warning-dismissed')
    if (dismissedWarning) {
      setDismissed(true)
      return
    }

    // Check for Chrome extension conflicts
    const checkForConflicts = () => {
      // Look for common Web3 wallet extensions
      const hasMetaMask = typeof window !== 'undefined' && window.ethereum?.isMetaMask
      const hasCoinbase = typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet
      const hasMultipleWallets = hasMetaMask && hasCoinbase

      if (hasMultipleWallets) {
        setShowWarning(true)
      }
    }

    // Check after a short delay to allow extensions to load
    const timer = setTimeout(checkForConflicts, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setShowWarning(false)
    setDismissed(true)
    localStorage.setItem('gaiagrid-chrome-extension-warning-dismissed', 'true')
  }

  if (!showWarning || dismissed) {
    return null
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>Multiple Web3 Wallets Detected:</strong> You have multiple wallet extensions installed. 
          This may cause conflicts. Please disable unused wallet extensions or use only one at a time.
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="ml-4 text-yellow-800 hover:text-yellow-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
