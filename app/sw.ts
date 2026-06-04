import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist, StaleWhileRevalidate, CacheFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // 1. Cache SawaFlix Backend API Requests (Stale While Revalidate)
    // This allows instant UI loading from cache while fetching fresh data
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/content') || url.pathname.startsWith('/api/videos'),
      handler: new StaleWhileRevalidate({
        cacheName: 'sawaflix-api-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    // 2. Cache External Images and Thumbnails (Cache First)
    {
      matcher: ({ url }) => 
        url.hostname.includes('ytimg.com') || 
        url.hostname.includes('ibb.co') || 
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('sanity.io'),
      handler: new CacheFirst({
        cacheName: 'sawaflix-image-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
