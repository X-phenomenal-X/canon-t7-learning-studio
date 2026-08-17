(()=>{
  const head=document.head;
  const loaded=new Set();

  function bootNow(){
    if(document.querySelector('.t7-premium-boot'))return;
    const boot=document.createElement('div');boot.className='t7-premium-boot';
    boot.style.cssText='position:fixed;inset:0;z-index:12000;display:grid;place-items:center;background:#07090d;color:#f5f7f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
    boot.innerHTML='<div class="t7-premium-boot-inner"><div class="t7-premium-lens"></div><div class="t7-premium-boot-copy"><b>T7 Studio</b><span>Canon Rebel T7 companion</span></div><div class="t7-premium-loader"><i></i></div></div>';
    document.body.appendChild(boot);
  }
  function style(href){if(loaded.has(href)||document.querySelector(`link[href="${href}"]`))return;loaded.add(href);const l=document.createElement('link');l.rel='stylesheet';l.href=href;head.appendChild(l)}
  function script(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[src="${src}"]`)){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.body.appendChild(s)})}
  function simplifyNavigation(){
    const desktop=document.querySelector('.desktop-nav');
    if(desktop)desktop.innerHTML='<a href="#home">Home</a><a href="#shoot">Shoot</a><a href="#review">Review</a><a href="#learn">Learn</a><a href="#library">Library</a>';
    const dock=document.querySelector('.mobile-dock');
    if(dock)dock.innerHTML='<a href="#home">Home</a><a class="shoot-dock" href="#shoot">Shoot</a><a href="#review">Review</a><a href="#learn">Learn</a><a href="#library">Library</a>';
  }
  function showLoadError(err){
    console.error(err);
    document.querySelector('.t7-premium-boot')?.remove();
    const banner=document.createElement('div');banner.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:9999;padding:12px 14px;border-radius:12px;background:#2a171b;color:#ffd8dc;border:1px solid #58303a;font:600 13px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';banner.textContent='Some photography tools did not load. Refresh the app to try again.';document.body.appendChild(banner)
  }
  function showUpdate(reg){if(document.getElementById('appUpdateBanner'))return;const bar=document.createElement('div');bar.id='appUpdateBanner';bar.style.cssText='position:fixed;left:12px;right:12px;bottom:82px;z-index:9998;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 12px;border-radius:16px;background:rgba(15,20,27,.94);backdrop-filter:blur(18px);color:#fff;border:1px solid rgba(255,255,255,.1);box-shadow:0 16px 40px rgba(0,0,0,.38);font:700 12px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';bar.innerHTML='<span>New T7 Studio version available.</span><button style="border:0;border-radius:11px;padding:9px 11px;background:linear-gradient(135deg,#ff735f,#ff9d73);color:#fff;font-weight:900">Refresh</button>';bar.querySelector('button').onclick=()=>{reg.waiting?.postMessage({type:'SKIP_WAITING'});setTimeout(()=>location.reload(),300)};document.body.appendChild(bar)}

  bootNow();
  simplifyNavigation();
  style('./router.css');style('./shoot-flow.css');style('./scene-assist.css');style('./learn.css');style('./review-flow.css');style('./reshoot.css');style('./smart-coach.css');style('./library.css');style('./library-insights.css');style('./native-ui.css');style('./shoot-v2.css');style('./shoot-subject.css');style('./review-v2.css');style('./review-diagnostic.css');style('./editor-v2.css');style('./conditions-v2.css');style('./learn-v2.css');style('./practice-coach.css');style('./camera-v2.css');style('./camera-steps.css');style('./polish-v2.css');style('./studio-finishing.css');style('./motion-v1.css');style('./shoot-focus.css');style('./shoot-finish.css');style('./premium-shell.css');style('./onboarding.css');style('./home-v2.css');style('./qa-polish.css');style('./icon-system.css');style('./photo-viewer.css');
  script('./store.js')
    .then(()=>script('./photo-session.js'))
    .then(()=>script('./t7-engine.js'))
    .then(()=>script('./review-engine.js'))
    .then(()=>script('./core.js'))
    .then(()=>script('./camera-v2.js'))
    .then(()=>script('./shoot-flow.js'))
    .then(()=>script('./shoot-subject.js'))
    .then(()=>script('./shoot-focus.js'))
    .then(()=>script('./shoot-finish.js'))
    .then(()=>script('./learn.js'))
    .then(()=>script('./review-flow.js'))
    .then(()=>script('./review-scene-sync.js'))
    .then(()=>{
      const review=document.querySelector('.review-flow'),edit=document.getElementById('edit');
      if(review&&edit?.parentNode){review.id='review';review.classList.add('section');edit.parentNode.insertBefore(review,edit)}
      return script('./reshoot.js');
    })
    .then(()=>script('./smart-coach.js'))
    .then(()=>script('./history.js'))
    .then(()=>script('./library.js'))
    .then(()=>script('./library-insights.js'))
    .then(()=>script('./native-ui.js'))
    .then(()=>script('./learn-v2.js'))
    .then(()=>script('./practice-coach.js'))
    .then(()=>script('./conditions-v2.js'))
    .then(()=>script('./review-v2.js'))
    .then(()=>script('./editor-v2.js'))
    .then(()=>script('./camera-steps.js'))
    .then(()=>script('./router.js'))
    .then(()=>script('./polish-v2.js'))
    .then(()=>script('./motion-v1.js'))
    .then(()=>script('./premium-shell.js'))
    .then(()=>script('./onboarding.js'))
    .then(()=>script('./qa-polish.js'))
    .then(()=>script('./workflow-qa.js'))
    .then(()=>script('./icon-system.js'))
    .then(()=>script('./photo-viewer.js'))
    .catch(showLoadError);

  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
      if(reg.waiting)showUpdate(reg);
      reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(reg)})});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!sessionStorage.getItem('t7Reloading')){sessionStorage.setItem('t7Reloading','1');location.reload()}});
    }).catch(console.error));
  }
})();