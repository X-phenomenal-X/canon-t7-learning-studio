(()=>{
  const $=s=>document.querySelector(s);
  document.body.classList.add('premium-shell');

  function ensureIcon(){
    if(!document.querySelector('link[rel="icon"]')){const l=document.createElement('link');l.rel='icon';l.type='image/svg+xml';l.href='./app-icon.svg';document.head.appendChild(l)}
    let theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.content='#07090d';
    /* router.js owns document.title now; it runs on every route change. */
  }

  function addStatus(){
    const top=$('.topbar');if(!top||$('.premium-status'))return;
    const status=document.createElement('div');status.className='premium-status';status.innerHTML='<i></i><span>Local · Private</span>';top.appendChild(status);
    const sync=()=>{status.classList.toggle('offline',!navigator.onLine);status.querySelector('span').textContent=navigator.onLine?'Local · Private':'Offline · Local'};
    window.addEventListener('online',sync);window.addEventListener('offline',sync);sync();
  }

  function toast(text,kind='ok',ttl=2600){
    let host=$('.premium-toast-host');if(!host){host=document.createElement('div');host.className='premium-toast-host';document.body.appendChild(host)}
    const t=document.createElement('div');t.className=`premium-toast ${kind==='warn'?'warn':''}`;t.innerHTML=`<i></i><span></span>`;t.querySelector('span').textContent=text;host.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),260)},ttl);
  }
  window.T7Toast={show:toast};

  function boot(){
    let boot=$('.t7-premium-boot');
    if(!boot){boot=document.createElement('div');boot.className='t7-premium-boot';boot.innerHTML='<div class="t7-premium-boot-inner"><div class="t7-premium-lens"></div><div class="t7-premium-boot-copy"><b>T7 Studio</b><span>Canon Rebel T7 companion</span></div><div class="t7-premium-loader"><i></i></div></div>';document.body.appendChild(boot)}
    requestAnimationFrame(()=>requestAnimationFrame(()=>{boot.classList.add('out');setTimeout(()=>boot.remove(),500)}));
  }

  function syncRoute(){
    const route=document.body.dataset.route||'home';document.documentElement.dataset.t7Route=route;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=route==='edit'?'#050607':'#07090d';
  }
  new MutationObserver(syncRoute).observe(document.body,{attributes:true,attributeFilter:['data-route']});syncRoute();

  window.addEventListener('offline',()=>toast('You’re offline. Saved lessons, Library and local tools still work.','warn',3600));
  window.addEventListener('online',()=>toast('Back online. Live Conditions are available again.','ok',2600));

  // Quiet premium confirmation only for actions where saving/exporting matters.
  window.addEventListener('t7-history-updated',e=>{if(e.detail?.item)toast('Photo saved to your local Library.','ok',1800)});
  window.addEventListener('t7-editor-photo-ready',()=>{const route=document.body.dataset.route;if(route==='edit')toast('Photo ready in the darkroom.','ok',1500)});

  ensureIcon();addStatus();boot();
})();
