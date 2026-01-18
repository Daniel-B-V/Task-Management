// Service Worker for Cozy Study Companion
const CACHE_NAME = 'cozy-study-v1';
const STATIC_CACHE = 'static-cache-v1';

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/script.js',
                '/manifest.json',
                'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f9e1.png' // Heart emoji as fallback
            ]);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Push event - handle notifications when app is closed
self.addEventListener('push', event => {
    console.log('Push event received!', event);
    
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'Cozy Study Reminder',
            body: event.data.text() || 'Time to study! 📚',
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            tag: 'study-reminder'
        };
    }
    
    const options = {
        body: data.body || 'Time to study! 📚',
        icon: data.icon || 'icon-192.png',
        badge: data.badge || 'icon-192.png',
        tag: data.tag || 'study-reminder',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'close',
                title: 'Dismiss'
            }
        ],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Cozy Study Reminder', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // Check if there's already a window/tab open with the app
            for (const client of clientList) {
                if (client.url.includes('/') && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Background sync for offline support
self.addEventListener('sync', event => {
    if (event.tag === 'sync-reminders') {
        console.log('Background sync for reminders');
        // You could implement background sync here
    }
});

// Periodic sync (for Chrome 80+)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-reminders') {
        console.log('Periodic sync for reminders');
        // Check reminders periodically
    }
});
