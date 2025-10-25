"use client"

import { Component, ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class Web3ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Check if this is a Chrome extension error or initialization error
    const isChromeError = error.message?.includes('chrome.runtime.sendMessage') ||
                         error.message?.includes('Extension context invalidated') ||
                         error.message?.includes('NETWORK_ERROR')
    
    const isInitializationError = error.message?.includes('Cannot access') ||
                                 error.message?.includes('before initialization') ||
                                 error.message?.includes('refreshBalances')
    
    if (isChromeError || isInitializationError) {
      console.warn('Non-critical error caught by boundary:', error.message)
      // Don't show error boundary for Chrome extension or initialization errors
      this.setState({ hasError: false })
      return
    }
    
    console.error('Web3 Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="border-red-200 bg-red-50 text-red-800 m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Web3 Connection Error:</strong> There was a problem connecting to your wallet.
              <br />
              <span className="text-sm text-red-600">
                {this.state.error?.message || 'Unknown error occurred'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}
