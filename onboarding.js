(()=>{
  const $=s=>document.querySelector(s);
  const usedBefore=()=>{
    try{
      if(localStorage.getItem('t7StudioOnboardedV1'))return true;
      const keys=['canonT7LastShootSubject','canonT7LastScene','canonReviewGoal','canonT7Practice','canonT7ControlsSeen','canonT7SimulatorSeen'];
      return keys.some(k=>localStorage.getItem(k));
    }catch{return true}
  };

  const overlay=document.createElement('div');
  overlay.className='t7-onboard';overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`<section class="t7-onboard-card" role="dialog" aria-modal="true" aria-label="Welcome to T7 Studio">
    <div class="t7-onboard-top"><div class="t7-onboard-brand"><div class="t7-onboard-lens"></div><div><b>T7 Studio</b><span>Canon Rebel T7 companion</span></div></div><button class="t7-onboard-skip" type="button">Skip</button></div>
    <div class="t7-onboard-stage">
      <div class="t7-onboard-page active" data-onboard-page="0"><span class="t7-onboard-kicker">Built for your camera</span><h2>Learn the T7 by actually shooting.</h2><p>No giant manual. Pick the photo you want, get a practical Rebel T7 setup, then learn what to change from the result.</p><div class="t7-onboard-visual camera" aria-hidden="true"></div></div>
      <div class="t7-onboard-page" data-onboard-page="1"><span class="t7-onboard-kicker">One simple loop</span><h2>Shoot. Review. Improve.</h2><p>T7 Studio keeps the workflow focused so you learn from your own photos instead of memorizing settings in isolation.</p><div class="t7-onboard-visual flow" aria-hidden="true"><div class="t7-onboard-flow-step"><i>1</i><b>Shoot</b><span>Setup</span></div><div class="t7-onboard-flow-step"><i>2</i><b>Review</b><span>Diagnose</span></div><div class="t7-onboard-flow-step"><i>3</i><b>Reshoot</b><span>Change one thing</span></div><div class="t7-onboard-flow-step"><i>4</i><b>Learn</b><span>Build skill</span></div></div></div>
      <div class="t7-onboard-page" data-onboard-page="2"><span class="t7-onboard-kicker">Local-first</span><h2>Your photos stay on your device.</h2><p>Photo analysis, EXIF reading, editing, history and learning data are designed to run locally. Live Conditions only needs the internet when you choose to use it.</p><div class="t7-onboard-visual private" aria-hidden="true"><div class="t7-onboard-private-icon">✓</div><div class="t7-onboard-private-copy"><b>Private by default</b><span>Local photo workflow · offline-friendly</span></div></div></div>
    </div>
    <div class="t7-onboard-footer"><div class="t7-onboard-dots"><i class="active"></i><i></i><i></i></div><button class="t7-onboard-next" type="button">Continue</button></div>
  </section>`;
  document.body.appendChild(overlay);

  let page=0;const pages=[...overlay.querySelectorAll('[data-onboard-page]')],dots=[...overlay.querySelectorAll('.t7-onboard-dots i')],next=overlay.querySelector('.t7-onboard-next'),skip=overlay.querySelector('.t7-onboard-skip');
  function paint(){pages.forEach((p,i)=>p.classList.toggle('active',i===page));dots.forEach((d,i)=>d.classList.toggle('active',i===page));next.textContent=page===pages.length-1?'Start shooting':'Continue'}
  function markDone(){try{localStorage.setItem('t7StudioOnboardedV1','1')}catch{}}
  function close(start=false){markDone();overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';if(start)setTimeout(()=>{location.hash='shoot'},180)}
  function open(){page=0;paint();overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>next.focus(),120)}
  next.onclick=()=>{if(page<pages.length-1){page++;paint()}else close(true)};skip.onclick=()=>close(false);overlay.addEventListener('click',e=>{if(e.target===overlay)close(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('show'))close(false)});

  const top=$('.topbar');if(top&&!$('.t7-onboard-help')){const help=document.createElement('button');help.className='t7-onboard-help';help.type='button';help.setAttribute('aria-label','Open T7 Studio introduction');help.textContent='?';help.onclick=open;top.appendChild(help)}
  window.T7Onboarding={open,close};
  if(!usedBefore())setTimeout(open,650);
})();
