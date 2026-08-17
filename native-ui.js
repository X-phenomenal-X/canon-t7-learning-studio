(()=>{
  const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const home=$('#home');if(!home)return;
  const hour=new Date().getHours();
  const hello=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const cameraEssentials=['modeDial','shutter','mainDial','q','iso','af','afPoint','avComp'];
  let latestItems=[];

  home.className='dashboard-home native-home';
  home.innerHTML=`
    <div class="native-greeting"><div><small>${hello}</small><h1>Your T7, made simpler.</h1></div><span class="native-camera">EOS Rebel T7 · 18–55mm</span></div>
    <a class="native-shoot-card" id="homeShootHero" href="#shoot"><div class="native-shoot-copy"><span class="native-label">GUIDED SHOOT</span><h2>Start with the photo, not the settings.</h2><p>Tell the app what you're shooting and get one clear setup for your Rebel T7.</p><span class="native-shoot-cta">Start shooting <b>→</b></span></div></a>
    <section class="native-coach" id="homeCoach"><div class="native-coach-mark">→</div><div class="native-coach-copy"><small>YOUR NEXT BEST STEP</small><b>Build your first photography baseline</b><span>Take a photo, review the original Canon JPEG, then let T7 Studio learn what you need next.</span></div><a href="#shoot" id="homeCoachAction">Start</a></section>
    <a class="native-progress-row" id="homeContinueSecondary" href="#learn"><div class="native-progress-ring" id="homeRing" style="--pct:0"><b id="homePct">0%</b></div><div class="native-progress-copy"><small>Learning progress</small><b id="homeNextTitle">Learn the camera basics</b><span id="homeNextDesc" hidden>Start with the controls you use most.</span><span id="homeControls" hidden>0 / 8 explored</span><span id="homeSimulator" hidden>0 / 3 tried</span><span id="homePractice" hidden>0 / 7 complete</span></div><span class="native-progress-arrow">›</span></a><a id="homeContinue" href="#learn" hidden>Continue learning</a>
    <div class="native-section-title"><h2>Choose a task</h2></div>
    <div class="native-actions"><a class="native-action review" href="#review"><span class="native-action-mark">✓</span><div><b>Review a photo</b><small>See what to improve next.</small></div></a><a class="native-action learn" href="#learn"><span class="native-action-mark">L</span><div><b>Learn</b><small>Short visual lessons.</small></div></a><a class="native-action conditions" href="#conditions"><span class="native-action-mark">☼</span><div><b>Conditions</b><small>Light and golden hour.</small></div></a><a class="native-action" href="#library"><span class="native-action-mark">▤</span><div><b>Library</b><small>Photos, trends, and progress.</small></div></a></div>
    <section class="native-latest"><div class="native-latest-head"><h2>Latest photo</h2><a href="#library">View Library</a></div><div class="recent-photo-empty"><div><b>No reviewed photo yet</b><p>Upload a Canon JPEG and your latest result will stay here.</p></div><a class="button" href="#review">Upload</a></div></section>`;

  function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
  function finite(v){return Number.isFinite(Number(v))&&Number(v)>0}
  function shutter(v){if(!finite(v))return'';v=Number(v);return v>=1?`${Math.round(v*10)/10}s`:`1/${Math.max(1,Math.round(1/v))}`}
  function actualSettings(item){const x=item?.exif||{},parts=[];if(finite(x.focal))parts.push(`${Math.round(Number(x.focal))}mm`);if(finite(x.aperture))parts.push(`f/${Math.round(Number(x.aperture)*10)/10}`);if(finite(x.exposure))parts.push(shutter(x.exposure));if(finite(x.iso))parts.push(`ISO ${Math.round(Number(x.iso))}`);return parts.join(' · ')}
  function goalName(item){return item?.sceneName||String(item?.goal||'Photo').replace(/^./,x=>x.toUpperCase())}
  function setShootContext(item){const g=item?.goal==='general'?'portrait':item?.goal;if(g)window.T7Store?.set('shootSubject',g);window.T7Store?.set('shootScene',item?.scene||null)}

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

  function renderLatest(item=null){
    const box=$('.native-latest .recent-photo-empty, .native-latest .recent-photo-card-live');if(!box)return;
    const recent=window.T7Store?.get('recentPhoto',null)||readJson('canonRecentPhoto',null),source=item||recent;
    if(!source)return;
    const date=new Date(source.time||Date.now()).toLocaleDateString([], {month:'short',day:'numeric'}),actual=item?actualSettings(item):'',settings=actual?`Actual: ${actual}`:(source.settings||'Canon T7 review'),status=source.status||source.diagnosis||source.score||'Reviewed';
    box.className='recent-photo-card-live';
    box.innerHTML=`${source.thumb?`<img src="${esc(source.thumb)}" alt="Latest reviewed photo">`:''}<div class="recent-photo-meta"><b>${esc(goalName(source))}</b><small>${esc(settings)}</small><small>${esc(date)}</small></div><div class="recent-score">${esc(status)}</div>`;
  }

  function coachContent({kicker,title,text,href,cta,kind='default',onclick=null}){
    const card=$('#homeCoach'),action=$('#homeCoachAction');if(!card||!action)return;
    card.dataset.kind=kind;card.querySelector('.native-coach-copy small').textContent=kicker;card.querySelector('.native-coach-copy b').textContent=title;card.querySelector('.native-coach-copy span').textContent=text;action.textContent=cta;action.href=href||'#learn';action.onclick=onclick;
  }

  async function refreshPersonal(){
    try{latestItems=await window.T7History?.all?.()||[]}catch{latestItems=[]}
    if(latestItems[0])renderLatest(latestItems[0]);else renderLatest();

    const reshoot=window.T7Store?.get('reshoot',null)||readJson('canonReshootSessionV1',null);
    if(reshoot?.active&&reshoot.attempt1){
      coachContent({kicker:'RESHOOT IN PROGRESS',title:reshoot.focus?.title||'Finish your controlled comparison',text:'Attempt 1 is saved. Take Attempt 2 with one deliberate change so the app can tell you what actually helped.',href:'#shoot',cta:'Continue reshoot',kind:'reshoot',onclick:()=>setShootContext(reshoot.attempt1)});return;
    }

    const practiceInsight=window.T7Store?.get('practiceInsight',null);
    if(practiceInsight){
      coachContent({kicker:'PERSONAL PRACTICE',title:practiceInsight.title||'Practice your recurring habit',text:`Library identified ${practiceInsight.skill||'a camera habit'} worth working on. Your three-shot drill is ready in Learn.`,href:'#learn',cta:'Open my drill',kind:'practice'});return;
    }

    const analysis=window.T7LibraryInsights?.analyze?.(latestItems),top=analysis?.patterns?.[0];
    if(top){
      coachContent({kicker:'LIBRARY NOTICED A PATTERN',title:top.title,text:`${top.hits.length} of ${top.eligible.length} matching recent shots. ${top.action}`,href:'#learn',cta:'Practice this',kind:'pattern',onclick:()=>{window.T7Store?.set('practiceInsight',{id:top.id,title:top.title,skill:top.skill,time:Date.now()})}});return;
    }

    const last=latestItems[0];
    if(last){
      const actual=actualSettings(last),weak=[['focus/detail',last.detail],['exposure',last.exposure],['tone protection',last.clipping],['contrast',last.contrast]].sort((a,b)=>Number(a[1]||0)-Number(b[1]||0))[0];
      coachContent({kicker:'BUILDING YOUR BASELINE',title:`Shoot another ${goalName(last).toLowerCase()} photo`,text:`Your last review${actual?` used ${actual}`:''}. One more controlled shot will help Library decide whether ${weak[0]} is a real pattern or just one frame.`,href:'#shoot',cta:'Shoot again',kind:'baseline',onclick:()=>setShootContext(last)});return;
    }

    coachContent({kicker:'YOUR NEXT BEST STEP',title:'Build your first photography baseline',text:'Take a photo, review the original Canon JPEG, then let T7 Studio learn what you need next.',href:'#shoot',cta:'Start shooting',kind:'default'});
  }

  function refresh(){restoreLearning();refreshPersonal()}
  window.T7Home={refresh};refresh();
  window.addEventListener('storage',refresh);window.addEventListener('t7-history-updated',refresh);window.addEventListener('t7-camera-progress',restoreLearning);window.addEventListener('t7-store-change',e=>{if(['recentPhoto','reshoot','practiceInsight','shootSubject','shootScene'].includes(e.detail?.name))refresh()});window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='home')refresh()});
})();