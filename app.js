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
  /* The cascade here is resolved by stylesheet order - later files deliberately
     override earlier ones - so a deferred sheet must still land in its original
     position. Each deferred sheet gets a comment placeholder in the head at boot;
     when it is applied, the real link is inserted immediately before it. That
     costs nothing at first paint and fetches once.
     (media="print" fetched every sheet twice; rel="preload" is high priority and
     removed the benefit entirely. Both were measured.) */
  const anchors=new Map();
  function style(href,deferred){
    if(loaded.has(href)||document.querySelector(`link[href="${href}"]`))return;
    if(deferred){
      if(anchors.has(href))return;
      anchors.set(href,head.appendChild(document.createComment(` css:${href} `)));
      return;
    }
    loaded.add(href);
    const l=document.createElement('link');l.rel='stylesheet';l.href=href;head.appendChild(l);
  }
  function applyDeferredCss(){
    for(const [href,anchor] of anchors){
      if(loaded.has(href))continue;
      loaded.add(href);
      const l=document.createElement('link');l.rel='stylesheet';l.href=href;
      head.insertBefore(l,anchor);
    }
    anchors.clear();
  }

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
  /* Home paints behind CSS, not JavaScript: 43 stylesheets totalling 353KB were
     the critical path and the shell could not appear until the last of them
     landed. Only the sheets Home uses block the paint now. Order below is the
     original cascade order and must stay that way. */
  const REST_CSS=['./shoot-flow.css','./scene-assist.css','./learn.css','./review-flow.css','./reshoot.css','./smart-coach.css','./library.css','./library-insights.css','./shoot-v2.css','./shoot-subject.css','./review-v2.css','./review-diagnostic.css','./editor-v2.css','./conditions-v2.css','./learn-v2.css','./practice-coach.css','./camera-v2.css','./camera-steps.css','./shoot-focus.css','./shoot-finish.css','./portfolio.css','./photography-guide.css','./photography-course.css','./adaptive-learning.css'];
  const CSS_ORDER=['./router.css','./shoot-flow.css','./scene-assist.css','./learn.css','./review-flow.css','./reshoot.css','./smart-coach.css','./library.css','./library-insights.css','./native-ui.css','./shoot-v2.css','./shoot-subject.css','./review-v2.css','./review-diagnostic.css','./editor-v2.css','./conditions-v2.css','./learn-v2.css','./practice-coach.css','./camera-v2.css','./camera-steps.css','./polish-v2.css','./studio-finishing.css','./motion-v1.css','./shoot-focus.css','./shoot-finish.css','./premium-shell.css','./onboarding.css','./home-v2.css','./qa-polish.css','./icon-system.css','./photo-viewer.css','./portfolio.css','./mobile-shell-fix.css','./photography-guide.css','./photography-course.css','./adaptive-learning.css','./practice-missions.css','./learning-evidence.css','./reference-shot.css','./type-scale.css','./desktop-workspace.css'];
  const deferredSet=new Set(REST_CSS);
  CSS_ORDER.forEach(href=>style(href,deferredSet.has(href)));

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

  /* Everything past the shell is deferred until Home is interactive. A route that
     needs it sooner calls rest() and gets the same promise, so nothing loads
     twice and navigating early is never blocked on the idle callback. */
  let restStarted=null;
  function rest(){
    if(restStarted)return restStarted;
    restStarted=(async()=>{
      applyDeferredCss();
      warm([...ROUTES_A,...ROUTES_B]);
      await chain(ROUTES_A);
      const review=document.querySelector('.review-flow'),edit=document.getElementById('edit');
      if(review&&edit?.parentNode){review.id='review';review.classList.add('section');edit.parentNode.insertBefore(review,edit)}
      await chain(ROUTES_B);
      settle();
    })().catch(showLoadError);
    return restStarted;
  }
  /* Any hash other than Home needs a section the deferred bundle builds. */
  function needsRest(){const h=(location.hash||'#home').slice(1);return !!h&&h!=='home'}
  window.addEventListener('hashchange',()=>{if(needsRest())rest()});
  window.T7App={rest,ready:()=>restStarted||rest()};

  warm(SHELL);
  chain(SHELL)
    .then(()=>{
      if(needsRest())return rest();
      const idle=window.requestIdleCallback||(fn=>setTimeout(fn,220));
      idle(()=>rest(),{timeout:1500});
    })
    .catch(showLoadError);

  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
      if(reg.waiting)showUpdate(reg);
      reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(reg)})});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!sessionStorage.getItem('t7Reloading')){sessionStorage.setItem('t7Reloading','1');location.reload()}});
    }).catch(console.error));
  }
})();