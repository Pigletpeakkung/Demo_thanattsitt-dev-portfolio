// ============================================
// SERVICE WORKER - THANNXAI PORTFOLIO PWA
// ============================================

const CACHE_NAME = 'thannxai-portfolio-v1.2.0';
const STATIC_CACHE = 'thannxai-static-v1.2.0';
const DYNAMIC_CACHE = 'thannxai-dynamic-v1.2.0';
const IMAGE_CACHE = 'thannxai-images-v1.2.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  
  // Icons
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  
  // Core Libraries
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
  'https://unpkg.com/aos@2.3.1/dist/aos.js',
  'https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.16/typed.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.8.0/countUp.umd.js',
  'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js',
  
  // Images (add your actual image paths)
  '/assets/images/hero-bg.jpg',
  '/assets/images/profile.jpg',
  '/assets/images/logo.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  
  // Offline page
  '/offline.html'
];

// URLs that should always be fetched from network
const NETWORK_FIRST_URLS = [
  '/api/',
  'https://api.',
  'https://analytics.',
  'https://www.google-analytics.com/',
  'https://www.googletagmanager.com/'
];

// Image URLs to cache
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {
          cache: 'reload'
        })));
      }),
      
      // Create other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker: Installation complete');
      // Force activation
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ Service Worker: Installation failed', error);
    })
  );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activation complete');
      
      // Notify all clients about the update
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            message: 'Service Worker activated successfully!'
          });
        });
      });
    })
  );
});

// ============================================
// FETCH EVENT - MAIN CACHING STRATEGY
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isNetworkFirstUrl(request.url)) {
    event.respondWith(handleNetworkFirst(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleCacheFirst(request));
  } else {
    event.respondWith(handleStaleWhileRevalidate(request));
  }
});

// ============================================
// CACHING STRATEGIES
// ============================================

// Cache First Strategy (for static assets)
async function handleCacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return getOfflineResponse(request);
  }
}

// Network First Strategy (for API calls)
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineResponse(request);
  }
}

// Stale While Revalidate Strategy (for dynamic content)
async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Image Caching Strategy
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Return cached image and update in background
      fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      }).catch(() => {
        // Ignore network errors for background updates
      });
      
      return cachedResponse;
    }
    
    // No cached version, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Image request failed:', error);
    
    // Return placeholder image for failed image requests
    return getPlaceholderImage();
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Check if request is for an image
function isImageRequest(request) {
  return IMAGE_EXTENSIONS.some(ext => 
    request.url.toLowerCase().includes(ext)
  ) || request.destination === 'image';
}

// Check if URL should use network-first strategy
function isNetworkFirstUrl(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

// Check if request is for a static asset
function isStaticAsset(request) {
  return STATIC_ASSETS.some(asset => 
    request.url.includes(asset) || request.url.endsWith(asset)
  );
}

// Clean up old caches
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  return Promise.all(
    cacheNames.map(cacheName => {
      if (!currentCaches.includes(cacheName)) {
        console.log('🗑️ Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

// Get offline response based on request type
async function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return offline page
  if (request.headers.get('accept').includes('text/html')) {
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response(
      getOfflineHTML(),
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
  
  // For images, return placeholder
  if (isImageRequest(request)) {
    return getPlaceholderImage();
  }
  
  // For other requests, return basic offline response
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'This content is not available offline' 
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    }
  );
}

// Generate placeholder image (SVG)
function getPlaceholderImage() {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="#999" text-anchor="middle" dy=".3em">
        Image unavailable offline
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
    status: 200
  });
}

// Generate offline HTML page
function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - ThannxAI Portfolio</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
        }
        
        .offline-container {
          max-width: 500px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 3rem 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.8;
        }
        
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        
        p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .features {
          margin-top: 2rem;
          text-align: left;
        }
        
        .feature {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .feature::before {
          content: "✓";
          margin-right: 0.5rem;
          color: #4ade80;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>You're Offline</h1>
        <p>
          Don't worry! Some content is still available while you're offline. 
          Check your connection and try again.
        </p>
        
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
        
        <div class="features">
          <div class="feature">Cached pages available</div>
          <div class="feature">Images stored locally</div>
          <div class="feature">Core functionality works</div>
        </div>
      </div>
      
      <script>
        // Auto-retry when online
        window.addEventListener('online', () => {
          window.location.reload();
        });
        
        // Show online/offline status
        function updateOnlineStatus() {
          if (navigator.onLine) {
            window.location.reload();
          }
        }
        
        window.addEventListener('online', updateOnlineStatus);
        
        // Check connection periodically
        setInterval(() => {
          if (navigator.onLine) {
            fetch('/', { method: 'HEAD', cache: 'no-cache' })
              .then(() => window.location.reload())
              .catch(() => {});
          }
        }, 30000);
      </script>
    </body>
    </html>
  `;
}

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data
    console.log('📡 Performing background sync...');
    
    // Example: Sync form submissions, analytics, etc.
    await syncPendingData();
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

async function syncPendingData() {
  // Implementation for syncing pending data
  // This could include form submissions, analytics events, etc.
  
  const pendingRequests = await getPendingRequests();
  
  for (const request of pendingRequests) {
    try {
      await fetch(request.url, request.options);
      await removePendingRequest(request.id);
    } catch (error) {
      console.log('Failed to sync request:', request.url);
    }
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: '/assets/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ThannxAI Portfolio', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
        
      case 'CACHE_URLS':
        cacheUrls(event.data.urls).then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
    }
  }
});

// ============================================
// UTILITY FUNCTIONS FOR MESSAGE HANDLING
// ============================================

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return cache.addAll(urls);
}

async function getPendingRequests() {
  // Implementation to get pending requests from IndexedDB
  return [];
}

async function removePendingRequest(id) {
  // Implementation to remove pending request from IndexedDB
}

// ============================================
// CACHE MANAGEMENT
// ============================================

// Periodic cache cleanup
setInterval(async () => {
  try {
    await cleanupExpiredCache();
    console.log('🧹 Cache cleanup completed');
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

async function cleanupExpiredCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');
    
    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime();
      if (now - responseDate > maxAge) {
        await cache.delete(request);
        console.log('🗑️ Removed expired cache:', request.url);
      }
    }
  }
}

// ============================================
// ERROR HANDLING
// ============================================
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker Unhandled Rejection:', event.reason);
});

console.log('🚀 Service Worker loaded successfully!');
