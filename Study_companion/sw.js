// Service Worker for Cozy Study Companion - DEVELOPMENT VERSION
const CACHE_NAME = 'cozy-study-dev';

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('Deleting all caches for fresh start');
                    return caches.delete(cacheName);
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - DO NOT CACHE JS OR HTML FILES
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Don't cache JavaScript or HTML files - always fetch fresh
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html')) {
        console.log('Fetching fresh:', url.pathname);
        event.respondWith(fetch(event.request));
        return;
    }
    
    // For other files, try cache then network
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Keep the push notification and other events as they are
self.addEventListener('push', event => {
    console.log('Push event received!', event);
    
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'Cozy Study Reminder',
            body: event.data.text() || 'Time to study! 📚',
            tag: 'study-reminder'
        };
    }
    
    const options = {
        body: data.body || 'Time to study! 📚',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Cozy Study Reminder', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
