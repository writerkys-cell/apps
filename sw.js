/* 궁리 · 오프라인 캐시
   궁리-아이폰.html 과 같은 폴더에 두고 웹 주소로 열면,
   인터넷이 끊겨도 홈 화면 아이콘으로 앱이 열립니다. */
const CACHE = "gungri-mobile-v1";

self.addEventListener("install", e => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 網이 되면 새것을 쓰고, 안 되면 캐시에 둔 것을 쓴다
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./")))
  );
});
