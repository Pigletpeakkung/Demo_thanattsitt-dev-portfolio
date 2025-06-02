const CACHE_NAME = 'thannxai-portfolio-v2.0.0';
const STATIC_CACHE = 'thannxai-static-v2.0.0';
const DYNAMIC_CACHE = 'thannxai-dynamic-v2.0.0';
const API_CACHE = 'thannxai-api-v2.0.0';

// Enhanced static assets with online images
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json',
  '/offline.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js'
];

// Critical online images to cache
const CRITICAL_IMAGES = [
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=500&h=500',
  'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
  'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
  'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=800&h=600'
];

// Install event with enhanced caching
self.addEventListener('install', event => {
  console.log('🚀 ThannxAI Service Worker v2.0.0 installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache critical images
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('🖼️ Caching critical images...');
        return cache.addAll(CRITICAL_IMAGES);
      })
    ])
    .then(() => {
      console.log('✅ All assets cached successfully');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('❌ Failed to cache assets:', error);
    })
  );
});

// Enhanced activate event
self.addEventListener('activate', event => {
  console.log('🔄 ThannxAI Service Worker v2.0.0 activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim(),
      // Set up background sync
      self.registration.sync?.register('background-sync')
    ])
    .then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

// Enhanced fetch handler with intelligent caching
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http(s) protocols
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(handlePageRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Page request handler with stale-while-revalidate
async function handlePageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    const networkPromise = fetch(request);

    if (cachedResponse) {
      // Return cached version immediately, update in background
      networkPromise.then(response => {
        if (response.ok) {
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, response.clone());
          });
        }
      }).catch(() => {
        // Network failed, but we have cache
      });
      
      return cachedResponse;
    }

    // No cache, wait for network
    const response = await networkPromise;
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;

  } catch (error) {
    console.error('Page request failed:', error);
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Image request handler with progressive enhancement
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;

  } catch (error) {
    console.error('Image request failed:', error);
    
    // Return optimized placeholder SVG
    const placeholder = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6e40c9;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#ff6b9d;stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <circle cx="200" cy="120" r="30" fill="#6e40c9" opacity="0.3"/>
        <rect x="150" y="180" width="100" height="8" rx="4" fill="#6e40c9" opacity="0.2"/>
        <rect x="170" y="200" width="60" height="6" rx="3" fill="#6e40c9" opacity="0.1"/>
        <text x="200" y="250" text-anchor="middle" fill="#6e40c9" font-family="Inter, sans-serif" font-size="14" opacity="0.7">Loading...</text>
      </svg>
    `;
    
    return new Response(placeholder, {
      headers: { 
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// API request handler with cache-first strategy
async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('{"error": "Offline"}', {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// Generic request handler
async function handleGenericRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);
    if (response.ok && shouldCache(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Generic request failed:', error);
    throw error;
  }
}

// Helper functions
function isImageRequest(request) {
  return request.headers.get('accept')?.includes('image') ||
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(request.url).pathname);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/api/') || 
         request.headers.get('accept')?.includes('application/json');
}

function shouldCache(url) {
  const cacheablePatterns = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'images.pexels.com',
    'images.unsplash.com'
  ];
  return cacheablePatterns.some(pattern => url.includes(pattern));
}

// Enhanced background sync
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'contact-form-sync':
      event.waitUntil(syncContactForms());
      break;
    case 'analytics-sync':
      event.waitUntil(syncAnalytics());
      break;
    case 'content-update-sync':
      event.waitUntil(syncContentUpdates());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

// Enhanced push notifications
self.addEventListener('push', event => {
  console.log('📱 Push notification received');
  
  let notificationData = {
    title: 'ThannxAI Portfolio',
    body: 'New updates available!',
    icon: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=192&h=192',
    badge: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=72&h=72',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Projects',
        icon: 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=64&h=64'
      },
      {
        action: 'contact',
        title: 'Get in Touch',
        icon: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64'
      }
    ],
    requireInteraction: true,
    tag: 'thannxai-update'
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();

  const urlToOpen = (() => {
    switch (event.action) {
      case 'explore':
        return '/#projects';
      case 'contact':
        return '/#contact';
      default:
        return event.notification.data?.url || '/';
    }
  })();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Sync functions
async function syncContactForms() {
  try {
    const db = await openIndexedDB();
    const forms = await getAllPendingForms(db);
    
    for (const form of forms) {
      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.data
        });

        if (response.ok) {
          await deletePendingForm(db, form.id);
          console.log('✅ Form synced successfully');
        }
      } catch (error) {
        console.error('❌ Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('❌ Contact form sync failed:', error);
  }
}

async function syncAnalytics() {
  try {
    // Sync offline analytics data
    console.log('📊 Syncing analytics data...');
    // Implementation would depend on your analytics setup
  } catch (error) {
    console.error('❌ Analytics sync failed:', error);
  }
}

async function syncContentUpdates() {
  try {
    console.log('🔄 Checking for content updates...');
    
    // Update critical caches
    const cache = await caches.open(STATIC_CACHE);
    await cache.add('/');
    
    console.log('✅ Content updated successfully');
  } catch (error) {
    console.error('❌ Content update failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ThannxAI-DB', 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('pending-forms')) {
        const store = db.createObjectStore('pending-forms', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('analytics')) {
        const analyticsStore = db.createObjectStore('analytics', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function getAllPendingForms(db) {
  const transaction = db.transaction(['pending-forms'], 'readonly');
  const store = transaction.objectStore('pending-forms');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deletePendingForm(db, id) {
  const transaction = db.transaction(['pending-forms'], 'readwrite');
  const store = transaction.objectStore('pending-forms');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

console.log('🚀 ThannxAI Service Worker v2.0.0 loaded successfully!');
