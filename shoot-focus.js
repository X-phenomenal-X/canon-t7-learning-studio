(()=>{
  const $=s=>document.querySelector(s);
  const shoot=$('#shoot'),step2=shoot?.querySelector('.shoot-screen[data-screen="2"]');
  if(!shoot||!step2||step2.querySelector('.sf-priority'))return;

  const hero=step2.querySelector('.setup-v2-hero'),strip=step2.querySelector('.setup-v2-strip'),tip=step2.querySelector('.setup-v2-tip'),conditions=step2.querySelector('.condition-strip-v2'),sceneFix=step2.querySelector('.scene-fix-card'),bottom=step2.querySelector('.shoot-v2-bottom');
  if(!hero||!strip||!tip||!bottom)return;

  const priority=document.createElement('section');
  priority.className='sf-priority';
  priority.innerHTML=`<div class="sf-priority-copy"><span class="sf-kicker">DO THIS FIRST</span><h4 id="sfTitle">Set the most important value first.</h4><p id="sfReason">Start with the setting that protects this kind of photo, then leave the supporting settings alone for your first test shot.</p><div class="sf-progress-note"><i></i><span>Take one test photo before changing multiple settings.</span></div></div><div class="sf-priority-value"><small id="sfLabel">PRIORITY</small><b id="sfValue">—</b><button type="button" class="sf-set-button" id="sfSet">How to set</button></div>`;

  const quick=document.createElement('div');quick.className='sf-quick';
  const more=document.createElement('details');more.className='sf-more';
  more.innerHTML=`<summary><div class="sf-more-summary"><b>Full camera setup</b><small>Mode · lens · ISO · autofocus · drive · conditions</small></div><span class="sf-more-chevron">+</span></summary><div class="sf-more-body"></div>`;
  const moreBody=more.querySelector('.sf-more-body');

  step2.insertBefore(priority,hero);
  priority.after(quick);
  // Keep the concise one-thing-to-remember tip visible. Move the full settings out of the first visual layer.
  moreBody.append(hero,strip);
  if(conditions)moreBody.append(conditions);
  bottom.before(more);

  const profiles={
    portrait:{type:'lens',label:'LENS FIRST',title:'Start at the long end of your lens.',reason:'Zoom toward 50–55mm before you worry about fine adjustments. It gives portraits cleaner perspective and easier background separation.'},
    product:{type:'exposure',label:'APERTURE FIRST',title:'Set the depth of field first.',reason:'Start with the recommended aperture so the important product detail stays sharp without making the whole scene unnecessarily busy.'},
    landscape:{type:'exposure',label:'APERTURE FIRST',title:'Lock in depth before anything else.',reason:'Start around f/8. Then keep ISO low and concentrate on a level horizon and a stronger composition.'},
    action:{type:'exposure',label:'SHUTTER FIRST',title:'Freeze movement first.',reason:'Your shutter speed is the non-negotiable setting. Start fast, then let ISO rise if that is what it takes to keep the subject sharp.'},
    indoor:{type:'exposure',label:'LIGHT FIRST',title:'Open the lens before pushing ISO.',reason:'Use the widest useful aperture, move toward better light, and then raise ISO only enough to protect a safe handheld shutter.'},
    night:{type:'exposure',label:'EXPOSURE FIRST',title:'Build the shot around stability.',reason:'Use the long exposure the scene needs, keep ISO low, and let a tripod or stable surface do the work instead of handholding.'}
  };
  const scenes={
    tvDark:{type:'exposure',label:'SHUTTER FIRST',title:'Protect the screen first.',reason:'Start around 1/60 so the TV stays controlled. If the room is too dark, raise ISO or lower the TV brightness before sacrificing the screen.'},
    brightWindow:{type:'exposure',label:'SHUTTER / FACE',title:'Protect the face and keep it sharp.',reason:'Keep roughly 1/125 or faster for a person, then position them toward the window so the light solves more than exposure compensation can.'},
    blackCarSun:{type:'exposure',label:'HIGHLIGHTS FIRST',title:'Protect reflections on the paint.',reason:'Use the recommended slight negative exposure so bright reflections keep texture. Do not brighten the black paint until the highlights are safe.'},
    indoorProduct:{type:'lens',label:'LENS FIRST',title:'Give the product cleaner perspective.',reason:'Start around 45–55mm and step back. Then place the product near soft light before pushing exposure controls.'},
    movingCar:{type:'exposure',label:'SHUTTER FIRST',title:'Set 1/1000 before anything else.',reason:'Freeze the car first. Keep AI Servo active and let ISO rise rather than sacrificing the shutter speed that makes the shot work.'},
    nightHandheld:{type:'exposure',label:'SHUTTER FIRST',title:'Protect a handheld shutter.',reason:'Stay around 1/60 or faster. Use the widest aperture and accept higher ISO instead of chasing a cleaner but blurry frame.'}
  };

  const source={mode:'#setupMode',lens:'#setupLens',exposure:'#setupExposure',iso:'#setupIso',af:'#setupFocus',drive:'#setupDrive'};
  function value(type){return $(source[type])?.textContent?.trim()||'—'}
  function context(){
    const scene=window.T7Store?.get?.('shootScene',null)||(()=>{try{return localStorage.getItem('canonT7LastScene')}catch{return null}})();
    const subject=window.T7Store?.get?.('shootSubject',null)||(()=>{try{return localStorage.getItem('canonT7LastShootSubject')}catch{return null}})()||'portrait';
    return{scene,subject};
  }
  function config(){const c=context();return(c.scene&&scenes[c.scene])||profiles[c.subject]||profiles.portrait}
  function targetFor(type){const el=$(source[type]);return el?.closest('.t7-help-target,.setup-v2-mode,.setup-v2-main>div,.setup-v2-strip>div')||null}
  function invokeGuide(type){
    const target=targetFor(type);
    if(target?.dataset?.t7Guide){target.click();return}
    // camera-steps may decorate a few ms later on first boot. Retry once.
    setTimeout(()=>targetFor(type)?.click(),80);
  }
  function quickTypes(primary){
    const all=primary==='lens'?['mode','exposure','iso']:['mode','lens','iso'];
    return all;
  }
  function render(){
    const c=config(),primaryType=c.type;
    $('#sfTitle').textContent=c.title;$('#sfReason').textContent=c.reason;$('#sfLabel').textContent=c.label;$('#sfValue').textContent=value(primaryType);
    const btn=$('#sfSet');btn.dataset.type=primaryType;btn.setAttribute('aria-label',`How to set ${value(primaryType)} on the Rebel T7`);
    quick.innerHTML=quickTypes(primaryType).map(type=>`<button type="button" class="sf-quick-item" data-sf-type="${type}"><small>${type==='af'?'AUTOFOCUS':type.toUpperCase()}</small><b>${value(type)}</b></button>`).join('');
    quick.querySelectorAll('[data-sf-type]').forEach(b=>b.onclick=()=>invokeGuide(b.dataset.sfType));
  }
  $('#sfSet').onclick=()=>invokeGuide($('#sfSet').dataset.type||config().type);

  // renderSetup() updates these nodes; refresh this focus layer whenever one changes.
  const watch=['#setupMode','#setupLens','#setupExposure','#setupIso','#setupFocus','#setupDrive'].map($).filter(Boolean);
  const mo=new MutationObserver(()=>requestAnimationFrame(render));watch.forEach(el=>mo.observe(el,{childList:true,characterData:true,subtree:true}));
  window.addEventListener('t7-store-change',e=>{if(['shootSubject','shootScene'].includes(e.detail?.name))requestAnimationFrame(render)});
  window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='shoot')requestAnimationFrame(render)});
  render();
})();
