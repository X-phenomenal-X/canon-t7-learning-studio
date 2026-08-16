(()=>{
  const head=document.head;
  const loaded=new Set();

  function style(href){if(loaded.has(href)||document.querySelector(`link[href="${href}"]`))return;loaded.add(href);const l=document.createElement('link');l.rel='stylesheet';l.href=href;head.appendChild(l)}
  function script(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[src="${src}"]`)){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.body.appendChild(s)})}
  function simplifyNavigation(){
    const desktop=document.querySelector('.desktop-nav');
    if(desktop)desktop.innerHTML='<a href="#home">Home</a><a href="#shoot">Shoot</a><a href="#review">Review</a><a href="#learn">Learn</a><a href="#edit">Edit</a>';
    const dock=document.querySelector('.mobile-dock');
    if(dock)dock.innerHTML='<a href="#home">Home</a><a class="shoot-dock" href="#shoot">Shoot</a><a href="#review">Review</a><a href="#learn">Learn</a><a href="#edit">Edit</a>';
  }
  function showLoadError(err){console.error(err);const banner=document.createElement('div');banner.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:9999;padding:12px 14px;border-radius:12px;background:#3a171c;color:#ffd4d8;border:1px solid #6c2b34;font:600 13px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';banner.textContent='Some photography tools did not load. Refresh the app to try again.';document.body.appendChild(banner)}
  function showUpdate(reg){if(document.getElementById('appUpdateBanner'))return;const bar=document.createElement('div');bar.id='appUpdateBanner';bar.style.cssText='position:fixed;left:12px;right:12px;bottom:82px;z-index:9998;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 12px;border-radius:14px;background:#172131;color:#fff;border:1px solid #35465e;box-shadow:0 12px 30px rgba(0,0,0,.35);font:600 13px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';bar.innerHTML='<span>New Canon T7 Studio update available.</span><button style="border:0;border-radius:9px;padding:8px 10px;background:#ff5965;color:#fff;font-weight:800">Refresh</button>';bar.querySelector('button').onclick=()=>{reg.waiting?.postMessage({type:'SKIP_WAITING'});setTimeout(()=>location.reload(),300)};document.body.appendChild(bar)}

  simplifyNavigation();
  style('./shoot-flow.css');style('./learn.css');style('./review-flow.css');style('./reshoot.css');style('./ai-coach.css');
  script('./t7-engine.js')
    .then(()=>script('./core.js'))
    .then(()=>script('./shoot-flow.js'))
    .then(()=>script('./learn.js'))
    .then(()=>script('./review-flow.js'))
    .then(()=>{const review=document.querySelector('.review-flow');if(review)review.id='review';return script('./reshoot.js')})
    .then(()=>script('./ai-coach.js'))
    .then(()=>simplifyNavigation())
    .catch(showLoadError);

  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
      if(reg.waiting)showUpdate(reg);
      reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(reg)})});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!sessionStorage.getItem('t7Reloading')){sessionStorage.setItem('t7Reloading','1');location.reload()}});
    }).catch(console.error));
  }
})();