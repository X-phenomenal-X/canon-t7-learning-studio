(()=>{
  const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const review=$('.review-flow'),file=$('#fileInput');
  if(!review||!file)return;

  const KEY='canonReshootSessionV1';
  let session=window.T7Store?.get('reshoot',null)||null,current=null;
  if(!session)try{session=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}

  const box=document.createElement('section');
  box.className='reshoot-flow';
  box.innerHTML='<div class="reshoot-head"><div><span class="reshoot-kicker">RESHOOT LOOP</span><h4>Change one thing. See what actually helped.</h4><p>Attempt 2 compares both the photo signals and the Canon settings stored in the JPEG.</p></div><span id="reshootState" class="pill">Waiting for review</span></div><div id="reshootBody"><div class="reshoot-focus"><i>01</i><div><b>Review a photo first</b><span>Your best one-variable experiment will appear here after the photo is analyzed.</span></div></div></div>';
  const results=$('#reviewResults');(results||review).appendChild(box);

  const body=$('#reshootBody'),state=$('#reshootState');
  const cleanGoal=g=>g==='general'?'portrait':g;
  const finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
  const shutterLabel=sec=>{const v=Number(sec);if(!finite(v))return'—';if(v>=1)return`${Math.round(v*10)/10}s`;return`1/${Math.max(1,Math.round(1/v))}`};
  const apertureLabel=v=>finite(v)?`f/${Math.round(Number(v)*10)/10}`:'—';
  const isoLabel=v=>finite(v)?`ISO ${Math.round(Number(v))}`:'—';
  const focalLabel=v=>finite(v)?`${Math.round(Number(v))}mm`:'—';
  const actualText=a=>{const x=a?.actual||{};const parts=[focalLabel(x.focal),apertureLabel(x.aperture),shutterLabel(x.shutter),isoLabel(x.iso)].filter(x=>x!=='—');return parts.join(' • ')||'EXIF unavailable'};

  function snapshot(analysis){
    const photo=window.T7PhotoSession?.current?.()||window.T7Store?.getSession('photo')||{},m=analysis?.metrics||{},exif=photo.exif||{},setup=analysis?.nextSetup||{},audit=analysis?.settingsAudit||null;
    return{
      score:Number(m.overall||0),exposure:Number(m.exposure||0),detail:Number(m.detail||0),contrast:Number(m.contrast||0),clipping:Number(m.clipping||0),detailConfidence:Number(m.detailConfidence||0),
      goal:analysis?.goal||window.T7Store?.get('reviewGoal','general')||'general',scene:analysis?.scene||window.T7Store?.get('reviewScene',null)||null,
      recommended:[setup.mode,setup.lens,setup.settings||setup.exposure,setup.iso].filter(Boolean).join(' • '),thumb:analysis?.thumb||photo.thumb||'',time:Number(analysis?.time||photo.createdAt||Date.now()),diagnosis:analysis?.diagnosis?.title||'',
      actual:{shutter:finite(exif.exposure)?Number(exif.exposure):null,aperture:finite(exif.aperture)?Number(exif.aperture):null,iso:finite(exif.iso)?Number(exif.iso):null,focal:finite(exif.focal)?Number(exif.focal):null,camera:[exif.make,exif.model].filter(Boolean).join(' ')},
      audit:audit?{has:!!audit.has,level:audit.level||'',summary:audit.summary||'',items:Array.isArray(audit.items)?audit.items.slice(0,4):[]}:null
    };
  }

  function recommendation(a){
    const engine=window.T7Engine;if(!engine)return null;
    if(a.scene&&engine.scenes?.[a.scene])return engine.recommendScene(a.scene);
    return engine.recommend(cleanGoal(a.goal));
  }
  function focusFor(a){
    const values={detail:a.detail,exposure:a.exposure,contrast:a.contrast,clipping:a.clipping},key=Object.keys(values).sort((x,y)=>values[x]-values[y])[0],subject=cleanGoal(a.goal),engine=recommendation(a),x=a.actual||{};
    if(a.audit?.has&&a.audit.level==='warn'&&a.audit.summary)return{key:'settings',title:'Fix the camera setting mismatch first',text:a.audit.summary,setting:engine?[engine.mode,engine.lens,engine.exposure,engine.iso].filter(Boolean).join(' • '):'Match the suggested starting setup'};
    if(key==='detail'){
      if(subject==='action')return{key,title:'Make the next shot sharper',text:'Keep the shutter fast, use AI Servo, track before pressing fully, and change only that technique before judging anything else.',setting:engine?`${engine.mode} • ${engine.lens} • ${engine.exposure}`:'Prioritize tracking + fast shutter'};
      const safe=x.focal?Math.max(1/125,1/(x.focal*3)):1/250;
      return{key,title:'Make the next shot sharper',text:`Use one AF point on the important detail and protect shutter speed. ${x.shutter?`Your baseline was ${shutterLabel(x.shutter)}.`:''}`,setting:`Aim around ${shutterLabel(safe)} or faster if light allows`};
    }
    if(key==='exposure')return{key,title:'Fix exposure before editing',text:'Keep the subject and framing similar. Change only the exposure control that solves the problem, then compare again.',setting:engine?[engine.mode,engine.exposure,engine.iso].filter(Boolean).join(' • '):'Adjust about 1/3–2/3 stop'};
    if(key==='contrast')return{key,title:'Change the light direction',text:'Keep camera settings similar and move the subject or light. This tests whether better light creates more separation than editing.',setting:'Change light direction first'};
    return{key,title:'Protect important tones',text:'Keep the setup similar and change exposure or framing only enough to protect important highlights/shadows.',setting:engine?[engine.mode,engine.exposure].filter(Boolean).join(' • '):'Protect the brightest important area'};
  }

  function persist(){if(window.T7Store)window.T7Store.set('reshoot',session);else try{localStorage.setItem(KEY,JSON.stringify(session))}catch{}}
  function clearSession(){session=null;if(window.T7Store)window.T7Store.remove('reshoot');else try{localStorage.removeItem(KEY)}catch{}render(current)}
  function delta(v){const cls=v>2?'delta-up':v<-2?'delta-down':'delta-flat';return`<b class="${cls}">${v>0?'+':''}${v}</b>`}

  function settingChanges(a,b){
    const x=a.actual||{},y=b.actual||{},changes=[];
    if(finite(x.shutter)&&finite(y.shutter)&&Math.abs(Math.log2(x.shutter/y.shutter))>.28)changes.push({key:'shutter',label:'Shutter',from:shutterLabel(x.shutter),to:shutterLabel(y.shutter),stops:Math.log2(x.shutter/y.shutter)});
    if(finite(x.aperture)&&finite(y.aperture)&&Math.abs(2*Math.log2(y.aperture/x.aperture))>.28)changes.push({key:'aperture',label:'Aperture',from:apertureLabel(x.aperture),to:apertureLabel(y.aperture),stops:2*Math.log2(y.aperture/x.aperture)});
    if(finite(x.iso)&&finite(y.iso)&&Math.abs(Math.log2(y.iso/x.iso))>.28)changes.push({key:'iso',label:'ISO',from:isoLabel(x.iso),to:isoLabel(y.iso),stops:Math.log2(y.iso/x.iso)});
    if(finite(x.focal)&&finite(y.focal)&&Math.abs(y.focal-x.focal)>=3)changes.push({key:'focal',label:'Focal length',from:focalLabel(x.focal),to:focalLabel(y.focal),delta:y.focal-x.focal});
    return changes;
  }
  function compareLearning(a,b){
    const dd=b.detail-a.detail,de=b.exposure-a.exposure,dcl=b.clipping-a.clipping,changes=settingChanges(a,b),sh=changes.find(x=>x.key==='shutter'),iso=changes.find(x=>x.key==='iso'),focal=changes.find(x=>x.key==='focal'),notes=[];
    if(sh&&sh.stops>.55&&dd>3){
      if(iso&&iso.stops>.45)notes.push(`You traded ${iso.from} → ${iso.to} for a faster shutter (${sh.from} → ${sh.to}), and focus/detail improved ${dd>0?'+':''}${dd}. That was a useful trade.`);
      else notes.push(`The shutter became faster (${sh.from} → ${sh.to}) and focus/detail improved ${dd>0?'+':''}${dd}. The safer shutter likely contributed.`);
    }else if(sh&&sh.stops>.55&&dd<=2)notes.push(`You used a faster shutter (${sh.from} → ${sh.to}), but focus/detail did not clearly improve. Check AF-point placement and steadiness next.`);
    if(iso&&iso.stops>.7&&!sh&&dd<=2)notes.push(`${iso.from} → ${iso.to} added sensitivity, but it did not buy a clear detail improvement. Raise ISO when it enables needed shutter speed or exposure—not by itself.`);
    if(!changes.length&&dd>3)notes.push(`Camera settings stayed essentially the same while focus/detail improved ${dd>0?'+':''}${dd}. Better focus placement, steadiness, timing, or subject position likely made the difference.`);
    if(focal&&a.goal==='portrait'&&b.actual?.focal>=45&&b.actual?.focal<=55)notes.push(`You moved from ${focal.from} to ${focal.to}, which is closer to the useful portrait end of the 18–55mm kit lens.`);
    if(a.scene==='tvDark'&&finite(b.actual?.shutter)&&b.actual.shutter>=1/125*.92&&b.actual.shutter<=1/60*1.08)notes.push(`Attempt 2 is inside the useful 1/60–1/125 screen-testing range. If banding remains, test nearby shutter speeds rather than changing everything else.`);
    if(de>4)notes.push(`Exposure improved ${de>0?'+':''}${de} while you kept the experiment controlled.`);
    else if(de<-5&&dd>3)notes.push(`Sharpness improved, but exposure moved backward ${de}. Keep the sharper technique and recover exposure with light/ISO rather than giving up the safer shutter.`);
    if(dcl>5)notes.push(`Highlight/shadow protection improved ${dcl>0?'+':''}${dcl}.`);
    if(!notes.length){
      if(Math.abs(dd)<=2&&Math.abs(de)<=2&&Math.abs(dcl)<=2)notes.push('The two attempts are technically very close. Make one more deliberate change rather than changing several settings together.');
      else notes.push('The attempts changed, but there is not enough evidence to credit one camera setting confidently. Keep the next experiment to a single variable.');
    }
    return{changes,notes:notes.slice(0,3)};
  }
  function compareData(a,b){
    const dd=b.detail-a.detail,de=b.exposure-a.exposure,dc=b.contrast-a.contrast,dcl=b.clipping-a.clipping,learning=compareLearning(a,b),focusGain=dd>3,exposureGain=de>3,toneGain=dcl>3,improved=focusGain||exposureGain||toneGain,flat=Math.abs(dd)<=2&&Math.abs(de)<=2&&Math.abs(dcl)<=2;
    const verdict=improved?'Attempt 2 improved at least one major technical signal. Keep the change that helped and move to the next weakest area.':flat?'Attempt 2 is technically very close. Keep the stronger composition and try one more controlled change.':'Attempt 2 did not improve the main technical signals. Return to the stronger setup and change only one variable again.';
    return{dd,de,dc,dcl,improved,flat,verdict,learning};
  }

  function render(cur){
    current=cur||current;if(!current){state.className='pill';state.textContent='Waiting for review';return}
    if(session?.active&&session.attempt1){state.className='reshoot-active';state.textContent='Reshoot active';const f=session.focus||focusFor(session.attempt1);body.innerHTML=`<div class="reshoot-focus"><i>↻</i><div><b>${esc(f.title)}</b><span>${esc(f.text)}</span></div></div><div class="reshoot-baseline"><small>BASELINE SETTINGS</small><b>${esc(actualText(session.attempt1))}</b></div><div class="reshoot-actions"><a class="button primary" href="#shoot" id="resumeReshoot">Open guided shoot</a><button class="button" id="cancelReshoot">Cancel challenge</button></div>`;$('#cancelReshoot').onclick=clearSession;$('#resumeReshoot').onclick=()=>prepareShoot(session.attempt1);return}
    if(session?.attempt1&&session?.attempt2){renderCompare();return}
    const f=focusFor(current);state.className='pill';state.textContent='Ready to improve';body.innerHTML=`<div class="reshoot-focus"><i>01</i><div><b>${esc(f.title)}</b><span>${esc(f.text)}</span></div></div><div class="reshoot-baseline"><small>YOUR ACTUAL SETTINGS</small><b>${esc(actualText(current))}</b></div><div class="reshoot-verdict"><b>Change only this first</b><p>${esc(f.setting)}</p></div><div class="reshoot-actions"><button class="button primary" id="startReshoot">Start reshoot challenge</button><a class="button" href="#learn">Review the skill</a></div>`;$('#startReshoot').onclick=()=>start(current,f);
  }

  function start(base,focus){session={version:2,active:true,attempt1:base,focus,startedAt:Date.now(),scene:base.scene||null};persist();render(base);prepareShoot(base)}
  function prepareShoot(base){const subject=cleanGoal(base.goal);window.T7Store?.set('shootSubject',subject);window.T7Store?.set('shootScene',base.scene||null);try{localStorage.setItem('canonT7LastShootSubject',subject);if(base.scene)localStorage.setItem('canonT7LastScene',base.scene);else localStorage.removeItem('canonT7LastScene')}catch{}location.hash='shoot';setTimeout(()=>{const scene=base.scene&&document.querySelector(`.scene-assist-option[data-scene="${base.scene}"]`),card=document.querySelector(`.subject-card[data-subject="${subject}"]`);if(scene)scene.click();else if(card)card.click();const next=$('#shootNext1');if(next&&!next.disabled)next.click()},300)}
  function renderCompare(){
    const a=session.attempt1,b=session.attempt2,c=session.comparison||compareData(a,b);session.comparison=c;persist();state.className='pill';state.textContent='Comparison ready';
    const changes=c.learning.changes.length?c.learning.changes.map(x=>`<div class="reshoot-change"><small>${esc(x.label)}</small><b>${esc(x.from)} <i>→</i> ${esc(x.to)}</b></div>`).join(''):'<div class="reshoot-change unchanged"><small>CAMERA SETTINGS</small><b>No major EXIF change detected</b></div>';
    body.innerHTML=`<div class="reshoot-compare"><div class="attempt-card">${a.thumb?`<img src="${esc(a.thumb)}" alt="Attempt 1 thumbnail">`:''}<small>ATTEMPT 1</small><strong>${a.detail}</strong><div class="attempt-settings">${esc(actualText(a))}</div></div><div class="compare-arrow">→</div><div class="attempt-card">${b.thumb?`<img src="${esc(b.thumb)}" alt="Attempt 2 thumbnail">`:''}<small>ATTEMPT 2</small><strong>${b.detail}</strong><div class="attempt-settings">${esc(actualText(b))}</div></div></div><div class="delta-grid"><div><small>FOCUS</small>${delta(c.dd)}</div><div><small>EXPOSURE</small>${delta(c.de)}</div><div><small>CONTRAST</small>${delta(c.dc)}</div><div><small>TONE</small>${delta(c.dcl)}</div></div><div class="reshoot-settings-change"><small>WHAT YOU CHANGED</small><div>${changes}</div></div><div class="reshoot-learning"><small>WHAT THIS TEST TAUGHT YOU</small>${c.learning.notes.map((n,i)=>`<div><i>${i+1}</i><p>${esc(n)}</p></div>`).join('')}</div><div class="reshoot-verdict"><b>${c.improved?'Useful improvement':c.flat?'Very close':'Useful miss'}</b><p>${esc(c.verdict)}</p></div><div class="reshoot-actions"><button class="button primary" id="reshootAgain">Try another attempt</button><button class="button" id="finishReshoot">Finish challenge</button></div>`;
    $('#finishReshoot').onclick=clearSession;$('#reshootAgain').onclick=()=>{session={version:2,active:true,attempt1:b,focus:focusFor(b),startedAt:Date.now(),scene:b.scene||null};persist();render(b);prepareShoot(b)};
  }

  function onReview(analysis){if(!analysis?.metrics?.overall)return;const cur=snapshot(analysis);if(current?.time===cur.time)return;current=cur;if(session?.active&&session.attempt1&&cur.time>Number(session.attempt1.time||0)+250){session.active=false;session.attempt2=cur;session.comparison=compareData(session.attempt1,cur);persist();renderCompare()}else render(cur)}

  window.addEventListener('t7-review-updated',e=>setTimeout(()=>onReview(e.detail),60));
  const existing=window.T7ReviewAnalysis||window.T7Store?.getSession('photo')?.analysis;if(existing)setTimeout(()=>onReview(existing),100);
  if(session?.attempt1){current=session.attempt2||session.attempt1;session.active?render(current):session.attempt2?renderCompare():render(current)}
  window.T7Reshoot={current:()=>session,compare:compareData,version:'2.0.0'};
})();