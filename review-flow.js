(()=>{
  const $=s=>document.querySelector(s),edit=$('#edit'),file=$('#fileInput'),reviewEngine=window.T7ReviewEngine;
  if(!edit||!file||!reviewEngine)return;
  const editorLayout=edit.querySelector('.editor-layout');if(!editorLayout)return;

  const review=document.createElement('div');review.className='review-flow';review.innerHTML=`
    <div class="review-head"><div><span class="tag">REVIEW</span><h3>Understand the photo before you edit it</h3><p>This is a technical capture check—not an artistic rating. The app looks for exposure, focus/detail signals, tonal clipping, contrast, and the Canon settings stored in the photo.</p></div><span class="review-badge">PRIVATE • ON-DEVICE</span></div>
    <div class="review-goal"><label for="reviewGoal">What were you trying to shoot?</label><select id="reviewGoal"><option value="general">General</option><option value="portrait">Portrait</option><option value="product">Product / tech</option><option value="landscape">Landscape / building</option><option value="action">Action / movement</option><option value="indoor">Indoor</option><option value="night">Night / low light</option></select></div>
    <div class="review-scene-context" id="reviewSceneContext" hidden><div><small>SCENE ASSIST ACTIVE</small><b id="reviewSceneName">—</b></div><button type="button" id="reviewSceneClear">Use normal review</button></div>
    <div id="reviewEmpty" class="review-empty"><div class="review-empty-mark">01</div><div><b>Upload a photo below</b><p>After the image opens, your technical diagnosis will appear here automatically.</p></div></div>
    <div id="reviewResults" class="review-results" hidden>
      <div class="review-scoreline"><div class="review-score-ring" id="reviewRing" style="--score:0"><b id="reviewScore">—</b><small>INTERNAL</small></div><div class="review-summary"><h4 id="reviewTitle">Technical review</h4><p id="reviewText">—</p><small id="reviewConfidence"></small></div></div>
      <div class="review-metrics">
        <div class="review-metric"><small>Exposure</small><b id="reviewExposure">—</b><span id="reviewExposureNote"></span></div>
        <div class="review-metric"><small>Focus / detail</small><b id="reviewDetail">—</b><span id="reviewDetailNote"></span></div>
        <div class="review-metric"><small>Contrast</small><b id="reviewContrast">—</b><span id="reviewContrastNote"></span></div>
        <div class="review-metric"><small>Tone range</small><b id="reviewClip">—</b><span id="reviewClipNote"></span></div>
      </div>
      <div class="review-exif-audit" id="reviewExifAudit">
        <div class="review-exif-head"><div><small>ACTUAL CAMERA SETTINGS</small><h4>What your T7 actually used</h4></div><span id="reviewExifModel">EXIF</span></div>
        <div class="review-exif-values" id="reviewExifValues"></div>
        <div class="review-exif-verdict" id="reviewExifVerdict"></div>
      </div>
      <div class="review-insights"><div class="review-box"><h4>What looks technically good</h4><ul id="reviewGood"></ul></div><div class="review-box"><h4>Improve next time</h4><ul id="reviewImprove"></ul></div></div>
      <div class="review-next"><h4 style="margin:0">Try this on your next T7 shot</h4><div class="review-next-grid"><div><small>Mode</small><b id="reviewMode">Av</b></div><div><small>Lens</small><b id="reviewLens">35mm</b></div><div><small>Exposure</small><b id="reviewSettings">f/5.6</b></div><div><small>ISO</small><b id="reviewIso">100–400</b></div></div><div class="review-actions"><button id="applyReviewEdit" class="button primary">Apply suggested edit</button><a class="button" href="#shoot">Try guided shoot</a><a class="button" href="#learn">Learn this skill</a></div></div>
    </div>`;
  editorLayout.before(review);

  let lastAnalysis=null,lastSession=null,goal='general',scene=null;
  const goalEl=$('#reviewGoal'),sceneBox=$('#reviewSceneContext');
  try{goal=window.T7Store?.get('reviewGoal',null)||localStorage.getItem('canonReviewGoal')||'general';scene=window.T7Store?.get('reviewScene',null)||null}catch{}
  goalEl.value=goal;
  function syncScene(){const d=scene&&window.T7Engine?.scenes?.[scene];sceneBox.hidden=!d;if(d)$('#reviewSceneName').textContent=d.name}
  goalEl.onchange=()=>{goal=goalEl.value;scene=null;window.T7Store?.set('reviewGoal',goal);window.T7Store?.set('reviewScene',null);syncScene();if(lastAnalysis)render(lastAnalysis,lastSession)};
  $('#reviewSceneClear').onclick=()=>{scene=null;window.T7Store?.set('reviewScene',null);syncScene();if(lastAnalysis)render(lastAnalysis,lastSession)};
  syncScene();

  function nextSetup(a){
    const m=a.raw,s=a.metrics,detailProblem=s.detail<58&&s.detailConfidence>=55,engine=window.T7Engine;
    if(scene&&engine?.scenes?.[scene]){
      const rec=engine.recommendScene(scene)||null;if(rec){
        let tip=rec.tip;
        if(m.mean>155&&engine.sceneFix(scene,'tooBright'))tip=engine.sceneFix(scene,'tooBright');
        else if(m.mean<92&&engine.sceneFix(scene,'tooDark'))tip=engine.sceneFix(scene,'tooDark');
        else if(detailProblem&&engine.sceneFix(scene,'blurry'))tip=engine.sceneFix(scene,'blurry');
        return{mode:rec.mode,lens:rec.lens,settings:rec.exposure,iso:rec.iso,afMode:rec.afMode,drive:rec.drive,tip,scene:rec.name};
      }
    }
    if(goal==='general')return{mode:'Av',lens:'35mm',settings:detailProblem?'f/5.6 • keep 1/250+ if possible':'f/5.6',iso:m.mean<100?'400–800':'100–400'};
    const rec=engine?.reviewNext(goal,{mean:m.mean,detailScore:detailProblem?s.detail:75})||engine?.recommend(goal)||null;
    if(!rec)return{mode:'Av',lens:'35mm',settings:'f/5.6',iso:'100–400'};
    return{mode:rec.mode,lens:rec.lens,settings:rec.exposure,iso:rec.iso,afMode:rec.afMode,drive:rec.drive,tip:rec.tip};
  }

  function editSuggestion(a){
    const m=a.raw,s=a.metrics,confidentSoft=s.detail<58&&s.detailConfidence>=55;
    return{exposure:m.mean<108?12:m.mean>150?-10:0,highlights:m.brightPct>2?-18:-5,shadows:m.darkPct>3?16:6,contrast:s.contrast<60?12:4,warmth:0,saturation:m.sat<.18?8:2,sharpness:confidentSoft?14:6};
  }

  const finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
  function shutterText(sec){const v=Number(sec);if(!finite(v))return'—';if(v>=1)return`${Math.round(v*10)/10}s`;const den=Math.max(1,Math.round(1/v));return`1/${den}s`}
  function apertureText(v){return finite(v)?`f/${Math.round(Number(v)*10)/10}`:'—'}
  function focalText(v){return finite(v)?`${Math.round(Number(v))}mm`:'—'}
  function isoText(v){return finite(v)?`ISO ${Math.round(Number(v))}`:'—'}
  function exifTarget(){
    const key=scene||goal;
    const rules={
      portrait:{minShutter:1/125,focal:[45,55],isoMax:1600},product:{minShutter:1/100,focal:[35,55],isoMax:1600},landscape:{isoMax:800},action:{minShutter:1/500,focal:[30,55]},indoor:{minShutter:1/100,isoMax:3200},night:{tripod:true,isoMax:800},
      tvDark:{minShutter:1/60,maxShutter:1/125,focal:[20,40],iso:[200,1600]},brightWindow:{minShutter:1/125,focal:[45,55],isoMax:1600},blackCarSun:{minShutter:1/125,focal:[30,55],isoMax:400},indoorProduct:{minShutter:1/100,focal:[40,55],isoMax:1600},movingCar:{minShutter:1/800,focal:[30,55]},nightHandheld:{minShutter:1/60,focal:[18,40],iso:[800,6400]}
    };
    return rules[key]||{};
  }
  function settingAudit(session,a){
    const exif=session?.exif||{},shutter=Number(exif.exposure),aperture=Number(exif.aperture),iso=Number(exif.iso),focal=Number(exif.focal),has=finite(shutter)||finite(aperture)||finite(iso)||finite(focal),target=exifTarget(),notes=[];
    if(!has)return{has:false,exif,items:[],summary:'No usable camera settings were found in this file. Try reviewing the original Canon JPEG; some messaging apps and editors remove EXIF data.',level:'neutral'};
    if(finite(shutter)&&target.minShutter&&shutter>target.minShutter*1.08){const want=shutterText(target.minShutter);notes.push({type:'warn',text:`You shot at ${shutterText(shutter)}. For this situation, start around ${want} or faster to reduce blur.`})}
    if(finite(shutter)&&target.maxShutter&&shutter<target.maxShutter*.92)notes.push({type:'note',text:`Your ${shutterText(shutter)} shutter is faster than the usual starting range for this screen scene. If you see dark bands, test around 1/60–1/125s.`});
    if(finite(focal)&&target.focal&&(focal<target.focal[0]-2||focal>target.focal[1]+2))notes.push({type:'note',text:`You used ${focalText(focal)}. A useful starting range here is about ${target.focal[0]}–${target.focal[1]}mm on the kit lens.`});
    if(finite(iso)&&target.isoMax&&iso>target.isoMax)notes.push({type:'note',text:`${isoText(iso)} is higher than needed for the usual starting setup. If shutter speed is already safe, lower ISO for a cleaner file.`});
    if(finite(iso)&&target.iso&&(iso<target.iso[0]||iso>target.iso[1]))notes.push({type:'note',text:`You used ${isoText(iso)}. A practical range for this scene is roughly ISO ${target.iso[0]}–${target.iso[1]}, adjusted for the actual light.`});
    if(target.tripod&&finite(iso)&&iso>800)notes.push({type:'note',text:`For a stable tripod night shot, ${isoText(iso)} is relatively high. Try ISO 100–400 and allow a longer exposure.`});
    const detailWeak=a?.metrics?.detail<58&&a?.metrics?.detailConfidence>=55;
    if(detailWeak&&finite(shutter)&&!notes.some(n=>/shot at/.test(n.text))&&!target.tripod)notes.unshift({type:'warn',text:`Detail looks weak. Your shutter was ${shutterText(shutter)}; if the subject or camera moved, try the next faster shutter step and raise ISO only as needed.`});
    if(!notes.length)notes.push({type:'good',text:'Nothing in the stored shutter, ISO or focal-length values stands out as an obvious technical mismatch. Keep the settings and work on light, focus placement or composition next.'});
    return{has:true,exif,items:[['SHUTTER',shutterText(shutter)],['APERTURE',apertureText(aperture)],['ISO',isoText(iso).replace('ISO ', '')],['FOCAL LENGTH',focalText(focal)]],notes,summary:notes[0].text,level:notes[0].type||'neutral'};
  }
  function renderExifAudit(a,session){
    const audit=settingAudit(session,a),model=[audit.exif?.make,audit.exif?.model].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();$('#reviewExifModel').textContent=model||'EXIF';
    if(!audit.has){$('#reviewExifValues').innerHTML='<div class="review-exif-missing">Settings unavailable</div>';$('#reviewExifVerdict').className='review-exif-verdict neutral';$('#reviewExifVerdict').innerHTML=`<b>Try the original Canon JPEG</b><span>${audit.summary}</span>`;return audit}
    $('#reviewExifValues').innerHTML=audit.items.map(([label,value])=>`<div><small>${label}</small><b>${value}</b></div>`).join('');
    $('#reviewExifVerdict').className=`review-exif-verdict ${audit.level}`;$('#reviewExifVerdict').innerHTML=`<b>${audit.level==='good'?'Settings look sensible':audit.level==='warn'?'Setting worth changing':'Setting check'}</b><span>${audit.summary}</span>`;
    return audit;
  }

  function publish(a,n,session,audit){
    const normalizedSetup={...n,exposure:n.exposure||n.settings};
    const detail={...a,goal,scene:scene||null,nextSetup:normalizedSetup,settingsAudit:audit||null,thumb:session?.thumb||'',time:session?.createdAt||Date.now()};
    window.T7ReviewAnalysis=detail;
    window.T7PhotoSession?.patch({analysis:detail});
    if(!window.T7PhotoSession){const prior=window.T7Store?.getSession('photo')||{};window.T7Store?.setSession('photo',{...prior,analysis:detail})}
    window.dispatchEvent(new CustomEvent('t7-review-updated',{detail}));
  }

  function render(a,session=lastSession){
    lastAnalysis=a;lastSession=session||lastSession;const s=a.metrics,d=a.diagnosis,l=a.labels,r=a.messages,n=nextSetup(a),edit=editSuggestion(a);a.edit=edit;
    $('#reviewResults').hidden=false;$('#reviewEmpty').hidden=true;
    $('#reviewRing').style.setProperty('--score',s.overall);$('#reviewScore').textContent=s.overall;
    $('#reviewTitle').textContent=d.title;$('#reviewText').textContent=d.summary;$('#reviewConfidence').textContent=`${d.confidenceLabel} • technical signals only`;
    $('#reviewExposure').textContent=s.exposure+'/100';$('#reviewExposureNote').textContent=l.exposure;
    $('#reviewDetail').textContent=s.detail+'/100';$('#reviewDetailNote').textContent=l.detail+(s.detailConfidence<70?` • ${s.detailConfidence}% confidence`:'');
    $('#reviewContrast').textContent=s.contrast+'/100';$('#reviewContrastNote').textContent=l.contrast;
    $('#reviewClip').textContent=s.clipping+'/100';$('#reviewClipNote').textContent=l.clipping;
    const audit=renderExifAudit(a,session);
    $('#reviewGood').innerHTML=r.good.map(x=>`<li>${x}</li>`).join('');
    const improve=[...r.improve];if(audit?.has&&audit.level==='warn')improve.unshift('Camera setting: '+audit.summary);if(n.tip&&(goal!=='general'||scene))improve.push((scene?'Scene next step: ':'T7 next step: ')+n.tip);$('#reviewImprove').innerHTML=improve.map(x=>`<li>${x}</li>`).join('');
    $('#reviewMode').textContent=n.mode;$('#reviewLens').textContent=n.lens;$('#reviewSettings').textContent=n.settings;$('#reviewIso').textContent=n.iso;
    saveRecent(a,n,session);publish(a,n,session,audit);
  }

  function saveRecent(a,n,session){
    const thumb=session?.thumb||'';if(!thumb)return;
    const sceneName=scene&&window.T7Engine?.scenes?.[scene]?.name;
    const payload={thumb,score:a.metrics.overall,status:a.diagnosis.short,diagnosis:a.diagnosis.title,confidence:a.diagnosis.confidenceLabel,goal,scene:scene||null,sceneName:sceneName||'',settings:`${n.mode} • ${n.lens} • ${n.settings}`,time:session?.createdAt||Date.now()};
    window.T7Store?.set('recentPhoto',payload);if(!window.T7Store)try{localStorage.setItem('canonRecentPhoto',JSON.stringify(payload))}catch{}
    renderRecent(payload);
  }
  function renderRecent(p){
    const box=document.querySelector('.recent-photo-empty');if(!box||!p)return;box.className='recent-photo-card-live';const date=new Date(p.time).toLocaleDateString([], {month:'short',day:'numeric'});
    box.innerHTML=`<img src="${p.thumb}" alt="Recent uploaded photo"><div class="recent-photo-meta"><b>${p.sceneName||p.goal[0].toUpperCase()+p.goal.slice(1)} review</b><small>${p.settings}</small><small>${date}</small></div><div class="recent-score">${p.status||p.score||'Reviewed'}</div>`;
  }
  try{const recent=window.T7Store?.get('recentPhoto',null)||JSON.parse(localStorage.getItem('canonRecentPhoto')||'null');if(recent)renderRecent(recent)}catch{}

  function analyzeSession(session){
    if(!session?.analysisFrame)return;lastSession=session;
    const frame=session.analysisFrame(520),analysis=reviewEngine.analyze(frame.imageData,frame.width,frame.height);render(analysis,session);
  }
  window.addEventListener('t7-photo-ready',e=>analyzeSession(e.detail));
  const existing=window.T7PhotoSession?.current?.();if(existing)setTimeout(()=>analyzeSession(existing),0);

  $('#applyReviewEdit').onclick=()=>{if(!lastAnalysis?.edit)return;Object.entries(lastAnalysis.edit).forEach(([id,v])=>{const el=$('#'+id);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}});location.hash='edit';setTimeout(()=>$('#canvas')?.scrollIntoView({behavior:'smooth',block:'center'}),150)};
})();