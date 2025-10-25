// Error handling utilities for Chrome extension conflicts

export function isChromeExtensionError(error: any): boolean {
  if (!error) return false
  
  const errorMessage = error.message || error.toString()
  return errorMessage.includes('chrome.runtime.sendMessage') || 
         errorMessage.includes('Extension context invalidated') ||
         errorMessage.includes('Extension ID') ||
         errorMessage.includes('NETWORK_ERROR') ||
         errorMessage.includes('network changed') ||
         errorMessage.includes('Cannot read properties of undefined')
}

export function handleChromeExtensionError(error: any, context: string = 'Unknown'): void {
  if (isChromeExtensionError(error)) {
    console.warn(`Chrome extension communication error in ${context} (non-critical):`, error.message)
    return
  }
  
  // Re-throw non-extension errors
  throw error
}

export function createSafeAsyncFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string = 'Unknown'
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      if (isChromeExtensionError(error)) {
        console.warn(`Chrome extension communication error in ${context} (non-critical):`, error)
        return null
      }
      throw error
    }
  }
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers(): () => void {
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (isChromeExtensionError(event.reason)) {
      console.warn('Chrome extension communication error (non-critical):', event.reason)
      event.preventDefault()
      return
    }
  }

  const handleError = (event: ErrorEvent) => {
    if (isChromeExtensionError(event.error)) {
      console.warn('Chrome extension communication error (non-critical):', event.error)
      event.preventDefault()
      return false
    }
  }

  // Add event listeners
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('error', handleError)

  // Return cleanup function
  return () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('error', handleError)
  }
}
