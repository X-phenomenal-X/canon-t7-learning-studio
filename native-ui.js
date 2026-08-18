(()=>{
  const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const home=$('#home');if(!home)return;
  const hour=new Date().getHours(),hello=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const cameraEssentials=['modeDial','shutter','mainDial','q','iso','af','afPoint','avComp'];
  let latestItems=[];

  home.className='dashboard-home native-home home-v2';
  home.innerHTML=`
    <div class="native-greeting"><div><small>${hello}</small><h1>Go make a frame.</h1></div><span class="native-camera">EOS Rebel T7 · 18–55mm</span></div>
    <a class="home-v2-hero" id="homeShootHero" href="#shoot"><span class="home-v2-hero-art" aria-hidden="true"><i class="hero-lens"><b></b></i><i class="hero-beam"></i><i class="hero-grain"></i></span>
      <div class="home-v2-hero-copy"><span class="home-v2-kicker" id="homeHeroKicker">READY TO SHOOT</span><h2 id="homeHeroTitle">Your next photo starts here.</h2><p id="homeHeroText">Pick the scene. T7 Studio will give you one clear setup, framing direction, and a controlled three-shot plan.</p><span class="home-v2-hero-cta">Start Guided Shoot <b>→</b></span></div>
      <div class="home-v2-hero-side"><div class="home-v2-hero-session"><small>RECENT SESSION</small><b id="homeHeroSessionTitle">No reviewed frame yet</b><span id="homeHeroSessionMeta">Your first Canon JPEG will appear here after Review.</span></div></div>
    </a>
    <section class="home-v2-next" id="homeCoach" data-kind="default"><div class="home-v2-next-mark"></div><div class="home-v2-next-copy"><small>YOUR NEXT BEST STEP</small><b>Build your first photography baseline</b><span>Take a photo, review the original Canon JPEG, then let T7 Studio learn what you need next.</span></div><a href="#shoot" id="homeCoachAction">Start shooting</a></section>
    <div class="home-v2-strip">
      <a class="home-v2-mini home-v2-session-card" id="homeSessionCard" href="#library"><span class="home-v2-mini-arrow">↗</span><small>RECENT SESSION</small><div class="home-v2-session-meta"><h3>No reviewed photo yet</h3><p>Review a Canon JPEG to start your visual history.</p></div></a>
      <a class="home-v2-mini home-v2-light" id="homeLightCard" href="#conditions"><span class="home-v2-mini-arrow">↗</span><small>LIGHT / GOLDEN HOUR</small><h3 id="homeLightTitle">Check the light</h3><span class="home-v2-light-phase"><i></i><span id="homeLightPhase">Conditions not checked yet</span></span><span class="home-v2-light-time" id="homeLightTime">Open Conditions</span><span class="home-v2-light-location" id="homeLightLocation">Live weather only when you ask for it</span></a>
      <a class="native-progress-row home-v2-mini home-v2-progress-card" id="homeContinueSecondary" href="#learn"><div class="native-progress-ring" id="homeRing" style="--pct:0"><b id="homePct">0%</b></div><div class="native-progress-copy"><small>LEARNING</small><b id="homeNextTitle">Learn the camera basics</b><span id="homeNextDesc">Your progress stays local.</span><span id="homeControls" hidden>0 / 8 explored</span><span id="homeSimulator" hidden>0 / 3 tried</span><span id="homePractice" hidden>0 / 7 complete</span></div><span class="native-progress-arrow">›</span></a>
    </div>
    <a id="homeContinue" href="#learn" hidden>Continue learning</a>
    <div class="home-v2-utilities"><a class="home-v2-utility" href="#review">Review photo</a><a class="home-v2-utility" href="#library">Open Library</a><a class="home-v2-utility" href="#camera">Camera controls</a></div>`;

  function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
  function finite(v){return Number.isFinite(Number(v))&&Number(v)>0}
  function shutter(v){if(!finite(v))return'';v=Number(v);return v>=1?`${Math.round(v*10)/10}s`:`1/${Math.max(1,Math.round(1/v))}`}
  function actualSettings(item){const x=item?.exif||{},parts=[];if(finite(x.focal))parts.push(`${Math.round(Number(x.focal))}mm`);if(finite(x.aperture))parts.push(`f/${Math.round(Number(x.aperture)*10)/10}`);if(finite(x.exposure))parts.push(shutter(x.exposure));if(finite(x.iso))parts.push(`ISO ${Math.round(Number(x.iso))}`);return parts.join(' · ')}
  function goalName(item){return item?.sceneName||String(item?.goal||'Photo').replace(/^./,x=>x.toUpperCase())}
  function setShootContext(item){const g=item?.goal==='general'?'portrait':item?.goal;if(g)window.T7Store?.set('shootSubject',g);window.T7Store?.set('shootScene',item?.scene||null)}
  function fmtTime(d){return d instanceof Date&&!isNaN(d)?d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'—'}

  function syncHero(source){
    const hero=$('#homeShootHero');if(!hero)return;
    const thumb=source?.thumb;
    if(thumb){const safe=String(thumb).replace(/"/g,'%22');hero.classList.add('has-photo');hero.style.setProperty('background',`url("${safe}") center/cover no-repeat`,'important');$('#homeHeroKicker').textContent=`LAST FRAME · ${goalName(source).toUpperCase()}`;$('#homeHeroTitle').textContent='Make the next frame better.';$('#homeHeroText').textContent='Your latest Canon photo is already in the learning loop. Continue with one deliberate next shot or start a new scene.'}
    else{hero.classList.remove('has-photo');hero.style.removeProperty('background');$('#homeHeroKicker').textContent='READY TO SHOOT';$('#homeHeroTitle').textContent='Your next photo starts here.';$('#homeHeroText').textContent='Pick the scene. T7 Studio will give you one clear setup, framing direction, and a controlled three-shot plan.'}
  }

  function renderSession(source){
    const card=$('#homeSessionCard'),heroTitle=$('#homeHeroSessionTitle'),heroMeta=$('#homeHeroSessionMeta');if(!card)return;
    syncHero(source);card.querySelector('.home-v2-session-thumb')?.remove();
    if(!source){card.querySelector('.home-v2-session-meta').innerHTML='<h3>No reviewed photo yet</h3><p>Review a Canon JPEG to start your visual history.</p>';if(heroTitle)heroTitle.textContent='No reviewed frame yet';if(heroMeta)heroMeta.textContent='Your first Canon JPEG will appear here after Review.';return}
    const actual=actualSettings(source),status=source.status||source.diagnosis||'Reviewed',name=goalName(source),date=new Date(source.time||Date.now()).toLocaleDateString([], {month:'short',day:'numeric'});
    card.querySelector('.home-v2-session-meta').innerHTML=`<h3>${esc(name)}</h3><p>${esc(actual||status)}${actual?` · ${esc(status)}`:''}<br>${esc(date)}</p>`;
    if(source.thumb){const img=document.createElement('img');img.className='home-v2-session-thumb';img.src=source.thumb;img.alt='Latest reviewed photo';card.appendChild(img)}
    if(heroTitle)heroTitle.textContent=name;if(heroMeta)heroMeta.textContent=actual||`${status} · ${date}`;
  }

  function renderLight(){
    const saved=readJson('canonT7LastConditionsV1',null),title=$('#homeLightTitle'),phase=$('#homeLightPhase'),time=$('#homeLightTime'),loc=$('#homeLightLocation');if(!title||!phase||!time||!loc)return;
    if(!saved?.daily||!saved?.time||Date.now()-Number(saved.time)>18*60*60*1000){title.textContent='Check the light';phase.textContent='Conditions not checked yet';time.textContent='Open Conditions';loc.textContent='Live weather only when you ask for it';return}
    const riseRaw=(saved.daily.sunrise||[])[0],setRaw=(saved.daily.sunset||[])[0],rise=riseRaw?new Date(riseRaw):null,set=setRaw?new Date(setRaw):null,now=new Date(),amEnd=rise?new Date(rise.getTime()+60*60000):null,pmStart=set?new Date(set.getTime()-60*60000):null;
    title.textContent=saved.name&&saved.name!=='your location'?saved.name.split(',')[0]:'Today’s light';loc.textContent=saved.name||'Last checked conditions';
    if(rise&&amEnd&&now>=rise&&now<=amEnd){phase.textContent='Morning golden hour · now';time.textContent=`Until ${fmtTime(amEnd)}`}
    else if(pmStart&&set&&now>=pmStart&&now<=set){phase.textContent='Evening golden hour · now';time.textContent=`Until ${fmtTime(set)}`}
    else if(pmStart&&now<pmStart){phase.textContent='Evening golden hour';time.textContent=`${fmtTime(pmStart)} – ${fmtTime(set)}`}
    else if(rise&&now<rise){phase.textContent='Morning golden hour';time.textContent=`${fmtTime(rise)} – ${fmtTime(amEnd)}`}
    else{phase.textContent='Daylight window finished';time.textContent='Check tomorrow’s light'}
  }

  function restoreLearning(){
    const controls=readJson('canonSeenControls',{}),presets=readJson('canonSeenPresets',{}),practice=readJson('canonPracticeV5',[]),learned=readJson('canonLearnDone',{});
    const c=cameraEssentials.filter(k=>controls[k]).length,p=Object.keys(presets).length,done=practice.filter(Boolean).length,learnCount=Object.values(learned).filter(Boolean).length,practiceTotal=Math.max(7,practice.length||0);
    const total=Math.round((c/8)*30+(Math.min(p,3)/3)*15+(done/practiceTotal)*25+(learnCount/6)*30);
    let title='Learn the camera basics',href='#learn';
    if(learnCount>0&&learnCount<6){title=`Continue ${6-learnCount} core lessons`;href='#learn'}else if(learnCount>=6&&c<4){title='Explore the physical controls';href='#camera'}else if(c>=4&&p<2){title='Practice exposure visually';href='#simulator'}else if(c>=4&&p>=2&&done<3){title='Try a real practice challenge';href='#practice'}else if(c>=4&&p>=2&&done>=3){title='Shoot and review a real photo';href='#shoot'}
    const pct=$('#homePct'),ring=$('#homeRing'),next=$('#homeNextTitle'),secondary=$('#homeContinueSecondary'),primary=$('#homeContinue');
    if(pct)pct.textContent=Math.min(100,total)+'%';if(ring)ring.style.setProperty('--pct',Math.min(100,total));if(next)next.textContent=title;if(secondary)secondary.href=href;if(primary)primary.href=href;
    const hc=$('#homeControls'),hs=$('#homeSimulator'),hp=$('#homePractice');if(hc)hc.textContent=`${c} / 8 explored`;if(hs)hs.textContent=`${p} / 3 tried`;if(hp)hp.textContent=`${done} / ${practiceTotal} complete`;
  }

  function coachContent({kicker,title,text,href,cta,kind='default',onclick=null}){
    const card=$('#homeCoach'),action=$('#homeCoachAction');if(!card||!action)return;
    card.dataset.kind=kind;card.querySelector('.home-v2-next-copy small').textContent=kicker;card.querySelector('.home-v2-next-copy b').textContent=title;card.querySelector('.home-v2-next-copy span').textContent=text;action.textContent=cta;action.href=href||'#learn';action.onclick=onclick;
  }

  async function refreshPersonal(){
    try{latestItems=await window.T7History?.all?.()||[]}catch{latestItems=[]}
    const last=latestItems[0]||window.T7Store?.get('recentPhoto',null)||readJson('canonRecentPhoto',null);renderSession(last);
    const reshoot=window.T7Store?.get('reshoot',null)||readJson('canonReshootSessionV1',null);
    if(reshoot?.active&&reshoot.attempt1){coachContent({kicker:'RESHOOT IN PROGRESS',title:reshoot.focus?.title||'Finish your controlled comparison',text:'Attempt 1 is saved. Take Attempt 2 with one deliberate change so the app can tell you what actually helped.',href:'#shoot',cta:'Continue reshoot',kind:'reshoot',onclick:()=>setShootContext(reshoot.attempt1)});return}
    const practiceInsight=window.T7Store?.get('practiceInsight',null);
    if(practiceInsight){coachContent({kicker:'PERSONAL PRACTICE',title:practiceInsight.title||'Practice your recurring habit',text:`Library identified ${practiceInsight.skill||'a camera habit'} worth working on. Your three-shot drill is ready in Learn.`,href:'#learn',cta:'Open my drill',kind:'practice'});return}
    const analysis=window.T7LibraryInsights?.analyze?.(latestItems),top=analysis?.patterns?.[0];
    if(top){coachContent({kicker:'LIBRARY NOTICED A PATTERN',title:top.title,text:`${top.hits.length} of ${top.eligible.length} matching recent shots. ${top.action}`,href:'#learn',cta:'Practice this',kind:'pattern',onclick:()=>{window.T7Store?.set('practiceInsight',{id:top.id,title:top.title,skill:top.skill,time:Date.now()})}});return}
    if(last){const actual=actualSettings(last),weak=[['focus/detail',last.detail],['exposure',last.exposure],['tone protection',last.clipping],['contrast',last.contrast]].sort((a,b)=>Number(a[1]||0)-Number(b[1]||0))[0];coachContent({kicker:'YOUR NEXT SHOT',title:`Shoot another ${goalName(last).toLowerCase()} frame`,text:`Your last review${actual?` used ${actual}`:''}. One more controlled frame will show whether ${weak[0]} is a real pattern.`,href:'#shoot',cta:'Shoot again',kind:'baseline',onclick:()=>setShootContext(last)});return}
    coachContent({kicker:'YOUR NEXT BEST STEP',title:'Build your first photography baseline',text:'Take a photo, review the original Canon JPEG, then let T7 Studio learn what you need next.',href:'#shoot',cta:'Start shooting',kind:'default'});
  }

  function refresh(){restoreLearning();renderLight();refreshPersonal()}
  window.T7Home={refresh};refresh();
  window.addEventListener('storage',refresh);window.addEventListener('t7-history-updated',refresh);window.addEventListener('t7-camera-progress',restoreLearning);window.addEventListener('t7-conditions-updated',renderLight);window.addEventListener('t7-store-change',e=>{if(['recentPhoto','reshoot','practiceInsight','shootSubject','shootScene'].includes(e.detail?.name))refresh()});window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='home')refresh()});
})();
