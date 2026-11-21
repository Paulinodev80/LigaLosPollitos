
const CACHE_NAME = 'liga-los-pollitos-v1';

const ARCHIVOS = [
    './',
    './index.html',
    './manifest.json',
    './css/movil.css',
    './iconos/icono.svg'
];

// Instalar y guardar archivos principales
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS))
    );

    self.skipWaiting();
});

// Activar el nuevo Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});

// Interceptar solicitudes
self.addEventListener('fetch', event => {

    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {

                if (response.ok) {
                    const copia = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, copia));
                }

                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then(response => {

                        if (response) {
                            return response;
                        }

                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});
