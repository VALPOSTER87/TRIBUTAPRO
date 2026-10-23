/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "37983aaa760bdbeba494d9aad03e081e"
  }, {
    "url": "pwa-512x512.png",
    "revision": "37983aaa760bdbeba494d9aad03e081e"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9f93c835b155ef786211dfbb80b406d9"
  }, {
    "url": "index.html",
    "revision": "4bd679aad93ae7b6a98a0e1d01692ddc"
  }, {
    "url": "icon.svg",
    "revision": "51e7760e9f5333dc8ae20464e53c97e3"
  }, {
    "url": "favicon.ico",
    "revision": "7ccfab02f7c5a51efea70fd13d7c96e8"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "4cbc68fb3cfa256b7099ce3af6e025e6"
  }, {
    "url": "assets/index-CYTgkrFS.js",
    "revision": null
  }, {
    "url": "assets/index-CN4IMdN0.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "4cbc68fb3cfa256b7099ce3af6e025e6"
  }, {
    "url": "favicon.ico",
    "revision": "7ccfab02f7c5a51efea70fd13d7c96e8"
  }, {
    "url": "icon.svg",
    "revision": "51e7760e9f5333dc8ae20464e53c97e3"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9f93c835b155ef786211dfbb80b406d9"
  }, {
    "url": "pwa-512x512.png",
    "revision": "37983aaa760bdbeba494d9aad03e081e"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "37983aaa760bdbeba494d9aad03e081e"
  }, {
    "url": "manifest.webmanifest",
    "revision": "959234e3fab1abc2addd694e0c264678"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
