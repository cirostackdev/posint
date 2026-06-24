"use client"

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New content available — dispatch custom event for UI notification
          window.dispatchEvent(
            new CustomEvent("sw-update-available", { detail: { registration } })
          )
        }
      })
    })

    // Background sync registration for failed mutations
    if ("sync" in registration) {
      await (registration as any).sync.register("retry-mutations")
    }

    console.info("[SW] Service worker registered successfully")
  } catch (error) {
    console.error("[SW] Registration failed:", error)
  }
}

export function skipWaitingAndReload(registration: ServiceWorkerRegistration) {
  registration.waiting?.postMessage({ type: "SKIP_WAITING" })
  window.location.reload()
}
