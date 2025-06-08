/* eslint-disable */
/* tslint:disable */

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  // MSW에서 처리할 요청만 가로채도록 설정
  if (event.request.url.includes('/graphql')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            errors: [{ message: '네트워크 오류가 발생했습니다.' }],
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
  }
});
