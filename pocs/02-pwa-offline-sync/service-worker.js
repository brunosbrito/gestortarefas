// Service Worker para PWA Offline Sync POC
// Versão: 1.0.0

const CACHE_NAME = 'pwa-offline-sync-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './db.js',
  './sync.js',
  './app.js',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  // Força o Service Worker a ativar imediatamente
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Toma controle de todas as páginas imediatamente
  return self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para API externa (mock)
  if (event.request.url.includes('mock-api.gml.local')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se encontrou no cache, retorna
      if (cachedResponse) {
        console.log('[Service Worker] Servindo do cache:', event.request.url);
        return cachedResponse;
      }

      // Se não encontrou, busca da rede
      console.log('[Service Worker] Buscando da rede:', event.request.url);
      return fetch(event.request).then((response) => {
        // Não cachear respostas inválidas
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clona a resposta para cachear
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Background Sync (quando disponível)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync evento:', event.tag);

  if (event.tag === 'sync-checklists') {
    event.waitUntil(
      // Notifica a página para iniciar sincronização
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            message: 'Iniciando sincronização em background',
          });
        });
      })
    );
  }
});

// Notificação de atualização disponível
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Carregado');
