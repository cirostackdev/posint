export const QUEUE_NAMES = {
  SCRAPE_NASS: 'scrape-nass',
  SCRAPE_EFCC: 'scrape-efcc',
  SCRAPE_INEC: 'scrape-inec',
  FETCH_SOCIAL: 'fetch-social',
  COMPUTE_SENTIMENT: 'compute-sentiment',
  COMPUTE_STATS: 'compute-stats',
  WARM_CACHE: 'warm-cache',
  CLEANUP: 'cleanup',
  RECONCILE_COUNTERS: 'reconcile-counters',
} as const
