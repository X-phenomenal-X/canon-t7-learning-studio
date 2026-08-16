(()=>{
  const $=s=>document.querySelector(s);
  const home=$('#home');if(!home)return;
  const hour=new Date().getHours();
  const hello=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';

  home.className='dashboard-home native-home';
  home.innerHTML=`
    <div class="native-greeting"><div><small>${hello}</small><h1>Your T7, made simpler.</h1></div><span class="native-camera">EOS Rebel T7 · 18–55mm</span></div>
    <a class="native-shoot-card" href="#shoot"><div class="native-shoot-copy"><span class="native-label">GUIDED SHOOT</span><h2>Start with the photo, not the settings.</h2><p>Tell the app what you're shooting and get one clear setup for your Rebel T7.</p><span class="native-shoot-cta">Start shooting <b>→</b></span></div></a>
    <a class="native-progress-row" id="homeContinueSecondary" href="#learn"><div class="native-progress-ring" id="homeRing" style="--pct:0"><b id="homePct">0%</b></div><div class="native-progress-copy"><small>Continue</small><b id="homeNextTitle">Learn the camera basics</b><span id="homeNextDesc" hidden>Start with the controls you use most.</span><span id="homeControls" hidden>0 / 8 explored</span><span id="homeSimulator" hidden>0 / 3 tried</span><span id="homePractice" hidden>0 / 7 complete</span></div><span class="native-progress-arrow">›</span></a><a id="homeContinue" href="#learn" hidden>Continue learning</a>
    <div class="native-section-title"><h2>Choose a task</h2></div>
    <div class="native-actions"><a class="native-action review" href="#review"><span class="native-action-mark">✓</span><div><b>Review a photo</b><small>See what to improve next.</small></div></a><a class="native-action learn" href="#learn"><span class="native-action-mark">L</span><div><b>Learn</b><small>Short visual lessons.</small></div></a><a class="native-action conditions" href="#conditions"><span class="native-action-mark">☼</span><div><b>Conditions</b><small>Light and golden hour.</small></div></a><a class="native-action" href="#edit"><span class="native-action-mark">E</span><div><b>Edit</b><small>Finish your best shot.</small></div></a></div>
    <section class="native-latest"><div class="native-latest-head"><h2>Latest photo</h2><a href="#review">View review</a></div><div class="recent-photo-empty"><div><b>No reviewed photo yet</b><p>Upload a Canon JPEG and your latest result will stay here.</p></div><a class="button" href="#review">Upload</a></div></section>`;

  function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
  function restoreHomeState(){
    const controls=readJson('canonSeenControls',{}),presets=readJson('canonSeenPresets',{}),practice=readJson('canonPracticeV5',[]),learned=readJson('canonLearnDone',{});
    const c=Object.keys(controls).length,p=Object.keys(presets).length,done=practice.filter(Boolean).length,learnCount=Object.values(learned).filter(Boolean).length,practiceTotal=Math.max(7,practice.length||0);
    const total=Math.round((Math.min(c,8)/8)*30+(Math.min(p,3)/3)*15+(done/practiceTotal)*25+(learnCount/6)*30);
    let title='Learn the camera basics',href='#learn';
    if(learnCount>0&&learnCount<6){title=`Continue ${6-learnCount} core lessons`;href='#learn'}else if(learnCount>=6&&c<4){title='Explore the physical controls';href='#camera'}else if(c>=4&&p<2){title='Practice exposure visually';href='#simulator'}else if(c>=4&&p>=2&&done<3){title='Try a real practice challenge';href='#practice'}else if(c>=4&&p>=2&&done>=3){title='Shoot and review a real photo';href='#shoot'}
    const pct=$('#homePct'),ring=$('#homeRing'),next=$('#homeNextTitle'),secondary=$('#homeContinueSecondary'),primary=$('#homeContinue');
    if(pct)pct.textContent=Math.min(100,total)+'%';if(ring)ring.style.setProperty('--pct',Math.min(100,total));if(next)next.textContent=title;if(secondary)secondary.href=href;if(primary)primary.href=href;
    const hc=$('#homeControls'),hs=$('#homeSimulator'),hp=$('#homePractice');if(hc)hc.textContent=`${c} / 8 explored`;if(hs)hs.textContent=`${p} / 3 tried`;if(hp)hp.textContent=`${done} / ${practiceTotal} complete`;

    const recent=window.T7Store?.get('recentPhoto',null)||readJson('canonRecentPhoto',null),box=$('.native-latest .recent-photo-empty');
    if(recent&&box){const date=new Date(recent.time||Date.now()).toLocaleDateString([], {month:'short',day:'numeric'});box.className='recent-photo-card-live';box.innerHTML=`${recent.thumb?`<img src="${recent.thumb}" alt="Latest reviewed photo">`:''}<div class="recent-photo-meta"><b>${(recent.goal||'Photo').replace(/^./,x=>x.toUpperCase())}</b><small>${recent.settings||'Canon T7 review'}</small><small>${date}</small></div><div class="recent-score">${recent.status||recent.diagnosis||recent.score||'Reviewed'}</div>`}
  }

  window.T7Home={refresh:restoreHomeState};restoreHomeState();window.addEventListener('storage',restoreHomeState);window.addEventListener('t7-history-updated',restoreHomeState);window.addEventListener('t7-store-change',e=>{if(e.detail?.name==='recentPhoto')restoreHomeState()});
})();