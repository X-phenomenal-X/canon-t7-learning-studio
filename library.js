(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const main=document.querySelector('main'),edit=document.getElementById('edit');if(!main||!edit||document.getElementById('library'))return;
  const section=document.createElement('section');section.id='library';section.className='section library-screen';
  section.innerHTML=`
    <div class="library-hero"><div><small>YOUR LIBRARY</small><h1>Your photography, becoming a body of work.</h1><p>See the photos first. Then use trends, reshoots, and camera habits to understand what is actually improving.</p></div><span class="library-local">LOCAL • PRIVATE</span></div>
    <div class="library-gallery" id="libGallery"></div>
    <div class="library-summary">
      <div class="library-stat"><small>REVIEWED</small><b id="libCount">0</b><span>photos analyzed</span></div>
      <div class="library-stat"><small>FOCUS / DETAIL</small><b id="libFocusTrend">Need more</b><span id="libFocusDelta">Build a baseline</span></div>
      <div class="library-stat"><small>EXPOSURE</small><b id="libExposureTrend">Need more</b><span id="libExposureDelta">Build a baseline</span></div>
      <div class="library-stat"><small>RESHOOT</small><b id="libReshootState">—</b><span id="libReshootSub">No comparison yet</span></div>
    </div>
    <div class="library-main">
      <div class="library-card"><div class="library-card-head"><div><small>TECHNICAL TREND</small><h2>Recent progress</h2><p>Focus/detail and exposure across your latest reviews.</p></div><select class="library-filter" id="libFilter"><option value="all">All photos</option><option value="portrait">Portraits</option><option value="product">Products</option><option value="landscape">Landscapes</option><option value="action">Action</option><option value="indoor">Indoor</option><option value="night">Night</option><option value="general">General</option></select></div><div class="library-chart" id="libChart"></div><div class="library-chart-legend"><span class="focus">Focus / detail</span><span class="exposure">Exposure</span></div></div>
      <div class="library-card"><div class="library-card-head"><div><small>SKILLS</small><h2>Your technical baseline</h2><p>Based on recent reviewed photos.</p></div></div><div class="library-skill-list" id="libSkills"></div><div class="library-next" id="libNext"></div></div>
    </div>
    <div class="library-card library-reshoot"><div class="library-card-head"><div><small>RESHOOT LOOP</small><h2>Attempt comparison</h2><p>See whether changing one variable actually helped.</p></div></div><div id="libReshoot"></div></div>
    <div class="library-card library-list-card"><div class="library-card-head"><div><small>RECENT REVIEWS</small><h2>Contact sheet</h2><p>Thumbnails and technical notes stay local. Your full originals are never copied into Library.</p></div></div><div class="library-list" id="libList"></div><details class="library-danger"><summary>Library settings</summary><button class="button" id="libClear">Clear local review history</button></details></div>`;
  main.insertBefore(section,edit);

  let items=[],filter='all';
  const trendClass=t=>t?.label==='Improving'?'library-trend-up':t?.label==='Down'?'library-trend-down':'library-trend-flat';
  const finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
  function filtered(){return filter==='all'?items:items.filter(x=>x.goal===filter)}
  function avg(list,key){return list.length?Math.round(list.reduce((s,x)=>s+Number(x[key]||0),0)/list.length):0}
  function status(v){return window.T7History?.metricStatus?.(v)||(v>=78?'Strong':v>=62?'Developing':'Practice')}
  function trend(list,key){return window.T7History?.trend?.(list,key)||{label:'Need more',delta:0}}
  function deltaText(t){if(t.label==='Need more')return'Build a baseline';return`${t.delta>0?'+':''}${t.delta} recent change`}
  function shutter(v){if(!finite(v))return'';v=Number(v);return v>=1?`${Math.round(v*10)/10}s`:`1/${Math.max(1,Math.round(1/v))}`}
  function actual(x){const e=x?.exif||{},p=[];if(finite(e.focal))p.push(`${Math.round(Number(e.focal))}mm`);if(finite(e.aperture))p.push(`f/${Math.round(Number(e.aperture)*10)/10}`);if(finite(e.exposure))p.push(shutter(e.exposure));if(finite(e.iso))p.push(`ISO ${Math.round(Number(e.iso))}`);return p.join(' · ')}
  function goalName(x){return x?.sceneName||String(x?.goal||'Photo').replace(/^./,c=>c.toUpperCase())}

  function galleryHtml(list){
    const photos=list.filter(x=>x?.thumb).slice(0,12);
    if(!photos.length)return`<div class="library-gallery-empty"><div class="library-frame-mark"><span></span></div><div><small>YOUR PHOTOS WILL LIVE HERE</small><b>Review your first Canon JPEG.</b><p>Once you do, Library becomes a visual contact sheet instead of an empty dashboard.</p><a href="#review">Review a photo</a></div></div>`;
    return photos.map((x,i)=>{const date=new Date(x.time||Date.now()).toLocaleDateString([], {month:'short',day:'numeric'}),settings=actual(x)||'Canon T7';return`<a class="library-gallery-shot ${i===0?'featured':''}" href="#review" style="--gallery-photo:url('${esc(x.thumb)}')"><img src="${esc(x.thumb)}" alt="${esc(goalName(x))} reviewed photo"><span class="library-gallery-shade"></span><div class="library-gallery-copy"><small>${i===0?'LATEST FRAME':esc(date)}</small><b>${esc(goalName(x))}</b><em>${esc(settings)}</em></div></a>`}).join('');
  }

  function chart(list){
    const data=[...list].reverse().slice(-12);if(!data.length)return'<div class="library-empty"><div><b>No reviews yet</b>Review a Canon JPEG and your progress chart will start here.</div></div>';
    const W=640,H=210,p=25,x=i=>p+(W-p*2)*(data.length===1?.5:i/(data.length-1)),y=v=>H-p-(H-p*2)*(Math.max(0,Math.min(100,Number(v||0)))/100),path=key=>data.map((d,i)=>(i?'L':'M')+x(i)+','+y(d[key])).join(' ');
    return`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Focus and exposure trend"><line x1="${p}" y1="${y(75)}" x2="${W-p}" y2="${y(75)}" stroke="#26313d"/><line x1="${p}" y1="${y(50)}" x2="${W-p}" y2="${y(50)}" stroke="#202a35"/><text x="${p}" y="${y(75)-6}" fill="#687788" font-size="9">75</text><text x="${p}" y="${y(50)-6}" fill="#687788" font-size="9">50</text><path d="${path('detail')}" fill="none" stroke="#ff9b72" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="${path('exposure')}" fill="none" stroke="#8be8b7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${data.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d.detail)}" r="4" fill="#ff9b72"/><circle cx="${x(i)}" cy="${y(d.exposure)}" r="3" fill="#8be8b7"/>`).join('')}</svg>`;
  }

  function weakest(list){
    if(!list.length)return{key:'focus',title:'Build your baseline',text:'Review two or three photos first. Then Library can tell you which technical skill deserves attention.',href:'#review',cta:'Review a photo'};
    const recent=list.slice(0,Math.min(6,list.length)),scores={detail:avg(recent,'detail'),exposure:avg(recent,'exposure'),clipping:avg(recent,'clipping'),contrast:avg(recent,'contrast')},key=Object.keys(scores).sort((a,b)=>scores[a]-scores[b])[0];
    const map={detail:{title:'Practice focus and shutter discipline',text:'Use one AF point on the important detail and keep the shutter safely fast for the subject.',href:'#learn',cta:'Practice focus'},exposure:{title:'Practice exposure control',text:'Watch overall brightness and change only one of light, aperture, shutter, or ISO at a time.',href:'#learn',cta:'Practice exposure'},clipping:{title:'Practice highlight protection',text:'Watch bright skies, reflections, and white objects. Reduce exposure slightly when important highlights are blowing out.',href:'#shoot',cta:'Start a shoot'},contrast:{title:'Practice light direction',text:'Try window light or side light before adding contrast in editing. Directional light creates depth at capture.',href:'#conditions',cta:'Check conditions'}};
    return{...map[key],key,value:scores[key]};
  }
  function skillCards(list){
    if(!list.length)return'<div class="library-empty"><div><b>No technical baseline yet</b>Your skills will appear after the first few reviews.</div></div>';
    const recent=list.slice(0,Math.min(8,list.length)),defs=[['Focus / detail','detail'],['Exposure','exposure'],['Tone protection','clipping'],['Light / contrast','contrast']];
    return defs.map(([name,key])=>{const v=avg(recent,key),s=status(v);return`<div class="library-skill"><div class="library-skill-top"><b>${name}</b><em>${s}</em></div><div class="library-skill-track"><i style="width:${Math.max(4,v)}%"></i></div><small>${v||'—'}${v?'/100 diagnostic average':''}</small></div>`}).join('');
  }

  function reshoot(){
    const r=window.T7Store?.get('reshoot',null)||(()=>{try{return JSON.parse(localStorage.getItem('canonReshootSessionV1')||'null')}catch{return null}})();
    if(r?.active&&r.attempt1){$('#libReshootState').textContent='Active';$('#libReshootSub').textContent='One change in progress';return`<div class="library-next"><small>ACTIVE CHALLENGE</small><b>${esc(r.focus?.title||'Reshoot one variable')}</b><p>${esc(r.focus?.text||'Use the first photo as your baseline and change one thing.')}</p><a href="#shoot">Continue reshoot</a></div>`}
    if(r?.attempt1&&r?.attempt2){
      const a=r.attempt1,b=r.attempt2,dd=Number(b.detail||0)-Number(a.detail||0),de=Number(b.exposure||0)-Number(a.exposure||0);$('#libReshootState').textContent='Compared';$('#libReshootSub').textContent=`Focus ${dd>=0?'+':''}${dd} · Exposure ${de>=0?'+':''}${de}`;
      return`<div class="library-compare"><div class="library-attempt"><small>ATTEMPT 1</small><b>Focus ${Number(a.detail||0)}</b><span>${esc(a.settings||'Baseline photo')}</span></div><div class="library-compare-arrow">→</div><div class="library-attempt"><small>ATTEMPT 2</small><b>Focus ${Number(b.detail||0)}</b><span>${esc(b.settings||'Reshoot')}</span></div></div><p class="library-reshoot-note">Focus/detail ${dd>=0?'+':''}${dd} · Exposure ${de>=0?'+':''}${de}. ${dd>3||de>3?'The controlled change improved at least one major technical signal.':'The attempts are close; another one-variable test will teach you more.'}</p>`;
    }
    $('#libReshootState').textContent='—';$('#libReshootSub').textContent='No comparison yet';return'<div class="library-reshoot-empty">Start a Reshoot challenge from Photo Review after you analyze a shot.</div>';
  }

  function listHtml(list){
    if(!list.length)return'<div class="library-empty"><div><b>No photos in this category</b>Review a photo to add it to your local Library.</div></div>';
    return list.slice(0,24).map(x=>{const date=new Date(x.time||Date.now()).toLocaleDateString([], {month:'short',day:'numeric'}),goal=goalName(x),diag=x.diagnosis||x.status||'Reviewed',settings=actual(x)||x.settings||'Settings unavailable';return`<div class="library-item">${x.thumb?`<img src="${esc(x.thumb)}" alt="${esc(goal)} review thumbnail">`:'<div class="library-thumb-empty"></div>'}<div class="library-item-copy"><b>${esc(goal)} · ${date}</b><small>${esc(settings)}</small><small>${esc(x.labels?.detail||'Focus')} · ${esc(x.labels?.exposure||'Exposure')}</small><div class="library-item-actions"><button class="library-mini" data-shoot-goal="${esc(x.goal||'general')}">Shoot again</button></div></div><div class="library-item-status"><b>${esc(diag)}</b><span>${esc(x.confidence||'Technical check')}</span><button class="library-delete" data-lib-delete="${Number(x.id)}" aria-label="Delete this review">×</button></div></div>`}).join('');
  }

  function render(){
    const list=filtered(),focus=trend(items,'detail'),exposure=trend(items,'exposure');
    $('#libGallery').innerHTML=galleryHtml(items);$('#libCount').textContent=items.length;$('#libFocusTrend').textContent=focus.label;$('#libFocusTrend').className=trendClass(focus);$('#libFocusDelta').textContent=deltaText(focus);$('#libExposureTrend').textContent=exposure.label;$('#libExposureTrend').className=trendClass(exposure);$('#libExposureDelta').textContent=deltaText(exposure);
    $('#libChart').innerHTML=chart(list);$('#libSkills').innerHTML=skillCards(items);const next=weakest(items);$('#libNext').innerHTML=`<small>BEST NEXT PRACTICE</small><b>${esc(next.title)}</b><p>${esc(next.text)}</p><a href="${next.href}">${esc(next.cta)}</a>`;$('#libReshoot').innerHTML=reshoot();$('#libList').innerHTML=listHtml(list);
    $$('[data-shoot-goal]').forEach(b=>b.onclick=()=>{const g=b.dataset.shootGoal==='general'?'portrait':b.dataset.shootGoal;window.T7Store?.set('shootSubject',g);location.hash='shoot'});
    $$('[data-lib-delete]').forEach(b=>b.onclick=async()=>{await window.T7History?.remove(Number(b.dataset.libDelete));await refresh()});
  }
  async function refresh(){try{items=await window.T7History?.all?.()||[];render()}catch(err){console.warn('Could not load Library',err);$('#libList').innerHTML='<div class="library-empty"><div><b>Library unavailable</b>This browser mode did not allow local history storage.</div></div>'}}

  $('#libFilter').onchange=e=>{filter=e.target.value;render()};
  $('#libClear').onclick=async()=>{if(confirm('Clear all locally saved photo review history on this device?')){await window.T7History?.clear?.();items=[];render()}};
  window.addEventListener('t7-history-updated',e=>{if(e.detail?.items){items=e.detail.items;render()}else refresh()});window.addEventListener('t7-store-change',e=>{if(e.detail?.name==='reshoot')render()});
  window.T7Library={refresh};setTimeout(refresh,120);
})();