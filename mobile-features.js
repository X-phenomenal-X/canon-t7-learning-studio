/* T7 Studio — phone-specific capabilities.
 *
 * Three things a phone can do that the app was not using. Everything here is
 * additive and feature-detected: on a browser without the API, or on a desktop
 * pointer, the feature simply does not appear.
 */
(()=>{
  const $=s=>document.querySelector(s);
  const coarse=matchMedia('(pointer:coarse)').matches;
  const standalone=matchMedia('(display-mode:standalone)').matches||navigator.standalone===true;

  /* ---- 1. Keep the screen awake during a guided shoot -------------------
     You hold the camera in two hands and follow the framing and capture steps
     on the phone. Left alone the screen sleeps mid-shoot, which is the one
     moment you cannot spare a hand. Hold a wake lock for the shooting routes
     only, and let it go everywhere else so nothing drains the battery. */
  const KEEP_AWAKE=new Set(['shoot','camera']);
  let lock=null,lockRoute='';

  async function releaseLock(){
    if(!lock)return;
    try{await lock.release()}catch{}
    lock=null;
  }
  async function syncLock(){
    if(!('wakeLock'in navigator)||!coarse)return;
    const route=document.body.dataset.route||'home';
    const want=KEEP_AWAKE.has(route)&&document.visibilityState==='visible';
    if(want&&!lock){
      try{
        lock=await navigator.wakeLock.request('screen');
        lockRoute=route;
        /* The browser drops the lock when the tab is hidden; take it again on return. */
        lock.addEventListener('release',()=>{lock=null});
      }catch{/* denied, low battery, or unsupported - not worth surfacing */}
    }else if(!want&&lock){
      releaseLock();lockRoute='';
    }
  }
  window.addEventListener('t7-route-changed',syncLock);
  document.addEventListener('visibilitychange',syncLock);
  syncLock();

  /* ---- 2. Share a reviewed frame with the system sheet ------------------
     A phone can hand the photograph and its verdict to Messages, Mail or a
     photo app. Only offered when the browser actually supports it. */
  function shareLabel(item){
    const name=item?.sceneName||String(item?.goal||'photo').replace(/^./,c=>c.toUpperCase());
    const bits=[name,item?.diagnosis||item?.status].filter(Boolean);
    return bits.join(' — ');
  }
  async function fileFor(item){
    const src=item?.preview||item?.thumb;
    if(!src||!src.startsWith('data:'))return null;
    try{
      const blob=await (await fetch(src)).blob();
      return new File([blob],'t7-studio-frame.jpg',{type:blob.type||'image/jpeg'});
    }catch{return null}
  }
  async function shareCurrent(){
    if(!navigator.share)return;
    const item=window.T7PhotoViewer?.getCurrent?.();
    const text=shareLabel(item);
    const file=await fileFor(item);
    const payload=file&&navigator.canShare?.({files:[file]})
      ? {files:[file],text}
      : {title:'T7 Studio',text,url:location.href.split('#')[0]};
    try{await navigator.share(payload)}catch{/* dismissed */}
  }
  function addShareButton(){
    if(!navigator.share||!coarse)return;
    const host=$('#t7pvTopActions');
    if(!host||$('#t7pvShare'))return;
    const b=document.createElement('button');
    b.id='t7pvShare';b.className='t7pv-icon-btn';b.type='button';
    b.setAttribute('aria-label','Share this frame');
    /* The set has no dedicated share glyph; 'upload' is the outward arrow the
       platform sheets use and keeps the icon family consistent. */
    window.T7Icons?.add?.(b,'upload');
    b.onclick=shareCurrent;
    host.prepend(b);
  }
  window.addEventListener('t7-photo-viewer-changed',addShareButton);
  new MutationObserver(addShareButton).observe(document.body,{childList:true,subtree:true});

  /* ---- 3. Offer Add to Home Screen when the browser says it is possible --
     Chrome fires beforeinstallprompt; iOS Safari does not, so nothing is shown
     there rather than nagging with manual instructions. */
  let deferred=null;
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();deferred=e;showInstall();
  });
  function showInstall(){
    if(!deferred||standalone)return;
    const row=$('.home-v2-utilities');
    if(!row||$('#t7InstallChip'))return;
    const b=document.createElement('button');
    b.id='t7InstallChip';b.className='home-v2-utility t7-install-chip';b.type='button';
    b.textContent='Add to Home Screen';
    b.onclick=async()=>{
      if(!deferred)return;
      deferred.prompt();
      try{await deferred.userChoice}catch{}
      deferred=null;b.remove();
    };
    row.appendChild(b);
  }
  window.addEventListener('appinstalled',()=>{deferred=null;$('#t7InstallChip')?.remove()});
  window.addEventListener('t7-route-changed',showInstall);

  window.T7Mobile={syncLock,shareCurrent,isStandalone:()=>standalone,version:'1.0.0'};
})();
