(()=>{
  const shoot=document.getElementById('shoot');
  const engine=window.T7Engine;
  if(!shoot||!engine)return;

  const profiles=engine.profiles;
  let selected=null,step=1;
  let context={light:'normal',motion:'still',support:'handheld'};
  try{selected=localStorage.getItem('canonT7LastShootSubject')||null}catch{}

  shoot.innerHTML=`
    <div class="shoot-flow">
      <div class="shoot-head">
        <div><div class="shoot-kicker">GUIDED SHOOT</div><h2>Let’s set up your shot</h2><p>Choose the photo, set your T7, frame it, then capture and review.</p></div>
        <span class="pill session-badge" id="shootSessionBadge">No session started</span>
      </div>
      <div class="shoot-steps" aria-label="Shoot steps">
        <div class="shoot-step active" data-step-indicator="1"><i>1</i><span>Subject</span></div>
        <div class="shoot-step" data-step-indicator="2"><i>2</i><span>Setup</span></div>
        <div class="shoot-step" data-step-indicator="3"><i>3</i><span>Frame</span></div>
        <div class="shoot-step" data-step-indicator="4"><i>4</i><span>Capture</span></div>
      </div>
      <div class="shoot-panel">
        <section class="shoot-screen active" data-screen="1">
          <div class="shoot-kicker">STEP 1 OF 4</div><h3>What are you shooting?</h3><p>Pick the closest match. The recommendation engine will build a T7-specific starting setup.</p>
          <div class="subject-grid">${Object.entries(profiles).map(([key,p])=>`<button class="subject-card" data-subject="${key}"><strong>${p.name}</strong><span>${p.sub}</span></button>`).join('')}</div>
          <div class="shoot-bottom"><span class="pill">Canon EOS Rebel T7 • 18–55mm</span><button class="button primary" id="shootNext1" disabled>Use this subject →</button></div>
        </section>
        <section class="shoot-screen" data-screen="2">
          <div class="shoot-kicker">STEP 2 OF 4</div><h3 id="setupHeading">Set your camera</h3><p id="setupIntro">Use these as your starting settings. The advice is built around the T7’s 9-point AF system, kit lens, and shooting modes.</p>
          <div class="setup-hero">
            <div class="setup-primary"><span class="setting-label">START HERE</span><div class="big-setting" id="setupMode">Av</div><span class="setting-label" id="setupModeLabel">Aperture priority</span><div class="shoot-session-summary" id="setupSummary"></div></div>
            <div class="setup-grid"><div class="setting-tile"><small>Lens</small><b id="setupLens">55mm</b></div><div class="setting-tile"><small>Exposure</small><b id="setupExposure">f/5.6</b></div><div class="setting-tile"><small>ISO</small><b id="setupIso">100–400</b></div><div class="setting-tile"><small>Autofocus</small><b id="setupFocus">One-Shot AF</b></div></div>
          </div>
          <div class="condition-strip"><div><b id="conditionTitle">Optional: use live conditions</b><p id="conditionHint">Check Photo Conditions first and this setup can adapt its ISO/light guidance.</p></div><button class="button" id="applyConditions">Use live conditions</button></div>
          <div class="tip" id="setupTip"></div>
          <div class="shoot-bottom"><button class="button" data-back="1">← Subject</button><button class="button primary" data-next="3">Camera is set →</button></div>
        </section>
        <section class="shoot-screen" data-screen="3">
          <div class="shoot-kicker">STEP 3 OF 4</div><h3>Frame the shot</h3><p>Before you press the shutter, make the composition deliberate.</p>
          <div class="frame-layout"><div class="frame-preview"><div class="frame-grid-v"></div><div class="frame-grid-h1"></div><div class="frame-grid-h2"></div><div class="frame-subject"></div><div class="frame-focus"></div><div class="frame-label" id="frameLabel">Portrait</div></div><div class="frame-guides" id="frameGuides"></div></div>
          <div class="shoot-bottom"><button class="button" data-back="2">← Settings</button><button class="button primary" data-next="4">Ready to capture →</button></div>
        </section>
        <section class="shoot-screen" data-screen="4">
          <div class="shoot-kicker">STEP 4 OF 4</div><h3>Take the photo</h3><p>Run the final check, take a few variations, then bring the best one back for review.</p>
          <div class="capture-card"><div class="capture-checks" id="captureChecks"></div><div class="capture-ready"><div class="camera-button">T7</div><h4>Take 3 versions</h4><p>Keep the core settings, but slightly change distance, timing, or angle between shots.</p><button class="button primary" id="reviewShot">I took the photo — review it</button><button class="button" id="restartShoot" style="margin-top:8px">Start another setup</button></div></div>
          <div class="shoot-bottom"><button class="button" data-back="3">← Framing</button><span class="pill">Pick the sharpest version to review</span></div>
        </section>
      </div>
    </div>`;

  const qs=s=>shoot.querySelector(s),qsa=s=>[...shoot.querySelectorAll(s)];
  function profile(){
    if(!selected)return null;
    const defaults={
      action:{motion:'fast'},night:{light:'night',support:'tripod'},indoor:{light:'indoor'},portrait:{motion:'still'},product:{motion:'still'},landscape:{motion:'still'}
    };
    return engine.recommend(selected,{...context,...(defaults[selected]||{})});
  }
  function goStep(n){step=n;qsa('.shoot-screen').forEach(x=>x.classList.toggle('active',Number(x.dataset.screen)===n));qsa('.shoot-step').forEach(x=>{const v=Number(x.dataset.stepIndicator);x.classList.toggle('active',v===n);x.classList.toggle('done',v<n)});shoot.scrollIntoView({behavior:'smooth',block:'start'});}
  function paintSubject(){qsa('.subject-card').forEach(x=>x.classList.toggle('selected',x.dataset.subject===selected));qs('#shootNext1').disabled=!selected;if(selected)qs('#shootSessionBadge').textContent=profiles[selected].name+' session';}
  function renderSetup(){const p=profile();if(!p)return;qs('#setupHeading').textContent=p.name+' setup';qs('#setupMode').textContent=p.mode;qs('#setupModeLabel').textContent=engine.modeLabel(p.mode);qs('#setupLens').textContent=p.lens;qs('#setupExposure').textContent=p.exposure;qs('#setupIso').textContent=p.iso;qs('#setupFocus').textContent=p.afMode;qs('#setupSummary').innerHTML=`<span>${p.lens}</span><span>${p.exposure}</span><span>${p.iso}</span><span>${p.drive}</span>`;qs('#setupTip').innerHTML=`<b>Best improvement:</b> ${p.tip}<br><br><b>T7 focus setup:</b> ${p.focusPoint} • ${p.drive}`;qs('#frameLabel').textContent=p.name+' • '+p.focus;qs('#frameGuides').innerHTML=p.frame.map((x,i)=>`<div class="guide-row"><i>${i+1}</i><div><b>${x}</b><span>${i===0?'Set your position before changing tiny settings.':i===1?'Guide the viewer directly to the subject.':'Scan the edges once before pressing the shutter.'}</span></div></div>`).join('');qs('#captureChecks').innerHTML=[...p.check,`AF: ${p.afMode}`,`Drive: ${p.drive}`].map(x=>`<label class="capture-check"><input type="checkbox"><span>${x}</span></label>`).join('');}

  qsa('.subject-card').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.subject;try{localStorage.setItem('canonT7LastShootSubject',selected);localStorage.setItem('canonReviewGoal',selected)}catch{}paintSubject();renderSetup();}));
  qs('#shootNext1').addEventListener('click',()=>{renderSetup();goStep(2)});
  qsa('[data-next]').forEach(btn=>btn.addEventListener('click',()=>goStep(Number(btn.dataset.next))));
  qsa('[data-back]').forEach(btn=>btn.addEventListener('click',()=>goStep(Number(btn.dataset.back))));

  qs('#applyConditions').addEventListener('click',()=>{
    const results=document.getElementById('weatherResults');
    if(!results||results.hidden){qs('#conditionTitle').textContent='No live conditions loaded yet';qs('#conditionHint').textContent='Open Conditions, search your city or use your location, then return here.';location.hash='conditions';return;}
    const cloud=parseInt(document.getElementById('wcCloud')?.textContent||'50',10),wind=document.getElementById('wcWind')?.textContent||'—',rain=document.getElementById('wcRain')?.textContent||'—';
    context.light=cloud<25?'bright':'normal';
    qs('#conditionTitle').textContent='Live conditions applied';qs('#conditionHint').textContent=`Cloud ${cloud}% • Wind ${wind} • Rain ${rain}. The T7 setup above has been refreshed for the available light.`;renderSetup();
  });

  window.addEventListener('t7-conditions-updated',e=>{const cloud=Number(e.detail?.current?.cloud_cover||50);context.light=cloud<25?'bright':'normal';if(step===2&&selected)renderSetup();});
  qs('#reviewShot').addEventListener('click',()=>{try{if(selected)localStorage.setItem('canonReviewGoal',selected)}catch{}location.hash='edit';const file=document.getElementById('fileInput');setTimeout(()=>{try{file?.click()}catch{}},220)});
  qs('#restartShoot').addEventListener('click',()=>{selected=null;paintSubject();goStep(1)});

  if(selected&&profiles[selected]){paintSubject();renderSetup();}
})();