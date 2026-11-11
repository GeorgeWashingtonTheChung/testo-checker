// Apex T: no-op worker so the Badging API + installability work on Android.
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(clients.claim()));
self.addEventListener("fetch",()=>{});
