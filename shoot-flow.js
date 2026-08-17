(()=>{
  const shoot=document.getElementById('shoot');
  const engine=window.T7Engine;
  if(!shoot||!engine)return;

  const profiles=engine.profiles,scenes=engine.scenes||{};
  let selected=null,selectedScene=null,step=1;
  let context={light:'normal',motion:'still',support:'handheld'};
  try{selected=localStorage.getItem('canonT7LastShootSubject')||null;selectedScene=localStorage.getItem('canonT7LastScene')||null}catch{}
  if(selectedScene&&!scenes[selectedScene])selectedScene=null;
  if(selectedScene)selected=scenes[selectedScene]?.subject||selected;

  const shortLabels={portrait:'Portrait',product:'Product',landscape:'Landscape',action:'Action',indoor:'Indoor',night:'Night'};

  shoot.innerHTML=`
    <div class="shoot-flow shoot-flow-v2">
      <header class="shoot-v2-head">
        <div>
          <span class="shoot-v2-eyebrow">GUIDED SHOOT</span>
          <h2>What do you want to photograph?</h2>
          <p>Pick the shot. T7 Studio will give you one practical starting setup.</p>
        </div>
        <span class="shoot-v2-session" id="shootSessionBadge">New session</span>
      </header>

      <div class="shoot-v2-progress" aria-label="Shoot progress">
        <button class="shoot-v2-step active" data-step-indicator="1"><i>1</i><span>Subject</span></button>
        <button class="shoot-v2-step" data-step-indicator="2"><i>2</i><span>Setup</span></button>
        <button class="shoot-v2-step" data-step-indicator="3"><i>3</i><span>Frame</span></button>
        <button class="shoot-v2-step" data-step-indicator="4"><i>4</i><span>Capture</span></button>
      </div>

      <div class="shoot-v2-stage">
        <section class="shoot-screen active" data-screen="1">
          <div class="shoot-v2-screen-title">
            <span>01</span>
            <div><h3>Choose your subject</h3><p>Use the closest match. You can refine it with a real-world scene below.</p></div>
          </div>
          <div class="subject-grid subject-grid-v2">
            ${Object.entries(profiles).map(([key,p],i)=>`<button class="subject-card subject-card-v2 subject-${key}" data-subject="${key}"><span class="subject-index">0${i+1}</span><div class="subject-copy"><strong>${shortLabels[key]||p.name}</strong><span>${p.sub}</span></div><span class="subject-arrow">›</span></button>`).join('')}
          </div>

          <div class="scene-assist-card">
            <div class="scene-assist-head"><div><small>REAL-WORLD SCENE ASSIST</small><b>Tricky scene?</b><p>Pick the exact situation and T7 Studio will override the generic setup only where it matters.</p></div><span>Optional</span></div>
            <div class="scene-assist-grid">
              ${Object.entries(scenes).map(([key,s])=>`<button class="scene-assist-option" data-scene="${key}"><b>${s.name}</b><small>${shortLabels[s.subject]||s.subject}</small></button>`).join('')}
            </div>
            <button class="scene-assist-clear" id="sceneAssistClear" hidden>Use broad subject instead</button>
          </div>

          <div class="shoot-v2-bottom"><span id="subjectHint">Select one to continue</span><button class="button primary" id="shootNext1" disabled>Continue</button></div>
        </section>

        <section class="shoot-screen" data-screen="2">
          <div class="shoot-v2-screen-title">
            <span>02</span>
            <div><h3 id="setupHeading">Your T7 setup</h3><p>Start here. Take one test photo before changing multiple settings.</p></div>
          </div>

          <div class="setup-v2-hero">
            <div class="setup-v2-mode">
              <small>MODE</small>
              <strong id="setupMode">Av</strong>
              <span id="setupModeLabel">Aperture priority</span>
            </div>
            <div class="setup-v2-main">
              <div><small>LENS</small><strong id="setupLens">50–55mm</strong></div>
              <div><small>STARTING EXPOSURE</small><strong id="setupExposure">f/5.6</strong></div>
            </div>
          </div>

          <div class="setup-v2-strip">
            <div><small>ISO</small><b id="setupIso">100–400</b></div>
            <div><small>AUTOFOCUS</small><b id="setupFocus">One-Shot AF</b></div>
            <div><small>DRIVE</small><b id="setupDrive">Single</b></div>
          </div>

          <div class="setup-v2-tip" id="setupTip"></div>
          <div id="setupSummary" hidden></div>

          <div class="scene-fix-card" id="sceneFixCard" hidden>
            <div class="scene-fix-head"><div><small>AFTER YOUR FIRST TEST SHOT</small><b>What looks wrong?</b></div><button id="sceneFixReset" type="button">Reset</button></div>
            <div class="scene-fix-actions" id="sceneFixActions"></div>
            <div class="scene-fix-answer" id="sceneFixAnswer">Take the recommended test shot first, then change only one thing.</div>
          </div>

          <div class="condition-strip condition-strip-v2">
            <div><small>LIVE LIGHT</small><b id="conditionTitle">Use current conditions</b><p id="conditionHint">Optional — apply weather/light guidance if you checked Conditions.</p></div>
            <button class="button" id="applyConditions">Apply</button>
          </div>

          <div class="shoot-v2-bottom"><button class="button" data-back="1">Back</button><button class="button primary" data-next="3">Set camera</button></div>
        </section>

        <section class="shoot-screen" data-screen="3">
          <div class="shoot-v2-screen-title">
            <span>03</span>
            <div><h3>Frame it before you shoot</h3><p>Composition usually matters more than another tiny setting change.</p></div>
          </div>

          <div class="frame-layout frame-layout-v2">
            <div class="frame-preview frame-preview-v2" id="framePreview">
              <div class="frame-grid-v"></div><div class="frame-grid-h1"></div><div class="frame-grid-h2"></div>
              <div class="frame-subject"></div><div class="frame-focus"></div>
              <div class="frame-label" id="frameLabel">Portrait</div>
            </div>
            <div class="frame-guides frame-guides-v2" id="frameGuides"></div>
          </div>

          <div class="shoot-v2-bottom"><button class="button" data-back="2">Back</button><button class="button primary" data-next="4">Looks good</button></div>
        </section>

        <section class="shoot-screen" data-screen="4">
          <div class="shoot-v2-screen-title">
            <span>04</span>
            <div><h3>Ready to capture</h3><p>Do one last check, then take a few controlled variations.</p></div>
          </div>

          <div class="capture-v2">
            <div class="capture-ready-v2">
              <div class="capture-shutter" aria-hidden="true"><span></span></div>
              <small>YOUR T7 IS READY</small>
              <h4>Take 3 versions.</h4>
              <p>Keep the setup. Change only distance, timing, or angle.</p>
            </div>
            <div class="capture-checks capture-checks-v2" id="captureChecks"></div>
          </div>

          <div class="capture-v2-actions"><button class="button primary" id="reviewShot">Review my photo</button><button class="button" id="restartShoot">New setup</button></div>
          <div class="shoot-v2-bottom"><button class="button" data-back="3">Back</button><span>Choose the sharpest frame to review.</span></div>
        </section>
      </div>
    </div>`;

  const qs=s=>shoot.querySelector(s),qsa=s=>[...shoot.querySelectorAll(s)];
  function baseDefaults(subject){return{action:{motion:'fast'},night:{light:'night',support:'tripod'},indoor:{light:'indoor'},portrait:{motion:'still'},product:{motion:'still'},landscape:{motion:'still'}}[subject]||{}}
  function profile(){
    if(selectedScene&&scenes[selectedScene])return engine.recommendScene(selectedScene,{...context,...baseDefaults(scenes[selectedScene].subject)});
    if(!selected)return null;
    return engine.recommend(selected,{...context,...baseDefaults(selected)});
  }

  function goStep(n){
    step=n;
    qsa('.shoot-screen').forEach(x=>x.classList.toggle('active',Number(x.dataset.screen)===n));
    qsa('.shoot-v2-step').forEach(x=>{const v=Number(x.dataset.stepIndicator);x.classList.toggle('active',v===n);x.classList.toggle('done',v<n)});
    shoot.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function displayName(){return selectedScene&&scenes[selectedScene]?scenes[selectedScene].name:(selected&&profiles[selected]?profiles[selected].name:'')}
  function paintSubject(){
    qsa('.subject-card').forEach(x=>x.classList.toggle('selected',x.dataset.subject===selected&&!selectedScene));
    qsa('.scene-assist-option').forEach(x=>x.classList.toggle('selected',x.dataset.scene===selectedScene));
    qs('#sceneAssistClear').hidden=!selectedScene;
    qs('#shootNext1').disabled=!(selected||selectedScene);
    qs('#subjectHint').textContent=displayName()?`${displayName()} selected`:'Select one to continue';
    qs('#shootSessionBadge').textContent=displayName()||'New session';
  }

  function renderSceneFixes(p){
    const card=qs('#sceneFixCard'),actions=qs('#sceneFixActions'),answer=qs('#sceneFixAnswer');
    if(!p?.scene||!p.fixes){card.hidden=true;actions.innerHTML='';return}
    const labels={tooBright:'Too bright',tooDark:'Too dark',blurry:'Blurry / soft',banding:'Screen bands'};
    const keys=Object.keys(p.fixes);card.hidden=false;
    actions.innerHTML=keys.map(k=>`<button type="button" data-scene-problem="${k}">${labels[k]||k}</button>`).join('');
    answer.textContent='Take the recommended test shot first, then change only one thing.';
    actions.querySelectorAll('[data-scene-problem]').forEach(b=>b.onclick=()=>{actions.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));answer.innerHTML=`<b>Change this first</b><span>${p.fixes[b.dataset.sceneProblem]}</span>`});
  }

  function renderSetup(){
    const p=profile();if(!p)return;
    qs('#setupHeading').textContent=`${p.name} setup`;
    qs('#setupMode').textContent=p.mode;
    qs('#setupModeLabel').textContent=engine.modeLabel(p.mode);
    qs('#setupLens').textContent=p.lens;
    qs('#setupExposure').textContent=p.exposure;
    qs('#setupIso').textContent=p.iso;
    qs('#setupFocus').textContent=p.afMode;
    qs('#setupDrive').textContent=p.drive;
    qs('#setupSummary').innerHTML=`<span>${p.lens}</span><span>${p.exposure}</span><span>${p.iso}</span><span>${p.drive}</span>`;
    qs('#setupTip').innerHTML=`<small>${p.scene?'SCENE PRIORITY':'ONE THING TO REMEMBER'}</small><b>${p.tip}</b><span>${p.focusPoint} • ${p.drive}</span>`;
    qs('#frameLabel').textContent=p.name;
    qs('#framePreview').dataset.subject=selected||p.subject;
    qs('#frameGuides').innerHTML=p.frame.map((x,i)=>`<div class="guide-row guide-row-v2"><i>${i+1}</i><div><b>${x}</b>${i===0?'<span>Set your position first.</span>':i===1?'<span>Lead the eye to the subject.</span>':'<span>Scan the edges once.</span>'}</div></div>`).join('');
    qs('#captureChecks').innerHTML=[...p.check,`AF: ${p.afMode}`,`Drive: ${p.drive}`].slice(0,4).map(x=>`<label class="capture-check capture-check-v2"><input type="checkbox"><span>${x}</span></label>`).join('');
    renderSceneFixes(p);
  }

  qsa('.subject-card').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.subject;selectedScene=null;try{localStorage.setItem('canonT7LastShootSubject',selected);localStorage.removeItem('canonT7LastScene');localStorage.setItem('canonReviewGoal',selected)}catch{}window.T7Store?.set('shootSubject',selected);window.T7Store?.set('shootScene',null);paintSubject();renderSetup()}));
  qsa('.scene-assist-option').forEach(btn=>btn.addEventListener('click',()=>{selectedScene=btn.dataset.scene;selected=scenes[selectedScene]?.subject||selected;try{localStorage.setItem('canonT7LastScene',selectedScene);localStorage.setItem('canonT7LastShootSubject',selected);localStorage.setItem('canonReviewGoal',selected)}catch{}window.T7Store?.set('shootSubject',selected);window.T7Store?.set('shootScene',selectedScene);paintSubject();renderSetup()}));
  qs('#sceneAssistClear').addEventListener('click',()=>{selectedScene=null;try{localStorage.removeItem('canonT7LastScene')}catch{}window.T7Store?.set('shootScene',null);paintSubject();renderSetup()});
  qs('#sceneFixReset').addEventListener('click',()=>renderSceneFixes(profile()));

  qs('#shootNext1').addEventListener('click',()=>{renderSetup();goStep(2)});
  qsa('[data-next]').forEach(btn=>btn.addEventListener('click',()=>goStep(Number(btn.dataset.next))));
  qsa('[data-back]').forEach(btn=>btn.addEventListener('click',()=>goStep(Number(btn.dataset.back))));
  qsa('.shoot-v2-step').forEach(btn=>btn.addEventListener('click',()=>{const n=Number(btn.dataset.stepIndicator);if(n===1||selected||selectedScene)goStep(n)}));

  qs('#applyConditions').addEventListener('click',()=>{
    const results=document.getElementById('weatherResults');
    if(!results||results.hidden){qs('#conditionTitle').textContent='No conditions loaded';qs('#conditionHint').textContent='Open Conditions, check your location, then come back.';location.hash='conditions';return;}
    const cloud=parseInt(document.getElementById('wcCloud')?.textContent||'50',10),wind=document.getElementById('wcWind')?.textContent||'—',rain=document.getElementById('wcRain')?.textContent||'—';
    context.light=cloud<25?'bright':'normal';
    qs('#conditionTitle').textContent='Current light applied';qs('#conditionHint').textContent=`Cloud ${cloud}% • Wind ${wind} • Rain ${rain}`;renderSetup();
  });

  window.addEventListener('t7-conditions-updated',e=>{const cloud=Number(e.detail?.current?.cloud_cover||50);context.light=cloud<25?'bright':'normal';if(step===2&&(selected||selectedScene))renderSetup()});
  qs('#reviewShot').addEventListener('click',()=>{try{if(selected)localStorage.setItem('canonReviewGoal',selected);if(selectedScene)localStorage.setItem('canonT7LastScene',selectedScene)}catch{}window.T7Store?.set('shootSubject',selected);window.T7Store?.set('shootScene',selectedScene);location.hash='edit';const file=document.getElementById('fileInput');setTimeout(()=>{try{file?.click()}catch{}},220)});
  qs('#restartShoot').addEventListener('click',()=>{selected=null;selectedScene=null;try{localStorage.removeItem('canonT7LastScene')}catch{}window.T7Store?.set('shootScene',null);paintSubject();goStep(1)});

  if((selected&&profiles[selected])||selectedScene){paintSubject();renderSetup()}
})();