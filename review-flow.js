(()=>{
  const $=s=>document.querySelector(s),edit=$('#edit'),file=$('#fileInput'),reviewEngine=window.T7ReviewEngine;
  if(!edit||!file||!reviewEngine)return;
  const editorLayout=edit.querySelector('.editor-layout');if(!editorLayout)return;

  const review=document.createElement('div');review.className='review-flow';review.innerHTML=`
    <div class="review-head"><div><span class="tag">REVIEW</span><h3>Understand the photo before you edit it</h3><p>This is a technical capture check—not an artistic rating. The app looks for exposure, focus/detail signals, tonal clipping, and contrast locally on your device.</p></div><span class="review-badge">PRIVATE • ON-DEVICE</span></div>
    <div class="review-goal"><label for="reviewGoal">What were you trying to shoot?</label><select id="reviewGoal"><option value="general">General</option><option value="portrait">Portrait</option><option value="product">Product / tech</option><option value="landscape">Landscape / building</option><option value="action">Action / movement</option><option value="indoor">Indoor</option><option value="night">Night / low light</option></select></div>
    <div id="reviewEmpty" class="review-empty"><div class="review-empty-mark">01</div><div><b>Upload a photo below</b><p>After the image opens, your technical diagnosis will appear here automatically.</p></div></div>
    <div id="reviewResults" class="review-results" hidden>
      <div class="review-scoreline"><div class="review-score-ring" id="reviewRing" style="--score:0"><b id="reviewScore">—</b><small>INTERNAL</small></div><div class="review-summary"><h4 id="reviewTitle">Technical review</h4><p id="reviewText">—</p><small id="reviewConfidence"></small></div></div>
      <div class="review-metrics">
        <div class="review-metric"><small>Exposure</small><b id="reviewExposure">—</b><span id="reviewExposureNote"></span></div>
        <div class="review-metric"><small>Focus / detail</small><b id="reviewDetail">—</b><span id="reviewDetailNote"></span></div>
        <div class="review-metric"><small>Contrast</small><b id="reviewContrast">—</b><span id="reviewContrastNote"></span></div>
        <div class="review-metric"><small>Tone range</small><b id="reviewClip">—</b><span id="reviewClipNote"></span></div>
      </div>
      <div class="review-insights"><div class="review-box"><h4>What looks technically good</h4><ul id="reviewGood"></ul></div><div class="review-box"><h4>Improve next time</h4><ul id="reviewImprove"></ul></div></div>
      <div class="review-next"><h4 style="margin:0">Try this on your next T7 shot</h4><div class="review-next-grid"><div><small>Mode</small><b id="reviewMode">Av</b></div><div><small>Lens</small><b id="reviewLens">35mm</b></div><div><small>Exposure</small><b id="reviewSettings">f/5.6</b></div><div><small>ISO</small><b id="reviewIso">100–400</b></div></div><div class="review-actions"><button id="applyReviewEdit" class="button primary">Apply suggested edit</button><a class="button" href="#shoot">Try guided shoot</a><a class="button" href="#learn">Learn this skill</a></div></div>
    </div>`;
  editorLayout.before(review);

  let lastAnalysis=null,lastThumb='',currentFile=null,goal='general';
  const goalEl=$('#reviewGoal');
  try{goal=window.T7Store?.get('reviewGoal',null)||localStorage.getItem('canonReviewGoal')||'general'}catch{}
  goalEl.value=goal;
  goalEl.onchange=()=>{goal=goalEl.value;window.T7Store?.set('reviewGoal',goal);if(lastAnalysis)render(lastAnalysis)};

  function nextSetup(a){
    const m=a.raw,s=a.metrics,detailProblem=s.detail<58&&s.detailConfidence>=55;
    if(goal==='general')return{mode:'Av',lens:'35mm',settings:detailProblem?'f/5.6 • keep 1/250+ if possible':'f/5.6',iso:m.mean<100?'400–800':'100–400'};
    const rec=window.T7Engine?.reviewNext(goal,{mean:m.mean,detailScore:detailProblem?s.detail:75})||window.T7Engine?.recommend(goal)||null;
    if(!rec)return{mode:'Av',lens:'35mm',settings:'f/5.6',iso:'100–400'};
    return{mode:rec.mode,lens:rec.lens,settings:rec.exposure,iso:rec.iso,afMode:rec.afMode,drive:rec.drive,tip:rec.tip};
  }

  function editSuggestion(a){
    const m=a.raw,s=a.metrics,confidentSoft=s.detail<58&&s.detailConfidence>=55;
    return{exposure:m.mean<108?12:m.mean>150?-10:0,highlights:m.brightPct>2?-18:-5,shadows:m.darkPct>3?16:6,contrast:s.contrast<60?12:4,warmth:0,saturation:m.sat<.18?8:2,sharpness:confidentSoft?14:6};
  }

  function publish(a,n){
    const detail={...a,goal,nextSetup:n,thumb:lastThumb,time:Date.now()};
    window.T7ReviewAnalysis=detail;
    const prior=window.T7Store?.getSession('photo')||{};
    window.T7Store?.setSession('photo',{...prior,file:currentFile,thumb:lastThumb,analysis:detail});
    window.dispatchEvent(new CustomEvent('t7-review-updated',{detail}));
  }

  function render(a){
    lastAnalysis=a;const s=a.metrics,d=a.diagnosis,l=a.labels,r=a.messages,n=nextSetup(a),edit=editSuggestion(a);
    a.edit=edit;
    $('#reviewResults').hidden=false;$('#reviewEmpty').hidden=true;
    $('#reviewRing').style.setProperty('--score',s.overall);$('#reviewScore').textContent=s.overall;
    $('#reviewTitle').textContent=d.title;$('#reviewText').textContent=d.summary;$('#reviewConfidence').textContent=`${d.confidenceLabel} • technical signals only`;
    $('#reviewExposure').textContent=s.exposure+'/100';$('#reviewExposureNote').textContent=l.exposure;
    $('#reviewDetail').textContent=s.detail+'/100';$('#reviewDetailNote').textContent=l.detail+(s.detailConfidence<70?` • ${s.detailConfidence}% confidence`:'');
    $('#reviewContrast').textContent=s.contrast+'/100';$('#reviewContrastNote').textContent=l.contrast;
    $('#reviewClip').textContent=s.clipping+'/100';$('#reviewClipNote').textContent=l.clipping;
    $('#reviewGood').innerHTML=r.good.map(x=>`<li>${x}</li>`).join('');
    const improve=[...r.improve];if(n.tip&&goal!=='general')improve.push('T7 next step: '+n.tip);$('#reviewImprove').innerHTML=improve.map(x=>`<li>${x}</li>`).join('');
    $('#reviewMode').textContent=n.mode;$('#reviewLens').textContent=n.lens;$('#reviewSettings').textContent=n.settings;$('#reviewIso').textContent=n.iso;
    saveRecent(a,n);publish(a,n);
  }

  function saveRecent(a,n){
    if(!lastThumb)return;
    const payload={thumb:lastThumb,score:a.metrics.overall,status:a.diagnosis.short,diagnosis:a.diagnosis.title,confidence:a.diagnosis.confidenceLabel,goal,settings:`${n.mode} • ${n.lens} • ${n.settings}`,time:Date.now()};
    window.T7Store?.set('recentPhoto',payload);if(!window.T7Store)try{localStorage.setItem('canonRecentPhoto',JSON.stringify(payload))}catch{}
    renderRecent(payload);
  }
  function renderRecent(p){
    const box=document.querySelector('.recent-photo-empty');if(!box||!p)return;box.className='recent-photo-card-live';const date=new Date(p.time).toLocaleDateString([], {month:'short',day:'numeric'});
    box.innerHTML=`<img src="${p.thumb}" alt="Recent uploaded photo"><div class="recent-photo-meta"><b>${p.goal[0].toUpperCase()+p.goal.slice(1)} review</b><small>${p.settings}</small><small>${date}</small></div><div class="recent-score">${p.status||p.score||'Reviewed'}</div>`;
  }
  try{const recent=window.T7Store?.get('recentPhoto',null)||JSON.parse(localStorage.getItem('canonRecentPhoto')||'null');if(recent)renderRecent(recent)}catch{}

  function makeThumb(img){const c=document.createElement('canvas'),max=320,scale=Math.min(1,max/img.width);c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);try{return c.toDataURL('image/jpeg',.62)}catch{return''}}

  file.addEventListener('change',e=>{
    const f=e.target.files?.[0];if(!f)return;currentFile=f;
    const reader=new FileReader();reader.onload=ev=>{const img=new Image();img.onload=()=>{
      lastThumb=makeThumb(img);
      const max=520,scale=Math.min(1,max/img.width,max/img.height),w=Math.max(40,Math.round(img.width*scale)),h=Math.max(40,Math.round(img.height*scale)),c=document.createElement('canvas');
      c.width=w;c.height=h;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,w,h);
      const analysis=reviewEngine.analyze(cx.getImageData(0,0,w,h),w,h);render(analysis);
    };img.src=ev.target.result};reader.readAsDataURL(f);
  });

  $('#applyReviewEdit').onclick=()=>{if(!lastAnalysis?.edit)return;Object.entries(lastAnalysis.edit).forEach(([id,v])=>{const el=$('#'+id);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}});location.hash='edit';setTimeout(()=>$('#canvas')?.scrollIntoView({behavior:'smooth',block:'center'}),150)};
})();