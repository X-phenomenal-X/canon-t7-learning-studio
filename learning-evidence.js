(()=>{
  if(window.T7LearningEvidence)return;
  const $=(s,r=document)=>r.querySelector(s),KEY='canonT7LearningEvidenceV1',MISSION_KEY='canonT7PracticeMissionV1';
  const icon=name=>window.T7Icons?.icon?.(name)||document.createElement('span');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const metricLabels={detail:'Focus / detail',exposure:'Exposure',clipping:'Highlight / shadow protection',contrast:'Contrast separation'};
  const primaryByStep={handling:'detail',exposure:'exposure',aperture:null,motioniso:'detail',focus:'detail',focal:null,composition:null,light:'contrast',portrait:'detail',product:'clipping',harsh:'clipping',flash:'contrast',action:'detail',panning:'detail',indoor:'detail',night:'detail',compensation:'clipping',manual:'exposure',review:null,editing:null};

  function state(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');return s&&typeof s==='object'?{active:s.active||null,records:Array.isArray(s.records)?s.records:[]}:{active:null,records:[]}}catch{return{active:null,records:[]}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{};window.dispatchEvent(new CustomEvent('t7-learning-evidence-updated',{detail:s}))}
  function mission(){try{return JSON.parse(localStorage.getItem(MISSION_KEY)||'null')}catch{return null}}
  function recentPhoto(){return window.T7Store?.get?.('recentPhoto',null)||(()=>{try{return JSON.parse(localStorage.getItem('canonRecentPhoto')||'null')}catch{return null}})()}
  function num(v){v=Number(v);return Number.isFinite(v)?Math.round(v):0}
  function thumbOf(obj){return obj?.preview||obj?.thumb||''}
  function exifOf(obj){return obj?.exif||{}}
  function metricsOf(obj){return{detail:num(obj?.detail??obj?.metrics?.detail),exposure:num(obj?.exposure??obj?.metrics?.exposure),clipping:num(obj?.clipping??obj?.metrics?.clipping),contrast:num(obj?.contrast??obj?.metrics?.contrast)}}
  function recordFromHistory(item){if(!item)return null;return{id:item.id||item.time||Date.now(),sessionId:item.sessionId||'',time:Number(item.time||Date.now()),goal:item.goal||'',scene:item.scene||null,thumb:thumbOf(item),metrics:metricsOf(item),exif:exifOf(item)}}
  function recordFromAnalysis(a){
    if(!a?.metrics?.overall)return null;
    const p=window.T7PhotoSession?.current?.()||window.T7Store?.getSession?.('photo')||{},recent=recentPhoto();
    return{id:p.id||p.createdAt||Date.now(),sessionId:p.id||'',time:Number(p.createdAt||Date.now()),goal:a.goal||window.T7Store?.get?.('reviewGoal','general')||'',scene:a.scene||window.T7Store?.get?.('reviewScene',null)||null,thumb:a.thumb||p.thumb||recent?.preview||recent?.thumb||'',metrics:metricsOf(a),exif:p.exif||recent?.exif||{}};
  }
  function samePhoto(a,b){if(!a||!b)return false;if(a.sessionId&&b.sessionId&&a.sessionId===b.sessionId)return true;return String(a.id||'')===String(b.id||'')&&Math.abs(Number(a.time||0)-Number(b.time||0))<2000}
  function metricFor(step){return Object.prototype.hasOwnProperty.call(primaryByStep,step)?primaryByStep[step]:null}
  function delta(before,after,key){return num(after?.metrics?.[key])-num(before?.metrics?.[key])}
  function deltas(before,after){return{detail:delta(before,after,'detail'),exposure:delta(before,after,'exposure'),clipping:delta(before,after,'clipping'),contrast:delta(before,after,'contrast')}}
  function resultFor(active,after){
    const before=active.baseline,primary=metricFor(active.mission?.step),ds=deltas(before,after);let status='observed',headline='Practice evidence captured',summary='Compare the two frames and use the mission success check to judge the creative change.';
    if(primary){const d=ds[primary],label=metricLabels[primary];if(d>=8){status='improved';headline=`${label} clearly improved`;summary=`The ${label.toLowerCase()} signal moved +${d} points after this practice attempt.`}else if(d>=4){status='improved';headline=`${label} improved`;summary=`The ${label.toLowerCase()} signal moved +${d} points. That is enough to treat this attempt as technical progress.`}else if(d<=-8){status='down';headline=`${label} moved backward`;summary=`The ${label.toLowerCase()} signal changed ${d} points. Repeat the mission and change only one variable.`}else if(d<=-4){status='down';headline=`${label} needs another attempt`;summary=`The ${label.toLowerCase()} signal changed ${d} points. The result is measurable, but not in the intended direction yet.`}else{status='stable';headline=`${label} stayed about the same`;summary=`The ${label.toLowerCase()} signal changed ${d>0?'+':''}${d} points. Make one more controlled frame before deciding the technique worked.`}}
    else{const strong=Object.values(ds).filter(v=>v>=5).length,weak=Object.values(ds).filter(v=>v<=-5).length;if(strong>=2&&weak===0){status='improved';headline='Technical signals improved';summary='Several measurable capture signals improved, but this mission still needs your visual judgment for composition, perspective, or creative intent.'}else if(weak>=2){status='down';headline='Technical trade-offs increased';summary='Several technical signals moved backward. Use the mission success check before deciding whether the creative result was worth the trade-off.'}}
    return{id:`evidence-${Date.now()}`,mission:active.mission,before,after,primary,deltas:ds,status,headline,summary,createdAt:Date.now()};
  }
  function exifLabel(x){if(!x)return'—';const p=[];if(Number(x.focal)>0)p.push(`${Math.round(Number(x.focal))}mm`);if(Number(x.aperture)>0)p.push(`f/${Math.round(Number(x.aperture)*10)/10}`);if(Number(x.exposure)>0){const s=Number(x.exposure);p.push(s>=1?`${Math.round(s*10)/10}s`:`1/${Math.max(1,Math.round(1/s))}`)}if(Number(x.iso)>0)p.push(`ISO ${Math.round(Number(x.iso))}`);return p.join(' · ')||'—'}

  async function startTracking(m){
    if(!m||m.completed)return;
    const s=state();if(s.active?.mission?.id===m.id&&!s.active.finished)return;
    let baseline=null;
    if(m.source==='review'){
      try{const items=await window.T7History?.all?.()||[];baseline=recordFromHistory(items[0])}catch{}
      if(!baseline){const a=window.T7ReviewAnalysis||window.T7Store?.getSession?.('photo')?.analysis;baseline=recordFromAnalysis(a)}
    }
    s.active={mission:m,startedAt:Date.now(),baseline,awaitingBaseline:!baseline,lastSignature:'',finished:false};save(s);render();
  }
  function finishComparison(after){
    const s=state(),a=s.active;if(!a||a.finished||!after)return;
    if(!a.baseline){a.baseline=after;a.awaitingBaseline=false;a.baselineCapturedAt=Date.now();s.active=a;save(s);render();return}
    if(samePhoto(a.baseline,after))return;
    const sig=`${after.sessionId||after.id}|${after.metrics.detail}|${after.metrics.exposure}|${after.metrics.clipping}|${after.metrics.contrast}`;if(sig===a.lastSignature)return;a.lastSignature=sig;
    const evidence=resultFor(a,after);s.records=[evidence,...s.records.filter(r=>r.id!==evidence.id)].slice(0,12);a.finished=true;a.resultId=evidence.id;s.active=a;save(s);render();
  }
  function handleReview(e){const s=state();if(!s.active||s.active.finished)return;const after=recordFromAnalysis(e.detail||window.T7ReviewAnalysis);if(!after)return;setTimeout(()=>finishComparison(after),70)}
  function latestEvidence(){return state().records[0]||null}

  function deltaText(v){return`${v>0?'+':''}${v}`}
  function metricRows(r){return['detail','exposure','clipping','contrast'].map(k=>`<div class="le-metric ${r.primary===k?'primary':''}"><small>${esc(metricLabels[k])}</small><span><b>${r.before.metrics[k]}</b><i>→</i><b>${r.after.metrics[k]}</b><em class="${r.deltas[k]>=4?'up':r.deltas[k]<=-4?'down':'flat'}">${deltaText(r.deltas[k])}</em></span></div>`).join('')}
  function evidenceCard(r,context){
    const el=document.createElement('section');el.className=`learning-evidence ${context==='home'?'learning-evidence-home':''} status-${r.status}`;
    const beforeImg=r.before.thumb?`<img src="${esc(r.before.thumb)}" alt="Before practice photo">`:'<div class="le-photo-empty">Before</div>',afterImg=r.after.thumb?`<img src="${esc(r.after.thumb)}" alt="After practice photo">`:'<div class="le-photo-empty">After</div>';
    el.innerHTML=`<div class="le-head"><div class="le-head-icon"></div><div><small>LEARNING EVIDENCE</small><h3>${esc(r.headline)}</h3><p>${esc(r.summary)}</p></div><span class="le-skill">${esc(r.mission?.title||'Practice mission')}</span></div><div class="le-compare"><div class="le-frame"><div class="le-photo">${beforeImg}<span>BEFORE</span></div><small>${esc(exifLabel(r.before.exif))}</small></div><div class="le-arrow">→</div><div class="le-frame"><div class="le-photo">${afterImg}<span>AFTER</span></div><small>${esc(exifLabel(r.after.exif))}</small></div></div><div class="le-metrics">${metricRows(r)}</div><div class="le-note">Technical signals are evidence, not an artistic score. Composition, expression, timing and creative intent still need your judgment.</div><div class="le-actions"><button class="le-open">Open checkpoint</button><button class="le-repeat">Repeat mission</button><button class="le-complete">Complete mission</button></div>`;
    el.querySelector('.le-head-icon').appendChild(icon(r.status==='improved'?'checkCircle':r.status==='down'?'refresh':'compare'));
    el.querySelector('.le-open').onclick=()=>{location.hash='learn';setTimeout(()=>window.T7PhotographyCourse?.openStep?.(r.mission.chapter,r.mission.step),100)};
    el.querySelector('.le-repeat').onclick=()=>window.T7PracticeMissions?.start?.(r.mission);
    el.querySelector('.le-complete').onclick=()=>window.T7PracticeMissions?.complete?.(r.mission);
    if(context==='home'){el.querySelector('.le-compare')?.remove();el.querySelector('.le-note')?.remove();el.querySelector('.le-actions .le-repeat')?.remove();el.querySelector('.le-actions .le-complete')?.remove()}
    return el;
  }
  function pendingCard(active){
    const el=document.createElement('section');el.className='learning-evidence le-pending';
    el.innerHTML=`<div class="le-head"><div class="le-head-icon"></div><div><small>LEARNING EVIDENCE</small><h3>${active.baseline?'Mission started — review your next frame':'Capture a baseline first'}</h3><p>${active.baseline?'Your before frame is saved. Complete the mission, then review the new photo and T7 Studio will compare the technical signals.':'This course mission did not come from an existing Review. Review one frame to create a baseline, then make one deliberate second attempt.'}</p></div><span class="le-skill">${esc(active.mission?.title||'Practice mission')}</span></div>`;
    el.querySelector('.le-head-icon').appendChild(icon('compare'));return el;
  }
  function renderReview(){const host=$('.review-v2-overview')||$('.review-flow');if(!host)return;host.querySelector('#learningEvidenceReview')?.remove();const s=state(),r=latestEvidence();let card=null;if(r)card=evidenceCard(r,'review');else if(s.active)card=pendingCard(s.active);if(!card)return;const wrap=document.createElement('div');wrap.id='learningEvidenceReview';wrap.appendChild(card);const adaptive=$('#adaptiveReviewCourse');(adaptive||$('#rv2Priority')||host.lastElementChild)?.after(wrap)}
  function renderGuide(){const guide=$('#photographyGuide');if(!guide)return;let wrap=$('#learningEvidenceGuide');if(!wrap){wrap=document.createElement('div');wrap.id='learningEvidenceGuide';wrap.className='le-guide-wrap';const course=$('#photographyCourse');(course||guide.querySelector('.pg-section'))?.before(wrap)}wrap.innerHTML='';const s=state(),r=latestEvidence();if(r)wrap.appendChild(evidenceCard(r,'guide'));else if(s.active)wrap.appendChild(pendingCard(s.active));wrap.hidden=!r&&!s.active}
  function renderHome(){const home=$('#home');if(!home)return;home.querySelector('#learningEvidenceHome')?.remove();const r=latestEvidence();if(!r)return;const wrap=document.createElement('div');wrap.id='learningEvidenceHome';wrap.appendChild(evidenceCard(r,'home'));const missionHost=$('#homePracticeMission',home),coach=$('#homeCoach',home);(missionHost||coach)?.after(wrap)}
  function render(){renderReview();renderGuide();renderHome()}

  document.addEventListener('click',e=>{const b=e.target.closest?.('.pm-start');if(!b)return;const m=mission();if(m)startTracking(m)},true);
  window.addEventListener('t7-review-updated',handleReview);
  window.addEventListener('t7-practice-mission-updated',e=>{if(e.detail?.completed){const s=state();if(s.active?.mission?.id===e.detail.id){s.active.finished=true;save(s)}}setTimeout(render,70)});
  window.addEventListener('t7-route-changed',e=>{if(['home','review','learn'].includes(e.detail?.route))setTimeout(render,80)});
  window.addEventListener('storage',e=>{if([KEY,MISSION_KEY].includes(e.key))render()});
  setTimeout(render,850);
  window.T7LearningEvidence={state,latest:latestEvidence,start:startTracking,render,version:'1.0.0'};
})();