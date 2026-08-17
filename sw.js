const CACHE='canon-t7-studio-v39';
const CORE=['./','./index.html','./styles.css','./dashboard.css','./router.css','./router.js','./store.js','./photo-session.js','./native-ui.css','./native-ui.js','./polish-v2.css','./polish-v2.js','./app.js','./core.js','./camera-v2.css','./camera-v2.js','./t7-engine.js','./review-engine.js','./conditions.js','./conditions-v2.css','./conditions-v2.js','./editor.js','./editor-v2.css','./editor-v2.js','./shoot-flow.css','./shoot-v2.css','./scene-assist.css','./shoot-flow.js','./learn.css','./learn.js','./learn-v2.css','./learn-v2.js','./review-flow.css','./review-v2.css','./review-diagnostic.css','./review-flow.js','./review-v2.js','./reshoot.css','./reshoot.js','./smart-coach.css','./smart-coach.js','./history.js','./library.css','./library.js','./camera-steps.css','./camera-steps.js','./manifest.webmanifest'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url))))
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));

self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin){event.respondWith(fetch(event.request).catch(()=>new Response('',{status:503,statusText:'Network unavailable'})));return}
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));return;
  }
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request).then(cached=>cached||new Response('',{status:504,statusText:'Offline asset unavailable'}))));
});