(()=>{
  const $=s=>document.querySelector(s),review=$('.review-flow'),scoreEl=$('#reviewScore'),file=$('#fileInput');
  if(!review||!scoreEl||!file)return;

  let latestConditions=null,latestAnalysis=window.T7ReviewAnalysis||null;
  window.addEventListener('t7-conditions-updated',e=>{latestConditions=e.detail||null;setTimeout(refresh,0)});
  window.addEventListener('t7-review-updated',e=>{latestAnalysis=e.detail||null;setTimeout(refresh,0)});

  const host=$('#reviewResults')||review,coach=document.createElement('section');coach.className='smart-coach';coach.innerHTML=`
    <div class="smart-head"><div><span class="tag">SMART COACH</span><h4>Your next best change</h4><p>Combines the local technical diagnosis, Canon settings, shooting goal, and conditions when available.</p></div><span class="smart-free">FREE • ON-DEVICE</span></div>
    <div class="smart-priority"><i>1</i><div><b id="smartTitle">Review a photo first</b><span id="smartWhy">Upload a photo and the app will choose one useful change to try next.</span></div></div>
    <div class="smart-grid"><div><small>MODE</small><b id="smartMode">—</b></div><div><small>LENS</small><b id="smartLens">—</b></div><div><small>EXPOSURE</small><b id="smartExposure">—</b></div><div><small>ISO</small><b id="smartIso">—</b></div></div>
    <div class="smart-context"><div class="smart-box"><small>Your capture</small><p id="smartCapture">Waiting for EXIF/settings…</p></div><div class="smart-box"><small>Shooting context</small><p id="smartConditions">Check Photo Conditions for weather-aware advice.</p></div></div>
    <div class="smart-actions"><a class="button primary" href="#shoot" id="smartShoot">Try this setup</a><a class="button" href="#learn">Review the skill</a></div>
    <div class="smart-note">This coach measures technical signals and applies Canon T7 rules. It does not judge artistic quality, expression, storytelling, or intentional creative choices.</div>`;host.appendChild(coach);

  const num=id=>Number(String($(id)?.textContent||'').replace(/[^0-9.-]/g,''))||0,text=id=>$(id)?.textContent?.trim()||'';
  const cleanGoal=()=>{const g=$('#reviewGoal')?.value||'general';return g==='general'?'portrait':g};
  function parseFocal(v){const m=String(v).match(/([0-9.]+)\s*mm/i);return m?Number(m[1]):null}
  function parseAperture(v){const m=String(v).match(/f\/?\s*([0-9.]+)/i);return m?Number(m[1]):null}
  function parseIso(v){const m=String(v).match(/([0-9]{2,6})/);return m?Number(m[1]):null}
  function parseShutter(v){v=String(v).trim();let m=v.match(/1\s*\/\s*([0-9.]+)/);if(m)return 1/Number(m[1]);m=v.match(/([0-9.]+)\s*s/i);if(m)return Number(m[1]);return null}
  function shutterLabel(sec){if(sec==null)return null;if(sec>=1)return `${Math.round(sec*10)/10}s`;return `1/${Math.max(1,Math.round(1/sec))}`}
  function readExif(){return{camera:text('#exifCamera'),focalText:text('#exifFocal'),apertureText:text('#exifAperture'),shutterText:text('#exifShutter'),isoText:text('#exifIso'),focal:parseFocal(text('#exifFocal')),aperture:parseAperture(text('#exifAperture')),shutter:parseShutter(text('#exifShutter')),iso:parseIso(text('#exifIso'))}}
  function conditionsText(){if(latestConditions){const c=latestConditions.current||{},a=latestConditions.advice||{};return `${a.title||'Live conditions'} • ${Math.round(c.cloud_cover||0)}% cloud • ${Math.round(c.wind_speed_10m||0)} km/h wind.`}const cloud=text('#wcCloud'),wind=text('#wcWind'),title=text('#photoAdviceTitle');if(cloud&&cloud!=='—')return `${title||'Live conditions'} • ${cloud} cloud • ${wind||'—'} wind.`;return'Check Photo Conditions for weather-aware advice.'}
  function fallbackAnalysis(){return{raw:{mean:num('#reviewExposure')<55?95:128},metrics:{overall:num('#reviewScore'),exposure:num('#reviewExposure'),detail:num('#reviewDetail'),contrast:num('#reviewContrast'),clipping:num('#reviewClip'),detailConfidence:100},diagnosis:{key:'unknown'}}}

  function priority(goal,a,x,rec){
    const m=a.metrics||{},d=a.diagnosis||{},cloud=Number(latestConditions?.current?.cloud_cover||String(text('#wcCloud')).replace(/[^0-9.]/g,''))||0,wind=Number(latestConditions?.current?.wind_speed_10m||String(text('#wcWind')).replace(/[^0-9.]/g,''))||0;
    if(goal==='portrait'&&x.focal&&x.focal<40)return{title:'Use the long end of your kit lens',why:`This portrait was captured around ${Math.round(x.focal)}mm. Move toward 50–55mm and step back for a more flattering perspective and easier background separation.`,skill:'18–55mm Lens'};
    if(goal==='action'&&x.shutter&&x.shutter>1/500)return{title:'Freeze the action first',why:`Your shutter was about ${shutterLabel(x.shutter)}. Start at 1/500 and push toward 1/1000 for faster movement, using AI Servo and continuous drive.`,skill:'Shutter Speed'};
    if((goal==='portrait'||goal==='indoor')&&x.shutter&&x.shutter>1/125&&m.detail<70&&m.detailConfidence>=55)return{title:'Protect shutter speed',why:`Your shutter was about ${shutterLabel(x.shutter)} and the focus/detail signal is weak enough to investigate. Aim for roughly 1/125 or faster for still people, and around 1/250 when movement or camera shake is a concern.`,skill:'Shutter Speed'};
    if(goal==='landscape'&&x.aperture&&x.aperture<5.6)return{title:'Try more depth of field',why:`You used about f/${x.aperture}. For a typical landscape, f/8 is a stronger starting point when you want foreground and background detail together.`,skill:'Aperture'};
    if(goal==='night'&&x.iso&&x.iso>800)return{title:'Stabilize before raising ISO',why:`ISO ${x.iso} is doing a lot of the work. For a static night scene, use a tripod or stable surface, ISO 100, the 2-second timer, and a longer exposure.`,skill:'ISO'};
    if(d.key==='uncertain'||m.detailConfidence<55)return{title:'Run a controlled focus test',why:'The current photo does not provide a confident sharpness signal. Use brighter light, a high-contrast target, one AF point, and a safely fast shutter before deciding that focus is the problem.',skill:'Focus'};
    if(d.key==='detail'||m.detail<58)return{title:'Make the next shot sharper',why:'The strongest detail regions still look soft. Use one selected AF point on the important detail and a faster shutter before adding editing sharpness.',skill:'Focus'};
    if(d.key==='highlights')return{title:'Protect the important highlights',why:'A noticeable part of the frame is near pure white. Reduce exposure a little or change the light if those bright areas matter.',skill:'Exposure'};
    if(d.key==='shadows')return{title:'Protect important shadow detail',why:'A noticeable part of the frame is near black. Add fill light or expose a little brighter if those dark areas matter.',skill:'Exposure'};
    if(d.key==='exposure'||m.exposure<60)return{title:'Fix exposure at capture',why:'The overall brightness is outside a comfortable technical range. Adjust light, aperture, shutter, or ISO based on what the subject requires rather than relying on a large edit later.',skill:'Exposure'};
    if(d.key==='contrast'||m.contrast<60)return{title:'Change the light direction',why:'The image has limited tonal separation. Try side light, window light, or a clearer light direction before reaching for the contrast slider.',skill:'Lighting'};
    if(wind>=25&&(goal==='portrait'||goal==='action'))return{title:'Account for the wind',why:`Wind is around ${Math.round(wind)} km/h. Use a faster shutter when hair, clothing, leaves, or subject movement matters.`,skill:'Shutter Speed'};
    if(cloud>=70&&(goal==='portrait'||goal==='product'))return{title:'Use the soft light you already have',why:`Cloud cover is around ${Math.round(cloud)}%, which can act like a large diffuser. Keep the subject facing the brightest part of the sky and focus on clean framing.`,skill:'Composition'};
    return{title:'Keep the setup and improve composition',why:`The main technical signals are usable. Keep ${rec.mode}, ${rec.lens}, and ${rec.exposure}; now simplify the background, check the frame edges, and make subject placement intentional.`,skill:'Composition'};
  }

  function refresh(){
    const a=latestAnalysis||window.T7ReviewAnalysis||window.T7Store?.getSession('photo')?.analysis||fallbackAnalysis();if(!a?.metrics?.overall)return;
    const goal=cleanGoal(),x=readExif(),rec=a.nextSetup||window.T7Engine?.reviewNext(goal,{mean:a.raw?.mean??128,detailScore:(a.metrics.detailConfidence>=55?a.metrics.detail:75)})||window.T7Engine?.recommend(goal)||{mode:'Av',lens:'35mm',exposure:'f/5.6',iso:'100–400'};
    const p=priority(goal,a,x,rec);$('#smartTitle').textContent=p.title;$('#smartWhy').textContent=p.why;
    $('#smartMode').textContent=rec.mode||'Av';$('#smartLens').textContent=rec.lens||'35mm';$('#smartExposure').textContent=rec.settings||rec.exposure||'f/5.6';$('#smartIso').textContent=rec.iso||'100–400';
    const captured=[x.focalText,x.apertureText,x.shutterText,x.isoText].filter(v=>v&&v!=='—').join(' • ');$('#smartCapture').textContent=captured||'No usable EXIF settings found; the technical image check is still active.';$('#smartConditions').textContent=conditionsText();
    $('#smartShoot').onclick=()=>window.T7Store?.set('shootSubject',goal)||(()=>{try{localStorage.setItem('canonT7LastShootSubject',goal)}catch{}})();
  }

  const observer=new MutationObserver(()=>setTimeout(refresh,40));observer.observe(scoreEl,{childList:true,characterData:true,subtree:true});
  const exif=$('#exifResults');if(exif)observer.observe(exif,{childList:true,characterData:true,subtree:true,attributes:true});
  $('#reviewGoal')?.addEventListener('change',refresh);file.addEventListener('change',()=>setTimeout(refresh,700));setTimeout(refresh,150);
})();