// Static export service worker for PWA functionality with automatic cache refresh

// Use a cache version that changes only when you want to force an update
// Increment this version number when you deploy a new version of your app
const CACHE_VERSION = "itiket-pwa-v1.7"; // Updated to version 1.1.0
const CACHE_NAME = CACHE_VERSION;

const urlsToCache = [
  "/",
  "/events",
  "/login",
  "/profile",
  "/scan",
  "/manifest.json",
  "/ALogo.png",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
  // Dana font files
  "/Webfonts/css/fontiran.css",
  "/Webfonts/css/style.css",
  "/Webfonts/woff2/Dana-Thin.woff2",
  "/Webfonts/woff2/Dana-UltraLight.woff2",
  "/Webfonts/woff2/Dana-Light.woff2",
  "/Webfonts/woff2/Dana-Regular.woff2",
  "/Webfonts/woff2/Dana-Medium.woff2",
  "/Webfonts/woff2/Dana-DemiBold.woff2",
  "/Webfonts/woff2/Dana-Bold.woff2",
  "/Webfonts/woff2/Dana-ExtraBold.woff2",
  "/Webfonts/woff2/Dana-Black.woff2",
];

// Install a service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache with name:", CACHE_NAME);
      return cache.addAll(urlsToCache);
    })
  );
  // Immediately take control of the page
  self.skipWaiting();
});

// Take control of all clients immediately after activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Delete old caches
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("New service worker activated and old caches cleared");
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Cache and return requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch online if not in cache
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CHECK_UPDATE") {
    // Respond with current cache version for comparison
    event.ports[0].postMessage({
      type: "CACHE_VERSION",
      version: CACHE_NAME,
    });
  }
});
