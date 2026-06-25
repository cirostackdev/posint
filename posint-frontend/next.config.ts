import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"
import withPWAInit from "@ducanh2912/next-pwa"
import { withSentryConfig } from "@sentry/nextjs"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  skipWaiting: false,
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/v1\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-responses",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 10,
        backgroundSync: {
          name: "api-queue",
          options: { maxRetentionTime: 60 * 24 },
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
} as any)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-dialog", "@radix-ui/react-select"],
  },
  headers: async () => [
    {
      source: "/_next/static/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
  ],
}

const config = withBundleAnalyzer(withPWA(nextConfig))
export default process.env.NODE_ENV === "production"
  ? withSentryConfig(config, {
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
    })
  : config
