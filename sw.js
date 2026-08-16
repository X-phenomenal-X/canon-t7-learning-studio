const CACHE='canon-t7-studio-v24';
const CORE=['./','./index.html','./styles.css','./dashboard.css','./dashboard-v2.css','./dashboard-v2.js','./native-ui.css','./native-ui.js','./app.js','./core.js','./t7-engine.js','./conditions.js','./conditions-v2.css','./conditions-v2.js','./editor.js','./editor-v2.css','./editor-v2.js','./shoot-flow.css','./shoot-v2.css','./shoot-flow.js','./learn.css','./learn.js','./review-flow.css','./review-v2.css','./review-flow.js','./review-v2.js','./reshoot.css','./reshoot.js','./smart-coach.css','./smart-coach.js','./history.css','./history.js','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin){event.respondWith(fetch(event.request).catch(()=>new Response('',{status:503})));return;}
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});