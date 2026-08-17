(()=>{
  const $=s=>document.querySelector(s);
  const review=$('.review-flow'),scoreEl=$('#reviewScore'),file=$('#fileInput');
  if(!review||!scoreEl||!file)return;

  const KEY='canonReshootSessionV1';
  let session=window.T7Store?.get('reshoot',null)||null,current=null,lastObserved='';
  if(!session)try{session=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}

  const box=document.createElement('section');
  box.className='reshoot-flow';
  box.innerHTML='<div class="reshoot-head"><div><span class="reshoot-kicker">RESHOOT LOOP</span><h4>Improve one thing, then try again</h4><p>Use your first photo as the baseline. Change one important thing and compare the second attempt.</p></div><span id="reshootState" class="pill">Waiting for review</span></div><div id="reshootBody"><div class="reshoot-focus"><i>01</i><div><b>Review a photo first</b><span>Your biggest technical opportunity will appear here after the photo is analyzed.</span></div></div></div>';
  const results=$('#reviewResults');(results||review).appendChild(box);

  const body=$('#reshootBody'),state=$('#reshootState');
  const num=id=>{const el=$(id);return el?Number(String(el.textContent).replace(/[^0-9.-]/g,''))||0:0};
  const readRecent=()=>window.T7Store?.get('recentPhoto',null)||(()=>{try{return JSON.parse(localStorage.getItem('canonRecentPhoto')||'null')}catch{return null}})();
  const goal=()=>$('#reviewGoal')?.value||'general',cleanGoal=g=>g==='general'?'portrait':g;

  function snapshot(){const recent=readRecent();return{score:num('#reviewScore'),exposure:num('#reviewExposure'),detail:num('#reviewDetail'),contrast:num('#reviewContrast'),clipping:num('#reviewClip'),goal:goal(),settings:recent?.settings||'',thumb:recent?.thumb||'',time:recent?.time||Date.now()}}
  function focusFor(a){
    const values={detail:a.detail,exposure:a.exposure,contrast:a.contrast,clipping:a.clipping},key=Object.keys(values).sort((x,y)=>values[x]-values[y])[0],subject=cleanGoal(a.goal),engine=window.T7Engine?.recommend(subject)||null;
    if(key==='detail')return{key,title:'Make the next shot sharper',text:subject==='action'?'Use AI Servo, track the subject, and push toward 1/1000 sec.':'Use one AF point on the important detail and keep shutter speed around 1/250 sec or faster when handheld.',setting:engine?`${engine.mode} • ${engine.lens} • ${subject==='action'?'1/1000':'1/250+ if possible'}`:'Prioritize focus + faster shutter'};
    if(key==='exposure')return{key,title:'Fix exposure before editing',text:'Watch the meter and histogram. If the image was dark, raise ISO one step or add light; if it was bright, protect the highlights.',setting:engine?`${engine.mode} • ${engine.lens} • ${engine.iso}`:'Adjust exposure by about 1/3–2/3 stop'};
    if(key==='contrast')return{key,title:'Improve the light, not the slider',text:'Move the subject toward side light, window light, or a clearer light direction. Better light usually creates stronger depth than heavy contrast editing.',setting:engine?`${engine.mode} • ${engine.lens}`:'Change light direction first'};
    return{key,title:'Protect important highlights and shadows',text:'Reframe or reduce exposure slightly if bright areas are clipping. If dark areas matter, add fill light instead of trying to recover everything later.',setting:engine?`${engine.mode} • ${engine.lens} • ${engine.exposure}`:'Protect the brightest important area'};
  }
  function persist(){if(window.T7Store)window.T7Store.set('reshoot',session);else try{localStorage.setItem(KEY,JSON.stringify(session))}catch{}}
  function clearSession(){session=null;if(window.T7Store)window.T7Store.remove('reshoot');else try{localStorage.removeItem(KEY)}catch{}render(current)}
  function delta(v){const cls=v>2?'delta-up':v<-2?'delta-down':'delta-flat';return`<b class="${cls}">${v>0?'+':''}${v}</b>`}

  function render(cur){
    current=cur||current;if(!current){state.className='pill';state.textContent='Waiting for review';return}
    if(session?.active&&session.attempt1){state.className='reshoot-active';state.textContent='Reshoot active';const f=session.focus||focusFor(session.attempt1);body.innerHTML=`<div class="reshoot-focus"><i>↻</i><div><b>${f.title}</b><span>${f.text}</span></div></div><div class="reshoot-actions"><a class="button primary" href="#shoot" id="resumeReshoot">Open guided shoot</a><button class="button" id="cancelReshoot">Cancel challenge</button></div>`;$('#cancelReshoot').onclick=clearSession;$('#resumeReshoot').onclick=()=>prepareShoot(session.attempt1.goal);return}
    if(session?.attempt1&&session?.attempt2){renderCompare();return}
    const f=focusFor(current);state.className='pill';state.textContent='Ready to improve';body.innerHTML=`<div class="reshoot-focus"><i>01</i><div><b>${f.title}</b><span>${f.text}</span></div></div><div class="reshoot-verdict"><b>Change only this first</b><p>${f.setting}</p></div><div class="reshoot-actions"><button class="button primary" id="startReshoot">Start reshoot challenge</button><a class="button" href="#learn">Review the skill</a></div>`;$('#startReshoot').onclick=()=>start(current,f);
  }

  function start(base,focus){session={active:true,attempt1:base,focus,startedAt:Date.now()};persist();render(base);prepareShoot(base.goal)}
  function prepareShoot(g){const subject=cleanGoal(g);if(window.T7Store)window.T7Store.set('shootSubject',subject);else try{localStorage.setItem('canonT7LastShootSubject',subject)}catch{}location.hash='shoot';setTimeout(()=>{const card=document.querySelector(`.subject-card[data-subject="${subject}"]`);if(card)card.click();const next=$('#shootNext1');if(next&&!next.disabled)next.click()},260)}
  function renderCompare(){
    const a=session.attempt1,b=session.attempt2;state.className='pill';state.textContent='Comparison ready';const ds=b.score-a.score,de=b.exposure-a.exposure,dd=b.detail-a.detail,dc=b.contrast-a.contrast,dcl=b.clipping-a.clipping,improved=dd>3||de>3||dcl>3,flat=Math.abs(dd)<=2&&Math.abs(de)<=2&&Math.abs(dcl)<=2;
    const verdict=improved?'Attempt 2 improved at least one major technical signal. Keep the change that helped and move to the next weakest area.':flat?'Attempt 2 is technically very close. Keep the stronger composition and try one more controlled change.':'Attempt 2 did not improve the main technical signals. Return to the first setup and change only one variable again.';
    body.innerHTML=`<div class="reshoot-compare"><div class="attempt-card"><small>ATTEMPT 1</small><strong>${a.detail}</strong><div class="attempt-settings">Focus/detail baseline</div></div><div class="compare-arrow">→</div><div class="attempt-card"><small>ATTEMPT 2</small><strong>${b.detail}</strong><div class="attempt-settings">Focus/detail reshoot</div></div></div><div class="delta-grid"><div><small>FOCUS</small>${delta(dd)}</div><div><small>EXPOSURE</small>${delta(de)}</div><div><small>CONTRAST</small>${delta(dc)}</div><div><small>TONE</small>${delta(dcl)}</div></div><div class="reshoot-verdict"><b>${improved?'Useful improvement':flat?'Very close':'Useful miss'}</b><p>${verdict}</p></div><div class="reshoot-actions"><button class="button primary" id="reshootAgain">Try another attempt</button><button class="button" id="finishReshoot">Finish challenge</button></div>`;
    $('#finishReshoot').onclick=clearSession;$('#reshootAgain').onclick=()=>{session={active:true,attempt1:b,focus:focusFor(b),startedAt:Date.now()};persist();render(b);prepareShoot(b.goal)};
  }

  function onReview(){const text=scoreEl.textContent.trim();if(!text||text==='—'||text===lastObserved)return;lastObserved=text;setTimeout(()=>{const cur=snapshot();current=cur;if(session?.active&&session.attempt1&&cur.time>session.attempt1.time+250){session.active=false;session.attempt2=cur;persist();renderCompare()}else render(cur)},120)}

  const observer=new MutationObserver(onReview);observer.observe(scoreEl,{childList:true,characterData:true,subtree:true});if(num('#reviewScore'))onReview();if(session?.attempt1){current=session.attempt2||session.attempt1;session.active?render(current):session.attempt2?renderCompare():render(current)}
})();