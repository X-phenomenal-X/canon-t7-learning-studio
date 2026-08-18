(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const tabOrder={home:0,shoot:1,conditions:1,review:2,edit:2,learn:3,camera:3,simulator:3,visuals:3,practice:3,library:4};
  let previous=document.body.dataset.route||(location.hash||'#home').slice(1)||'home';
  document.body.classList.add('motion-ready');

  function animateRoute(route){
    const screen=$('.app-screen-active');if(!screen)return;
    screen.classList.remove('motion-enter-forward','motion-enter-back','motion-enter-soft');
    const a=tabOrder[previous]??0,b=tabOrder[route]??0,kind=b>a?'motion-enter-forward':b<a?'motion-enter-back':'motion-enter-soft';
    requestAnimationFrame(()=>{screen.classList.add(kind);setTimeout(()=>screen.classList.remove(kind),520)});
    previous=route;
  }
  window.addEventListener('t7-route-changed',e=>animateRoute(e.detail?.route||document.body.dataset.route||'home'));

  function syncScroll(){document.body.classList.toggle('motion-scrolled',window.scrollY>10)}
  window.addEventListener('scroll',syncScroll,{passive:true});syncScroll();

  document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('.button,.native-action,.subject-card-v2,.scene-assist-option,.cv2-goal,.library-gallery-shot,.library-item,.ev2-preset,.cv3-control-chip,.learn-list button');if(el)el.classList.add('motion-tap')},{passive:true});
  ['pointerup','pointercancel','pointerleave'].forEach(type=>document.addEventListener(type,e=>e.target.closest?.('.motion-tap')?.classList.remove('motion-tap'),{passive:true}));

  const revealSelector='.library-gallery-shot,.library-item,.native-action,.lv2-card,.cv2-window-main,.cv2-watch,.cv2-setup,.library-card';
  const seen=new WeakSet();
  const io='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-inview');io.unobserve(entry.target)}}),{threshold:.08,rootMargin:'20px 0px -25px'}):null;
  function registerReveal(root=document){
    root.querySelectorAll?.(revealSelector).forEach((el,i)=>{if(seen.has(el))return;seen.add(el);el.classList.add('motion-reveal-item');el.style.setProperty('--motion-delay',`${Math.min(i%6,5)*38}ms`);if(io)io.observe(el);else el.classList.add('motion-inview')});
  }
  registerReveal();
  new MutationObserver(m=>{for(const x of m){x.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches?.(revealSelector)){n.classList.add('motion-reveal-item');n.classList.add('motion-inview')}registerReveal(n)}})}}).observe(document.body,{childList:true,subtree:true});

  function updateRanges(root=document){root.querySelectorAll?.('.editor-v2-layout input[type="range"]').forEach(r=>{const min=Number(r.min||0),max=Number(r.max||100),value=Number(r.value||0),pct=max===min?50:Math.max(0,Math.min(100,(value-min)/(max-min)*100));r.style.setProperty('--range-pct',pct+'%')})}
  document.addEventListener('input',e=>{if(e.target.matches?.('.editor-v2-layout input[type="range"]'))updateRanges(e.target.closest('.editor-v2-layout')||document)});updateRanges();
  window.addEventListener('t7-editor-photo-ready',()=>{const layout=$('.editor-v2-layout');if(layout){layout.classList.remove('motion-editor-ready');requestAnimationFrame(()=>layout.classList.add('motion-editor-ready'));setTimeout(()=>layout.classList.remove('motion-editor-ready'),600)}updateRanges()});

  const shoot=$('#shoot'),captureScreen=shoot?.querySelector('.shoot-screen[data-screen="4"]');
  function capturePulse(){const ready=captureScreen?.querySelector('.capture-ready-v2');if(!captureScreen?.classList.contains('active')||!ready)return;ready.classList.remove('motion-capture-ready');requestAnimationFrame(()=>ready.classList.add('motion-capture-ready'));setTimeout(()=>ready.classList.remove('motion-capture-ready'),1100)}
  if(captureScreen)new MutationObserver(capturePulse).observe(captureScreen,{attributes:true,attributeFilter:['class']});
  window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='shoot')setTimeout(capturePulse,100)});

  const review=$('.review-flow'),file=$('#fileInput');
  function reviewArrive(){const result=review?.querySelector('.rv2-result');if(!result||result.hidden||result.dataset.motionSeen==='1')return;result.dataset.motionSeen='1';result.classList.remove('motion-photo-arrive');requestAnimationFrame(()=>result.classList.add('motion-photo-arrive'));setTimeout(()=>result.classList.remove('motion-photo-arrive'),700)}
  if(file)file.addEventListener('change',()=>{const result=review?.querySelector('.rv2-result');if(result)delete result.dataset.motionSeen});
  if(review)new MutationObserver(reviewArrive).observe(review,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});

  /* ---- Hero parallax -------------------------------------------------
     The first-run hero is a lens built from layers at different translateZ.
     Tilting the assembly toward the pointer (or the phone) is what turns a
     stack of circles into something that reads as an object with depth.
     Transform-only and rAF-throttled so it stays off the layout path, and
     skipped entirely when the visitor asks for reduced motion. */
  const calm=matchMedia('(prefers-reduced-motion:reduce)');
  let lens=null,tilting=false,tx=0,ty=0;
  function heroLens(){
    if(lens&&lens.isConnected)return lens;
    lens=document.querySelector('.hero-lens');return lens;
  }
  function applyTilt(){
    tilting=false;
    const el=heroLens();if(!el)return;
    el.style.setProperty('--tiltX',tx.toFixed(2)+'deg');
    el.style.setProperty('--tiltY',ty.toFixed(2)+'deg');
    const spec=el.querySelector('.hero-spec');
    /* The highlight slides against the tilt, the way a real reflection does. */
    if(spec)spec.style.transform=`translateZ(24px) translate(${(-ty*1.6).toFixed(1)}px,${(tx*1.6).toFixed(1)}px)`;
  }
  function queueTilt(){if(tilting||calm.matches)return;tilting=true;requestAnimationFrame(applyTilt)}
  function fromPointer(e){
    const el=heroLens();if(!el)return;
    const hero=el.closest('.home-v2-hero');if(!hero)return;
    const r=hero.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    tx=Math.max(-7,Math.min(7,-py*11));
    ty=Math.max(-7,Math.min(7,px*13));
    queueTilt();
  }
  function resetTilt(){tx=0;ty=0;queueTilt()}
  if(matchMedia('(pointer:fine)').matches){
    window.addEventListener('pointermove',e=>{
      if(document.body.dataset.route!=='home')return;
      fromPointer(e);
    },{passive:true});
    window.addEventListener('pointerleave',resetTilt,{passive:true});
  }else if('DeviceOrientationEvent'in window){
    /* No permission prompt: only listen if the platform grants it freely, which
       is every Android browser and iOS once the user has allowed motion. */
    window.addEventListener('deviceorientation',e=>{
      if(document.body.dataset.route!=='home'||e.beta==null||e.gamma==null)return;
      tx=Math.max(-6,Math.min(6,(e.beta-45)/6));
      ty=Math.max(-6,Math.min(6,e.gamma/6));
      queueTilt();
    },{passive:true});
  }
  calm.addEventListener?.('change',()=>{if(calm.matches){tx=0;ty=0;applyTilt()}});
  window.addEventListener('t7-route-changed',resetTilt);

  window.T7Motion={refresh(){registerReveal();updateRanges();capturePulse();reviewArrive()},tiltHero:queueTilt};
})();
