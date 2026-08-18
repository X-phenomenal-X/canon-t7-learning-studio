// V71 Faster boot — shell-first module chain, parallel preload, type floor
const CACHE='canon-t7-studio-v71';
const CORE=['./','./index.html','./styles.css','./dashboard.css','./router.css','./router.js','./store.js','./photo-session.js','./native-ui.css','./native-ui.js','./home-v2.css','./photo-viewer.css','./photo-viewer.js','./portfolio.css','./portfolio.js','./mobile-shell-fix.css','./mobile-shell-fix.js','./photography-guide.css','./photography-guide.js','./photography-course.css','./photography-course.js','./adaptive-learning.css','./adaptive-learning.js','./practice-missions.css','./practice-missions.js','./learning-evidence.css','./learning-evidence.js','./reference-shot.css','./reference-shot.js','./type-scale.css','./desktop-workspace.css','./studio-finishing.css','./motion-v1.css','./motion-v1.js','./premium-shell.css','./premium-shell.js','./onboarding.css','./onboarding.js','./qa-polish.css','./qa-polish.js','./workflow-qa.js','./icon-system.css','./icon-system.js','./app-icon.svg','./polish-v2.css','./polish-v2.js','./app.js','./core.js','./camera-v2.css','./camera-v2.js','./t7-engine.js','./review-engine.js','./conditions.js','./conditions-v2.css','./conditions-v2.js','./editor.js','./editor-v2.css','./editor-v2.js','./shoot-flow.css','./shoot-flow.js','./shoot-v2.css','./shoot-subject.css','./shoot-subject.js','./shoot-focus.css','./shoot-focus.js','./shoot-finish.css','./shoot-finish.js','./scene-assist.css','./learn.css','./learn.js','./learn-v2.css','./learn-v2.js','./practice-coach.css','./practice-coach.js','./review-flow.css','./review-scene-sync.js','./review-v2.css','./review-diagnostic.css','./review-flow.js','./review-v2.js','./reshoot.css','./reshoot.js','./smart-coach.css','./smart-coach.js','./history.js','./library.css','./library.js','./library-insights.css','./library-insights.js','./camera-steps.css','./camera-steps.js','./manifest.webmanifest'];

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
