(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const svg={
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    shoot:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h3l1.3-2h5.4l1.3 2h3A2.5 2.5 0 0 1 21.5 10v7.5A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5V10A2.5 2.5 0 0 1 5 7.5Z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
    review:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v13H4z"/><path d="m7 15 3-3 2.2 2.2 2.6-3.2 2.2 2.5"/><circle cx="8.2" cy="9" r="1.2"/></svg>',
    learn:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z"/></svg>',
    library:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h6l1.5 2H20v11H4z"/><path d="M7 11h10M7 14h7"/></svg>',
    back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>'
  };
  const labels={home:'Home',shoot:'Shoot',review:'Review',learn:'Learn',library:'Library'};
  const routeTab={home:'home',shoot:'shoot',conditions:'shoot',review:'review',edit:'review',learn:'learn',camera:'learn',simulator:'learn',visuals:'learn',practice:'learn',library:'library'};

  function rebuildDock(){
    const dock=$('.mobile-dock');if(!dock)return;
    dock.innerHTML=['home','shoot','review','learn','library'].map(k=>`<a href="#${k}" class="${k==='shoot'?'shoot-dock':''}" aria-label="${labels[k]}">${svg[k]}<span>${labels[k]}</span></a>`).join('');
  }

  function addBack(){
    const top=$('.topbar');if(!top||$('.polish-back'))return;
    const b=document.createElement('button');b.className='polish-back';b.type='button';b.setAttribute('aria-label','Go back');b.innerHTML=svg.back;
    b.onclick=()=>{const route=document.body.dataset.route||'home';if(route==='home')return;if(history.length>1)history.back();else location.hash='#home'};
    top.prepend(b);
  }

  function syncChrome(){
    const route=document.body.dataset.route||(location.hash||'#home').slice(1)||'home';
    const tab=routeTab[route]||'home';
    $$('.mobile-dock a').forEach(a=>a.classList.toggle('active',(a.getAttribute('href')||'').slice(1)===tab));
    const back=$('.polish-back');if(back)back.hidden=route==='home';
    /* document.title belongs to router.js, which runs on every route change. */
  }

  rebuildDock();addBack();syncChrome();
  new MutationObserver(syncChrome).observe(document.body,{attributes:true,attributeFilter:['data-route']});
  window.addEventListener('hashchange',()=>requestAnimationFrame(syncChrome));

  document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,a.native-action,a.native-shoot-card,.subject-card,.cv2-goal,.ev2-preset,.ev2-crop,.learn-list button');if(el)el.classList.add('polish-pressed')},{passive:true});
  ['pointerup','pointercancel','pointerleave'].forEach(type=>document.addEventListener(type,e=>{const el=e.target.closest?.('.polish-pressed');if(el)el.classList.remove('polish-pressed')},{passive:true}));

  const weatherStatus=$('#photoWeatherStatus'),conditions=$('.conditions-v2'),search=$('#searchPhotoWeather'),locate=$('#usePhotoLocation');
  function syncWeatherLoading(){if(!weatherStatus||!conditions)return;const t=weatherStatus.textContent||'';const loading=/loading|finding|requesting/i.test(t);conditions.classList.toggle('is-loading',loading);conditions.setAttribute('aria-busy',loading?'true':'false');if(search)search.disabled=loading;if(locate)locate.disabled=loading}
  if(weatherStatus){new MutationObserver(syncWeatherLoading).observe(weatherStatus,{childList:true,characterData:true,subtree:true});syncWeatherLoading()}

  const review=$('.review-flow'),file=$('#fileInput'),score=$('#reviewScore');
  let reviewLoading=null;
  if(review){reviewLoading=document.createElement('div');reviewLoading.className='polish-processing';reviewLoading.innerHTML='<span class="polish-spinner"></span><span>Checking exposure, detail and Canon settings…</span>';const host=review.querySelector('.review-v2-overview')||review;host.prepend(reviewLoading)}
  function setReviewLoading(on){if(!review||!reviewLoading)return;review.classList.toggle('is-processing',on);reviewLoading.classList.toggle('show',on);review.setAttribute('aria-busy',on?'true':'false')}
  if(file)file.addEventListener('change',()=>{if(file.files?.[0]){setReviewLoading(true);setTimeout(()=>setReviewLoading(false),4500)}});
  if(score)new MutationObserver(()=>{const n=Number(String(score.textContent).replace(/[^0-9.]/g,''))||0;if(n)setReviewLoading(false)}).observe(score,{childList:true,characterData:true,subtree:true});

  const canvas=$('#canvas'),canvasWrap=$('.editor-v2-layout>.canvas-wrap');let canvasLoading=null;
  if(canvasWrap){canvasLoading=document.createElement('div');canvasLoading.className='polish-canvas-loading';canvasLoading.innerHTML='<div><span class="polish-spinner"></span><span>Preparing photo…</span></div>';canvasWrap.appendChild(canvasLoading)}
  function setCanvasLoading(on){if(!canvasLoading)return;canvasLoading.classList.toggle('show',on);canvasWrap?.setAttribute('aria-busy',on?'true':'false')}
  if(file)file.addEventListener('change',()=>{if(file.files?.[0]&&(document.body.dataset.route==='edit'||location.hash==='#edit')){setCanvasLoading(true);setTimeout(()=>setCanvasLoading(false),3500)}});
  if(canvas)new MutationObserver(()=>{if(canvas.width>1&&canvas.height>1)setCanvasLoading(false)}).observe(canvas,{attributes:true,attributeFilter:['width','height']});

  $$('.rv2-details summary,.cv2-weather-details summary,.ev2-advanced summary,.library-danger summary').forEach(s=>s.setAttribute('role','button'));
})();