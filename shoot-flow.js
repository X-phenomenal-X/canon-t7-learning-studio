(()=>{
  const shoot=document.getElementById('shoot');
  if(!shoot)return;

  const link=document.createElement('link');
  link.rel='stylesheet';link.href='./shoot-flow.css';document.head.appendChild(link);

  const profiles={
    portrait:{name:'Portrait',sub:'People + natural background blur',mode:'Av',lens:'50–55mm',exposure:'f/5.6',iso:'100–400',focus:'One-Shot • nearest eye',tip:'Move the person farther from the background. Step back and use 55mm instead of getting close at 18mm.',frame:['Shoot around eye level','Place the nearest eye near an upper-third point','Keep distracting objects away from the head and frame edges'],check:['Lens set near 55mm','Focus point is on the nearest eye','Shutter speed is at least around 1/125 sec']},
    product:{name:'Product',sub:'Tech, objects, clean detail',mode:'Av',lens:'35–55mm',exposure:'f/5.6–f/8',iso:'100–400',focus:'One-Shot • precise point',tip:'Use soft window light from the side. Clean fingerprints and simplify the background before changing camera settings.',frame:['Use a clean angle that shows the product shape','Leave intentional space around the object','Focus on the logo, texture, or most important detail'],check:['Product and background are clean','Window or soft light is hitting the subject','Important detail is sharp']},
    landscape:{name:'Landscape',sub:'Scenery, architecture, wide views',mode:'Av',lens:'18–24mm',exposure:'f/8',iso:'100',focus:'One-Shot • mid-distance',tip:'Keep the horizon straight and include a foreground object when possible to make the scene feel deeper.',frame:['Keep the horizon level','Use foreground, middle ground, and background','Check the edges for cut-off objects or distractions'],check:['ISO is low','Horizon is straight','Camera is steady before pressing the shutter']},
    action:{name:'Action',sub:'Sports, pets, cars, movement',mode:'Tv',lens:'35–55mm',exposure:'1/500–1/1000',iso:'Auto ISO',focus:'AI Servo / continuous',tip:'Prioritize shutter speed. A little ISO noise is usually much better than a blurred subject.',frame:['Leave space in front of the moving subject','Track movement before pressing the shutter','Use a slightly wider frame until timing improves'],check:['Shutter is at least 1/500 sec','Subject has room to move in the frame','You are following the subject before the shot']},
    indoor:{name:'Indoor',sub:'People and everyday low-light scenes',mode:'Av',lens:'24–55mm',exposure:'widest aperture',iso:'800–1600',focus:'One-Shot • subject detail',tip:'Move closer to a window or brighter area before pushing ISO too high. Watch that shutter speed does not fall too low.',frame:['Turn the subject toward the brightest soft light','Avoid mixed lighting when possible','Keep the background simpler than the subject'],check:['Subject is near useful light','Shutter speed is fast enough for handheld use','Focus is confirmed before pressing fully']},
    night:{name:'Night / Tripod',sub:'City lights, landscapes, long exposures',mode:'M',lens:'18–35mm',exposure:'f/8 • start 1–2s',iso:'100',focus:'One-Shot then lock/manual if needed',tip:'Put the camera on a tripod or stable surface and use the 2-second timer so pressing the shutter does not shake the shot.',frame:['Use lights or roads as leading lines','Protect bright signs and lamps from blowing out','Keep the composition simple and intentional'],check:['Camera is stable','ISO is 100','2-second timer is enabled']}
  };

  shoot.innerHTML=`
    <div class="shoot-flow">
      <div class="shoot-head">
        <div><div class="shoot-kicker">GUIDED SHOOT</div><h2>Let’s set up your shot</h2><p>One step at a time. Choose the photo, set the camera, frame it, then capture and review.</p></div>
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
          <div class="shoot-kicker">STEP 1 OF 4</div><h3>What are you shooting?</h3><p>Pick the closest match. We’ll build the starting setup around it.</p>
          <div class="subject-grid">
            ${Object.entries(profiles).map(([key,p])=>`<button class="subject-card" data-subject="${key}"><strong>${p.name}</strong><span>${p.sub}</span></button>`).join('')}
          </div>
          <div class="shoot-bottom"><span class="pill">Canon EOS Rebel T7 • 18–55mm</span><button class="button primary" id="shootNext1" disabled>Use this subject →</button></div>
        </section>
        <section class="shoot-screen" data-screen="2">
          <div class="shoot-kicker">STEP 2 OF 4</div><h3 id="setupHeading">Set your camera</h3><p id="setupIntro">Use these as your starting settings. You can fine-tune after the first shot.</p>
          <div class="setup-hero">
            <div class="setup-primary"><span class="setting-label">START HERE</span><div class="big-setting" id="setupMode">Av</div><span class="setting-label" id="setupModeLabel">Aperture priority</span><div class="shoot-session-summary" id="setupSummary"></div></div>
            <div class="setup-grid"><div class="setting-tile"><small>Lens</small><b id="setupLens">55mm</b></div><div class="setting-tile"><small>Exposure</small><b id="setupExposure">f/5.6</b></div><div class="setting-tile"><small>ISO</small><b id="setupIso">100–400</b></div><div class="setting-tile"><small>Focus</small><b id="setupFocus">Nearest eye</b></div></div>
          </div>
          <div class="condition-strip"><div><b id="conditionTitle">Optional: use live conditions</b><p id="conditionHint">Open Photo Conditions first and this step can use the weather/light information already on the page.</p></div><button class="button" id="applyConditions">Use live conditions</button></div>
          <div class="tip" id="setupTip"></div>
          <div class="shoot-bottom"><button class="button" data-back="1">← Subject</button><button class="button primary" data-next="3">Camera is set →</button></div>
        </section>
        <section class="shoot-screen" data-screen="3">
          <div class="shoot-kicker">STEP 3 OF 4</div><h3>Frame the shot</h3><p>Before you press the shutter, make the composition deliberate.</p>
          <div class="frame-layout">
            <div class="frame-preview"><div class="frame-grid-v"></div><div class="frame-grid-h1"></div><div class="frame-grid-h2"></div><div class="frame-subject"></div><div class="frame-focus"></div><div class="frame-label" id="frameLabel">Portrait • focus on eye</div></div>
            <div class="frame-guides" id="frameGuides"></div>
          </div>
          <div class="shoot-bottom"><button class="button" data-back="2">← Settings</button><button class="button primary" data-next="4">Ready to capture →</button></div>
        </section>
        <section class="shoot-screen" data-screen="4">
          <div class="shoot-kicker">STEP 4 OF 4</div><h3>Take the photo</h3><p>Run the final check, take a few variations, then bring the best one back for review.</p>
          <div class="capture-card">
            <div class="capture-checks" id="captureChecks"></div>
            <div class="capture-ready"><div class="camera-button">T7</div><h4>Take 3 versions</h4><p>Keep the settings, but slightly change your distance or angle between shots.</p><button class="button primary" id="reviewShot">I took the photo — review it</button><button class="button" id="restartShoot" style="margin-top:8px">Start another setup</button></div>
          </div>
          <div class="shoot-bottom"><button class="button" data-back="3">← Framing</button><span class="pill">Pick the sharpest version to edit</span></div>
        </section>
      </div>
    </div>`;

  let selected=null,step=1;
  try{selected=localStorage.getItem('canonT7LastShootSubject')||null}catch{}

  const modeLabel=m=>m==='Av'?'Aperture priority':m==='Tv'?'Shutter priority':m==='M'?'Manual exposure':m;
  const qs=s=>shoot.querySelector(s),qsa=s=>[...shoot.querySelectorAll(s)];

  function goStep(n){step=n;qsa('.shoot-screen').forEach(x=>x.classList.toggle('active',Number(x.dataset.screen)===n));qsa('.shoot-step').forEach(x=>{const v=Number(x.dataset.stepIndicator);x.classList.toggle('active',v===n);x.classList.toggle('done',v<n)});shoot.scrollIntoView({behavior:'smooth',block:'start'});}
  function paintSubject(){qsa('.subject-card').forEach(x=>x.classList.toggle('selected',x.dataset.subject===selected));qs('#shootNext1').disabled=!selected;if(selected){const p=profiles[selected];qs('#shootSessionBadge').textContent=p.name+' session';}}
  function renderSetup(){if(!selected)return;const p=profiles[selected];qs('#setupHeading').textContent=p.name+' setup';qs('#setupMode').textContent=p.mode;qs('#setupModeLabel').textContent=modeLabel(p.mode);qs('#setupLens').textContent=p.lens;qs('#setupExposure').textContent=p.exposure;qs('#setupIso').textContent=p.iso;qs('#setupFocus').textContent=p.focus;qs('#setupSummary').innerHTML=`<span>${p.lens}</span><span>${p.exposure}</span><span>${p.iso}</span>`;qs('#setupTip').innerHTML='<b>Best improvement:</b> '+p.tip;qs('#frameLabel').textContent=p.name+' • '+p.focus;qs('#frameGuides').innerHTML=p.frame.map((x,i)=>`<div class="guide-row"><i>${i+1}</i><div><b>${x}</b><span>${i===0?'Set your position before worrying about tiny camera changes.':i===1?'Use the frame to guide the viewer directly to the subject.':'Scan the edges once before pressing the shutter.'}</span></div></div>`).join('');qs('#captureChecks').innerHTML=p.check.map(x=>`<label class="capture-check"><input type="checkbox"><span>${x}</span></label>`).join('');}

  qsa('.subject-card').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.subject;try{localStorage.setItem('canonT7LastShootSubject',selected)}catch{}paintSubject();renderSetup();}));
  qs('#shootNext1').addEventListener('click',()=>{renderSetup();goStep(2)});
  qsa('[data-next]').forEach(btn=>btn.addEventListener('click',()=>goStep(Number(btn.dataset.next))));
  qsa('[data-back]').forEach(btn=>btn.addEventListener('click',()=>goStep(Number(btn.dataset.back))));

  qs('#applyConditions').addEventListener('click',()=>{
    const results=document.getElementById('weatherResults');
    if(!results||results.hidden){qs('#conditionTitle').textContent='No live conditions loaded yet';qs('#conditionHint').textContent='Open Conditions, search your city or use your location, then return here.';location.hash='conditions';return;}
    const cloud=document.getElementById('wcCloud')?.textContent||'—';const wind=document.getElementById('wcWind')?.textContent||'—';const rain=document.getElementById('wcRain')?.textContent||'—';
    qs('#conditionTitle').textContent='Live conditions applied';qs('#conditionHint').textContent=`Cloud ${cloud} • Wind ${wind} • Rain ${rain}. Keep the base setup above and adjust ISO if the real shutter speed becomes too slow.`;
  });

  qs('#reviewShot').addEventListener('click',()=>{location.hash='edit';const file=document.getElementById('fileInput');setTimeout(()=>{try{file?.click()}catch{}},220)});
  qs('#restartShoot').addEventListener('click',()=>{selected=null;paintSubject();goStep(1)});

  if(selected&&profiles[selected]){paintSubject();renderSetup();}
})();