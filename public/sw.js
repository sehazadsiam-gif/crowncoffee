// Crown Coffee Service Worker
// Handles push notifications for the manager portal.

const CACHE_NAME = "crown-coffee-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Handle push notifications from server
self.addEventListener("push", (event) => {
  let data = { title: "New Order!", body: "A new order has been placed.", icon: "/icon.svg" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon.svg",
      badge: "/icon.svg",
      tag: "new-order",
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: { url: "/manager" },
    })
  );
});

// On notification click: focus or open the manager portal
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes("/manager") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/manager");
    })
  );
});
