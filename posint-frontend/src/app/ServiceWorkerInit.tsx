"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/shared/lib/sw-register"

export function ServiceWorkerInit() {
  useEffect(() => {
    registerServiceWorker()
  }, [])
  return null
}
