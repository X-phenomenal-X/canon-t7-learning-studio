(()=>{
  const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const library=document.getElementById('library');if(!library||window.T7LibraryInsights)return;
  const finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
  const pct=(n,d)=>d?Math.round(n/d*100):0;
  const recentLimit=12;

  const card=document.createElement('section');
  card.className='library-card library-patterns';
  card.innerHTML=`<div class="library-card-head"><div><small>CAMERA HABITS</small><h2>What keeps happening?</h2><p>Repeated patterns from your recent Canon settings and technical reviews—not conclusions from one photo.</p></div><span class="library-pattern-count" id="libPatternCount">Building baseline</span></div><div id="libPatternBody"></div>`;
  const main=library.querySelector('.library-main');if(main)library.insertBefore(card,main);else library.appendChild(card);
  const body=$('#libPatternBody'),count=$('#libPatternCount');

  function exif(item){const x=item?.exif||{};return{shutter:finite(x.exposure)?Number(x.exposure):null,aperture:finite(x.aperture)?Number(x.aperture):null,iso:finite(x.iso)?Number(x.iso):null,focal:finite(x.focal)?Number(x.focal):null}}
  function shutter(v){if(!finite(v))return'—';return v>=1?`${Math.round(v*10)/10}s`:`1/${Math.max(1,Math.round(1/v))}`}
  function actual(item){const x=exif(item),parts=[];if(x.focal)parts.push(`${Math.round(x.focal)}mm`);if(x.aperture)parts.push(`f/${Math.round(x.aperture*10)/10}`);if(x.shutter)parts.push(shutter(x.shutter));if(x.iso)parts.push(`ISO ${Math.round(x.iso)}`);return parts.join(' • ')||'EXIF unavailable'}
  function titleGoal(g){return({portrait:'Portrait',product:'Product',landscape:'Landscape',action:'Action',indoor:'Indoor',night:'Night',general:'General'})[g]||'Photo'}

  const definitions=[
    {
      id:'indoorSlowShutter',title:'Slow shutter is recurring indoors',skill:'Shutter speed',href:'#learn',cta:'Practice shutter speed',
      eligible:i=>['indoor','portrait','product'].includes(i.goal)&&i.scene!=='tvDark'&&i.scene!=='nightHandheld',
      hit:i=>{const x=exif(i);if(!x.shutter)return false;const limit=i.goal==='portrait'?1/125:1/100;return x.shutter>limit*1.08},
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} recent indoor/people/product shots used a shutter slower than the normal handheld starting range.`,
      action:'Protect shutter speed first. Raise ISO or add light before accepting camera shake or subject blur.'
    },
    {
      id:'portraitWide',title:'Portraits are often too wide',skill:'Focal length',href:'#learn',cta:'Practice the 18–55mm lens',
      eligible:i=>i.goal==='portrait',hit:i=>{const x=exif(i);return x.focal&&x.focal<40},
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} recent portraits were shot below 40mm.`,
      action:'Try 50–55mm and step back. It usually gives a cleaner portrait perspective and easier background separation.'
    },
    {
      id:'actionSlow',title:'Action shutter speed is staying too slow',skill:'Action',href:'#shoot',cta:'Start an action shoot',
      eligible:i=>i.goal==='action'||i.scene==='movingCar',hit:i=>{const x=exif(i);return x.shutter&&x.shutter>(i.scene==='movingCar'?1/800:1/500)*1.08},
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} recent action shots were below the safer motion-freezing range.`,
      action:'Keep the shutter fast and let ISO rise when necessary. For fast cars or sports, start around 1/800–1/1000.'
    },
    {
      id:'highIsoSlow',title:'ISO is high but shutter is still risky',skill:'Exposure triangle',href:'#learn',cta:'Practice ISO + shutter',
      eligible:i=>['indoor','portrait'].includes(i.goal)||i.scene==='nightHandheld',
      hit:i=>{const x=exif(i);return x.iso>=1600&&x.shutter&&x.shutter>1/80*1.08},
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} relevant low-light shots used ISO 1600+ while the shutter was still slower than about 1/80.`,
      action:'If you accept higher ISO, make it buy you something—usually a safer shutter speed. A sharper noisy photo is often more useful than a clean blurry one.'
    },
    {
      id:'highlights',title:'Important highlights keep getting clipped',skill:'Exposure',href:'#shoot',cta:'Practice highlight control',
      eligible:i=>Number(i.clipping)>0,
      hit:i=>Number(i.clipping)<58||/highlight/i.test(String(i.diagnosis||'')),
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} recent reviews showed weak highlight/shadow protection, usually from very bright areas.`,
      action:'Watch bright skies, reflections and screens. Reduce exposure slightly when those bright areas contain important detail.'
    },
    {
      id:'soft',title:'Focus/detail is repeatedly the weak signal',skill:'Focus',href:'#learn',cta:'Practice focus',
      eligible:i=>Number(i.detailConfidence||0)>=55,
      hit:i=>Number(i.detail||0)<58&&Number(i.detailConfidence||0)>=55,
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} recent reviews had a confidently weak focus/detail signal.`,
      action:'Use one AF point on the important detail and keep shutter speed safely fast before adding sharpening in Edit.'
    },
    {
      id:'landscapeIso',title:'Landscape ISO is higher than it needs to be',skill:'ISO',href:'#learn',cta:'Practice landscape exposure',
      eligible:i=>i.goal==='landscape',hit:i=>{const x=exif(i);return x.iso&&x.iso>800},
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} recent landscapes used ISO above 800.`,
      action:'For static landscapes, stabilize the camera and work back toward ISO 100–400 when the scene allows it.'
    },
    {
      id:'landscapeAperture',title:'Landscapes are often using a very wide aperture',skill:'Aperture',href:'#learn',cta:'Practice aperture',
      eligible:i=>i.goal==='landscape',hit:i=>{const x=exif(i);return x.aperture&&x.aperture<5.6},
      explain:(hits,eligible)=>`${hits.length} of ${eligible.length} recent landscapes were shot wider than f/5.6.`,
      action:'When you want broad depth of field, f/8 is a strong starting point. Use a tripod if the resulting shutter becomes too slow.'
    }
  ];

  function analyze(items){
    const usable=items.slice(0,recentLimit).filter(i=>i&&i.exif),patterns=[];
    definitions.forEach(d=>{
      const eligible=usable.filter(d.eligible),hits=eligible.filter(d.hit);if(eligible.length<2||hits.length<2)return;
      const rate=hits.length/eligible.length;
      if(rate<.45&&hits.length<3)return;
      patterns.push({...d,hits,eligible,rate,score:hits.length*12+rate*35});
    });
    return{usable,patterns:patterns.sort((a,b)=>b.score-a.score)};
  }

  function sample(pattern){const x=pattern.hits[0];if(!x)return'';const scene=x.sceneName||titleGoal(x.goal),date=new Date(x.time||Date.now()).toLocaleDateString([], {month:'short',day:'numeric'});return`${scene} · ${date} · ${actual(x)}`}
  function render(items){
    const {usable,patterns}=analyze(items||[]);count.textContent=usable.length<3?`${usable.length} / 3 reviews`:`${usable.length} recent files`;
    if(usable.length<3){body.innerHTML=`<div class="library-pattern-empty"><b>Review ${3-usable.length} more original Canon ${3-usable.length===1?'photo':'photos'}</b><p>Once there are at least three recent files with camera settings, Library will start looking for repeated shooting habits.</p><a href="#review">Review a photo</a></div>`;return}
    if(!patterns.length){body.innerHTML='<div class="library-pattern-clear"><b>No strong recurring problem yet.</b><p>Your recent files do not show the same camera-setting mistake often enough for Library to call it a habit. Keep shooting and reviewing.</p></div>';return}
    const top=patterns[0],others=patterns.slice(1,3);
    body.innerHTML=`<div class="library-pattern-primary"><div class="library-pattern-top"><span>TOP PATTERN</span><em>${top.hits.length} of ${top.eligible.length}</em></div><h3>${esc(top.title)}</h3><p>${esc(top.explain(top.hits,top.eligible))}</p><div class="library-pattern-evidence"><small>RECENT EXAMPLE</small><b>${esc(sample(top))}</b></div><div class="library-pattern-action"><small>CHANGE THIS HABIT</small><p>${esc(top.action)}</p><a href="${top.href}" data-pattern-practice="${esc(top.id)}">${esc(top.cta)}</a></div></div>${others.length?`<div class="library-pattern-more">${others.map(p=>`<div><span>${esc(p.title)}</span><small>${p.hits.length} of ${p.eligible.length} matching recent shots</small></div>`).join('')}</div>`:''}`;
    $('[data-pattern-practice]')?.addEventListener('click',()=>{window.T7Store?.set('practiceInsight',{id:top.id,title:top.title,skill:top.skill,time:Date.now()});if(top.id==='actionSlow')window.T7Store?.set('shootSubject','action')});
  }

  async function refresh(){try{const items=await window.T7History?.all?.()||[];render(items)}catch{render([])}}
  window.addEventListener('t7-history-updated',e=>render(e.detail?.items||[]));window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='library')refresh()});
  window.T7LibraryInsights={analyze,refresh,version:'1.0.0'};setTimeout(refresh,180);
})();