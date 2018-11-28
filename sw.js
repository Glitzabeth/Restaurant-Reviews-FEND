let staticCacheName = "restaurants-static-v1";
let urlsToCache = [
  "./",
  "js/sw_registration.js",
  "index.html",  
  "restaurant.html",
  "css/styles.css",
  "data/restaurants.json",
  "js/dbhelper.js",
  "js/main.js",
  "js/restaurant_info.js",
  "img/1.jpg",
  "img/2.jpg",
  "img/3.jpg",
  "img/4.jpg",
  "img/5.jpg",
  "img/6.jpg",
  "img/7.jpg",
  "img/8.jpg",
  "img/9.jpg",
  "img/10.jpg"
  "https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.css",
  "https://fonts.googleapis.com/css?family=Courgette|Muli:400,600",
  "https://maps.googleapi.com/js"
      
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll(urlsToCache))
  );
});

/**
 * Activate Service worker and delete old cache (if any) add new cache
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.filter((cacheName) => {
      return cacheName.startsWith("restaurants-static-v1-") && cacheName != staticCacheName;
    }).map((cacheName) => {
      return caches.delete(cacheName);
    }));
  }));
});

/***
 * Intercept all request and match against the cache to respond respectively
 */
self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((response) => {
    /**
     * To matching response, we return the cached value, otherwise we return
     * the result of a call to fetch, which will make a network request and return the
     * data if anything can be retrieved from the network.
     * This is a simple example and uses any cached assets we cached during the install step.
     */
    return response ||
    caches.open(staticCacheName).then((cache) => {
      return fetch(event.request).then((response) => {
        if (response.status === 404) {
          console.log("Page not found.");
          return new Response("Page not found.")
        }
        /**
         * To cache new requests cumulatively, we can do so by handling the response
         * of the fetch request and then adding it to the cache, like below.
         *The code below will cache the visited restaurant page
         */
        if(event.request.url.indexOf("restaurant.html") != -1 || event.request.url.indexOf("https://maps.googleapi.com/js") != -1){
          cache.put(event.request, response.clone());
        }
        return response;
      });
    });
  }).catch(function() {
      // If both(cache miss and n/w fetch) fail, show a generic fallback:
      return new Response("You are offline, sorry, no old cache for the URL.")
  })
  );
});

/**
 * listen for the "message" event, and call
 * skipWaiting if you get the appropriate message
 */
self.addEventListener("message", (event) => {
  if (event.data) {
    console.log("Messgae received:" + event.data);
    self.skipWaiting();
  }
});
