"use client"

import { useEffect, useState } from "react"
import { WifiOff, RefreshCw, X } from "lucide-react"
import { skipWaitingAndReload } from "@/shared/lib/sw-register"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => { setIsOffline(true); setDismissed(false) }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail
      setUpdateAvailable(true)
      setRegistration(detail.registration)
    }
    window.addEventListener("sw-update-available", handleUpdate)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("sw-update-available", handleUpdate)
    }
  }, [])

  if (dismissed) return null

  if (updateAvailable && registration) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-lg">
          <RefreshCw className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium flex-1">New version available</p>
          <button
            onClick={() => skipWaitingAndReload(registration)}
            className="px-3 py-1 text-xs font-semibold rounded bg-white text-blue-600 hover:opacity-90 transition-opacity"
          >
            Update
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-yellow-950 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>You are offline. Showing cached data.</span>
      </div>
    </div>
  )
}
