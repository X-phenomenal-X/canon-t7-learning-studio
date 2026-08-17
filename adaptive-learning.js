(()=>{
  if(window.T7AdaptiveLearning)return;
  const $=s=>document.querySelector(s),KEY='canonT7AdaptiveCourseRecommendationV1';
  const icon=name=>window.T7Icons?.icon?.(name)||document.createElement('span');
  const safe=v=>String(v||'').trim();
  const mappings={
    focal:{chapter:'intent',step:'focal',title:'18mm vs 35mm vs 55mm',icon:'lens'},
    portrait:{chapter:'scenes',step:'portrait',title:'Portraits that feel natural',icon:'portrait'},
    aperture:{chapter:'control',step:'aperture',title:'Aperture & depth of field',icon:'aperture'},
    shutter:{chapter:'control',step:'motioniso',title:'Shutter speed & ISO',icon:'shutter'},
    action:{chapter:'motion',step:'action',title:'Freeze action',icon:'action'},
    indoor:{chapter:'motion',step:'indoor',title:'Indoor available light',icon:'indoor'},
    night:{chapter:'motion',step:'night',title:'Night handheld vs tripod',icon:'night'},
    focus:{chapter:'intent',step:'focus',title:'Autofocus you can trust',icon:'focus'},
    exposure:{chapter:'control',step:'exposure',title:'The exposure triangle',icon:'exposure'},
    highlights:{chapter:'workflow',step:'compensation',title:'Exposure compensation & highlights',icon:'sun'},
    light:{chapter:'intent',step:'light',title:'Read the light',icon:'sun'},
    composition:{chapter:'intent',step:'composition',title:'Composition before settings',icon:'guide'},
    product:{chapter:'scenes',step:'product',title:'Cars & products',icon:'product'},
    handling:{chapter:'control',step:'handling',title:'Camera handling & stability',icon:'camera'}
  };

  function currentGoal(){return $('#reviewGoal')?.value||window.T7Store?.get?.('shootSubject')||'general'}
  function analysis(){return window.T7ReviewAnalysis||window.T7Store?.getSession?.('photo')?.analysis||null}
  function choose(){
    const a=analysis(),score=Number(String($('#reviewScore')?.textContent||'').replace(/[^0-9.]/g,''))||0;
    if(!a||!score)return null;
    const goal=currentGoal(),title=safe($('#smartTitle')?.textContent).toLowerCase(),why=safe($('#smartWhy')?.textContent),d=String(a?.diagnosis?.key||'').toLowerCase(),audit=String(a?.settingsAudit?.summary||'').toLowerCase(),blob=[title,why.toLowerCase(),d,audit].join(' ');
    let key='composition';
    if(goal==='portrait'&&(/long end|50.?55|focal|perspective/.test(blob)))key='focal';
    else if(goal==='action'&&(/freeze|shutter|motion|1\/500|1\/1000/.test(blob)))key='action';
    else if(goal==='night'&&(/iso|stabil|tripod|slow|shutter/.test(blob)))key='night';
    else if(goal==='indoor'&&(/shutter|iso|blur|available light/.test(blob)))key='indoor';
    else if((goal==='product'||goal==='car')&&(/reflection|product|car/.test(blob)))key='product';
    else if(/depth of field|aperture|f\//.test(blob))key='aperture';
    else if(/focus|detail|sharp|soft|af point|uncertain/.test(blob))key='focus';
    else if(/highlight|clipp|too bright|negative exposure/.test(blob))key='highlights';
    else if(/shadow|exposure at capture|too dark|brightness/.test(blob))key='exposure';
    else if(/light direction|contrast|side light|window light/.test(blob))key='light';
    else if(/shutter|freeze|motion blur|camera shake/.test(blob))key='shutter';
    else if(/stability|handheld|steady/.test(blob))key='handling';
    else if(/composition|background|frame edge|placement|simplify/.test(blob))key='composition';
    const m=mappings[key];
    return {...m,key,reason:why||'This checkpoint matches the strongest issue detected in your latest reviewed photo.',sourceTitle:safe($('#smartTitle')?.textContent)||'Latest photo review',goal,diagnosis:d,createdAt:Date.now()};
  }
  function save(rec){if(!rec)return;try{localStorage.setItem(KEY,JSON.stringify(rec))}catch{};window.dispatchEvent(new CustomEvent('t7-adaptive-learning-updated',{detail:rec}))}
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}

  function makeCard(rec,where){
    const card=document.createElement('aside');card.className='adaptive-course-card';card.dataset.context=where;
    const mark=document.createElement('div');mark.className='adaptive-course-icon';mark.appendChild(icon(rec.icon||'learn'));
    const copy=document.createElement('div');copy.className='adaptive-course-copy';copy.innerHTML=`<small>${where==='review'?'STUDY THIS NEXT':'RECOMMENDED FROM YOUR LATEST PHOTO'}</small><h3>${rec.title}</h3><p>${rec.reason}</p><div class="adaptive-course-meta"><i></i><span>Matched to this photo’s strongest learning need</span></div>`;
    const btn=document.createElement('button');btn.className='adaptive-course-open';btn.type='button';btn.textContent='Open checkpoint';btn.onclick=()=>open(rec);
    card.append(mark,copy,btn);return card;
  }
  function open(rec){
    location.hash='learn';
    const go=()=>{if(window.T7PhotographyCourse?.openStep){window.T7PhotographyCourse.openStep(rec.chapter,rec.step);return true}return false};
    if(go())return;let tries=0;const timer=setInterval(()=>{tries++;if(go()||tries>12)clearInterval(timer)},80);
  }
  function renderReview(rec){
    const priority=$('#rv2Priority');if(!priority)return;
    let old=$('#adaptiveReviewCourse');if(old)old.remove();
    if(!rec)return;
    const wrap=document.createElement('div');wrap.id='adaptiveReviewCourse';wrap.appendChild(makeCard(rec,'review'));priority.after(wrap);
  }
  function renderGuide(rec){
    const guide=$('#photographyGuide');if(!guide)return;
    let wrap=$('#pgAdaptiveRecommendation');if(!wrap){wrap=document.createElement('div');wrap.id='pgAdaptiveRecommendation';wrap.className='pg-adaptive-wrap';const course=$('#photographyCourse');(course||guide.querySelector('.pg-section'))?.before(wrap)}
    wrap.innerHTML='';if(rec)wrap.appendChild(makeCard(rec,'guide'));wrap.hidden=!rec;
  }
  function refreshFromReview(){const rec=choose();if(!rec)return;save(rec);renderReview(rec);renderGuide(rec)}
  function refreshStored(){const rec=load();renderGuide(rec);if(location.hash==='#review'||document.body?.dataset?.route==='review')renderReview(rec)}

  const watched=['#reviewScore','#smartTitle','#smartWhy'];
  const obs=new MutationObserver(()=>setTimeout(refreshFromReview,80));watched.forEach(sel=>{const el=$(sel);if(el)obs.observe(el,{childList:true,characterData:true,subtree:true})});
  window.addEventListener('t7-review-updated',()=>setTimeout(refreshFromReview,140));
  window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='learn')setTimeout(refreshStored,40);if(e.detail?.route==='review')setTimeout(refreshStored,40)});
  $('#reviewGoal')?.addEventListener('change',()=>setTimeout(refreshFromReview,120));
  setTimeout(()=>{refreshStored();refreshFromReview()},500);
  window.T7AdaptiveLearning={choose,load,open,refresh:refreshFromReview,version:'1.0.0'};
})();
