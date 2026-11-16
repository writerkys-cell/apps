/* 문득 · 오프라인
   storyS.html 과 같은 폴더에 두고 웹 주소로 열면, 인터넷이 끊겨도 같은 주소로 열립니다.
   페이지는 네트워크를 먼저 쓰고(새 판이 바로 반영되게) 안 되면 저장해 둔 것을 씁니다.
   수파베이스 등 다른 요청은 건드리지 않습니다. */
var CACHE = "storyS-v1";
var PAGE = "storyS.html";

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.add(new Request(PAGE, { cache:"reload" })).catch(function(){}); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys()
      .then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf("storyS-") === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.clients.claim(); })
  );
});

function isOwn(u){
  if(u.origin !== self.location.origin) return false;
  var p = u.pathname.split("/").pop();
  return p === PAGE || p === "storyS-sw.js" || p === "storyS.webmanifest";
}

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  var u;
  try{ u = new URL(e.request.url); }catch(x){ return; }
  /* 제 페이지와 제 파일만 — 네트워크 먼저, 안 되면 저장본. 같은 폴더의 다른 앱(storyM 등)은 건드리지 않는다 */
  if(isOwn(u)){
    var key = u.pathname.split("/").pop() === PAGE ? PAGE : e.request;
    e.respondWith(
      fetch(e.request).then(function(r){
        if(r && r.ok){ var copy = r.clone(); caches.open(CACHE).then(function(c){ c.put(key, copy); }); }
        return r;
      }).catch(function(){
        return caches.match(key).then(function(r){ return r || caches.match(PAGE); });
      })
    );
  }
});
