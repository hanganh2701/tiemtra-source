/* Mèo Tải: service worker để cài được lên màn hình chính và mở được trang khi mất mạng.
   Luôn lấy bản mới từ mạng trước (khỏi kẹt bản cũ), mất mạng mới dùng bản đã giữ. Không bao giờ giữ /api/. */
const KHO = "meotai-1";
const VO = ["/", "/mp3/", "/anh/", "/huong-dan/", "/style.css", "/app.js", "/cong-cu.js", "/icon.svg", "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(KHO)
      .then((c) => c.addAll(VO))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ds) => Promise.all(ds.filter((k) => k !== KHO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && r.type === "basic") {
          const ban = r.clone();
          caches.open(KHO).then((c) => c.put(e.request, ban));
        }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("/"))),
  );
});
