(()=>{
  const head=document.head;
  const loaded=new Set();

  function bootNow(){
    if(document.querySelector('.t7-premium-boot'))return;
    const boot=document.createElement('div');boot.className='t7-premium-boot';
    boot.style.cssText='position:fixed;inset:0;z-index:12000;display:grid;place-items:center;background:#07090d;color:#f5f7f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
    boot.innerHTML='<div class="t7-premium-boot-inner"><div class="t7-premium-lens"></div><div class="t7-premium-boot-copy"><b>T7 Studio</b><span>Canon Rebel T7 photography guide</span></div><div class="t7-premium-loader"><i></i></div></div>';
    document.body.appendChild(boot);
  }
  function style(href){if(loaded.has(href)||document.querySelector(`link[href="${href}"]`))return;loaded.add(href);const l=document.createElement('link');l.rel='stylesheet';l.href=href;head.appendChild(l)}
  function script(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[src="${src}"]`)){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.body.appendChild(s)})}
  /* The module chain below runs strictly in order because each module depends on
     globals the previous one defines. Without this, the browser only discovers
     module N+1 after N has finished, so 45 files cost 45 sequential round trips.
     Preloading warms every request in parallel; the chain then executes in order
     against the preload cache. */
  function warm(list){
    const rel=document.createElement('link').relList;
    if(!rel?.supports?.('preload'))return;
    for(const src of list){
      if(document.querySelector(`link[rel="preload"][href="${src}"]`))continue;
      const l=document.createElement('link');l.rel='preload';l.as='script';l.href=src;head.appendChild(l);
    }
  }
  function simplifyNavigation(){
    const desktop=document.querySelector('.desktop-nav');
    if(desktop)desktop.innerHTML='<a href="#home">Home</a><a href="#shoot">Shoot</a><a href="#review">Review</a><a href="#learn">Guide</a><a href="#library">Library</a>';
    const dock=document.querySelector('.mobile-dock');
    if(dock)dock.innerHTML='<a href="#home">Home</a><a class="shoot-dock" href="#shoot">Shoot</a><a href="#review">Review</a><a href="#learn">Guide</a><a href="#library">Library</a>';
  }
  function showLoadError(err){
    console.error(err);
    document.querySelector('.t7-premium-boot')?.remove();
    const banner=document.createElement('div');banner.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:9999;padding:12px 14px;border-radius:12px;background:#2a171b;color:#ffd8dc;border:1px solid #58303a;font:600 13px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';banner.textContent='Some photography tools did not load. Refresh the app to try again.';document.body.appendChild(banner)
  }
  function showUpdate(reg){if(document.getElementById('appUpdateBanner'))return;const bar=document.createElement('div');bar.id='appUpdateBanner';bar.style.cssText='position:fixed;left:12px;right:12px;bottom:82px;z-index:9998;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 12px;border-radius:16px;background:rgba(15,20,27,.94);backdrop-filter:blur(18px);color:#fff;border:1px solid rgba(255,255,255,.1);box-shadow:0 16px 40px rgba(0,0,0,.38);font:700 12px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';bar.innerHTML='<span>New T7 Studio version available.</span><button style="border:0;border-radius:11px;padding:9px 11px;background:linear-gradient(135deg,#ff735f,#ff9d73);color:#fff;font-weight:900">Refresh</button>';bar.querySelector('button').onclick=()=>{reg.waiting?.postMessage({type:'SKIP_WAITING'});setTimeout(()=>location.reload(),300)};document.body.appendChild(bar)}

  bootNow();
  simplifyNavigation();
  style('./router.css');style('./shoot-flow.css');style('./scene-assist.css');style('./learn.css');style('./review-flow.css');style('./reshoot.css');style('./smart-coach.css');style('./library.css');style('./library-insights.css');style('./native-ui.css');style('./shoot-v2.css');style('./shoot-subject.css');style('./review-v2.css');style('./review-diagnostic.css');style('./editor-v2.css');style('./conditions-v2.css');style('./learn-v2.css');style('./practice-coach.css');style('./camera-v2.css');style('./camera-steps.css');style('./polish-v2.css');style('./studio-finishing.css');style('./motion-v1.css');style('./shoot-focus.css');style('./shoot-finish.css');style('./premium-shell.css');style('./onboarding.css');style('./home-v2.css');style('./qa-polish.css');style('./icon-system.css');style('./photo-viewer.css');style('./portfolio.css');style('./mobile-shell-fix.css');style('./photography-guide.css');style('./photography-course.css');style('./adaptive-learning.css');style('./practice-missions.css');style('./learning-evidence.css');style('./reference-shot.css');style('./type-scale.css');style('./desktop-workspace.css');
  /* The shell set is everything needed to paint Home and navigate: state, the
     recommendation engines, history, Home itself, the router, and the visual
     shell. Route modules build their own sections and are pulled in straight
     afterwards, so the boot screen no longer waits behind ~145KB of Shoot,
     Review, Library, Editor and Camera code that Home never uses.
     polish-v2, motion-v1, qa-polish and icon-system all watch the DOM, so
     sections that arrive later are still decorated. */
  const SHELL=['./store.js','./photo-session.js','./t7-engine.js','./review-engine.js','./core.js',
    './history.js','./native-ui.js','./router.js','./polish-v2.js','./motion-v1.js','./premium-shell.js',
    './icon-system.js','./onboarding.js','./mobile-shell-fix.js','./qa-polish.js'];
  const ROUTES_A=['./camera-v2.js','./shoot-flow.js','./shoot-subject.js','./shoot-focus.js','./shoot-finish.js',
    './learn.js','./review-flow.js','./review-scene-sync.js'];
  const ROUTES_B=['./reshoot.js','./smart-coach.js','./library.js','./library-insights.js','./learn-v2.js',
    './practice-coach.js','./conditions-v2.js','./review-v2.js','./editor-v2.js','./camera-steps.js',
    './workflow-qa.js','./reference-shot.js','./photography-guide.js','./photography-course.js',
    './adaptive-learning.js','./practice-missions.js','./learning-evidence.js','./photo-viewer.js','./portfolio.js','./mobile-features.js'];

  function chain(list){return list.reduce((p,src)=>p.then(()=>script(src)),Promise.resolve())}

  /* Home renders before the Library and course modules exist, and a tab tapped
     during loading resolves against sections that have not been built yet. Once
     everything has run, re-resolve the route and re-broadcast history so Home
     picks up whatever it could not see the first time. */
  function settle(){
    try{window.T7Router?.route?.()}catch{}
    try{
      window.T7History?.all?.().then(items=>window.dispatchEvent(new CustomEvent('t7-history-updated',
        {detail:{items,stats:window.T7History?.stats?.(items)||{}}}))).catch(()=>{});
    }catch{}
  }

  warm(SHELL);
  chain(SHELL)
    .then(()=>{warm([...ROUTES_A,...ROUTES_B]);return chain(ROUTES_A)})
    .then(()=>{
      const review=document.querySelector('.review-flow'),edit=document.getElementById('edit');
      if(review&&edit?.parentNode){review.id='review';review.classList.add('section');edit.parentNode.insertBefore(review,edit)}
      return chain(ROUTES_B);
    })
    .then(settle)
    .catch(showLoadError);

  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
      if(reg.waiting)showUpdate(reg);
      reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(reg)})});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!sessionStorage.getItem('t7Reloading')){sessionStorage.setItem('t7Reloading','1');location.reload()}});
    }).catch(console.error));
  }
})();