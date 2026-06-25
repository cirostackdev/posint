module.exports = {
  globDirectory: 'public/',
  globPatterns: ['**/*'],
  globIgnores: ['**/sw.js'],
  swDest: 'public/sw.js',
  runtimeCaching: [
    {
      // App shell — stale-while-revalidate
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // API responses — network-first with offline fallback
      urlPattern: /^https?:\/\/.*\/api\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-responses',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 10,
        backgroundSync: {
          name: 'api-queue',
          options: { maxRetentionTime: 60 * 24 }, // 24 hours
        },
      },
    },
    {
      // Images — cache-first
      urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // Google Fonts — cache-first
      urlPattern: /^https?:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
};
