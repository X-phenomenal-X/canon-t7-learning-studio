(()=>{
  const $=s=>document.querySelector(s);
  const shoot=$('#shoot');if(!shoot)return;
  const step3=shoot.querySelector('.shoot-screen[data-screen="3"]'),step4=shoot.querySelector('.shoot-screen[data-screen="4"]');
  if(!step3||!step4||step3.querySelector('.sf-viewfinder-shell'))return;

  const preview=step3.querySelector('#framePreview'),guides=step3.querySelector('#frameGuides');
  if(preview){
    const shell=document.createElement('div');shell.className='sf-viewfinder-shell';preview.parentNode.insertBefore(shell,preview);shell.appendChild(preview);
    const top=document.createElement('div');top.className='sf-vf-top';top.innerHTML='<span class="sf-vf-chip accent" id="sfVfSubject">SUBJECT</span><span class="sf-vf-chip" id="sfVfSetup">T7 READY</span>';
    const bottom=document.createElement('div');bottom.className='sf-vf-bottom';bottom.innerHTML='<span class="sf-vf-chip" id="sfVfLens">18–55MM</span><span class="sf-vf-chip" id="sfVfExposure">CHECK EDGES</span>';
    const focus=document.createElement('div');focus.className='sf-vf-focus-label';focus.id='sfVfFocus';focus.textContent='Place AF point here';
    shell.append(top,bottom,focus);
  }

  const coach=document.createElement('div');coach.className='sf-frame-coach';coach.innerHTML='<i>1</i><div><b id="sfFrameTitle">Set your position first.</b><span id="sfFrameText">Use the first composition guide, then scan the frame once.</span></div><button type="button" id="sfNextGuide">Next tip</button>';
  if(guides)guides.after(coach);

  const sequence=document.createElement('section');sequence.className='sf-capture-sequence';sequence.innerHTML=`<div class="sf-capture-head"><div><small>CONTROLLED 3-SHOT SET</small><b>Make each frame teach you something.</b></div><span class="sf-capture-count" id="sfShotCount">0 / 3</span></div><div class="sf-shot-list" id="sfShotList"></div><div class="sf-capture-note"><i></i><span id="sfCaptureNote">Keep the camera setup the same. Change only the thing named in each shot.</span></div>`;
  const actions=step4.querySelector('.capture-v2-actions');if(actions)actions.parentNode.insertBefore(sequence,actions);

  const plans={
    portrait:[['Baseline','Take the clean composition exactly as framed.'],['Distance','Step back or forward slightly—do not change zoom yet.'],['Angle','Move the camera a little higher or lower and compare the face/background.']],
    product:[['Baseline','Take the clean product frame with your chosen focus detail.'],['Distance','Move the camera slightly farther back and reframe.'],['Angle','Try a subtle three-quarter or lower angle while keeping the product shape clean.']],
    landscape:[['Baseline','Take the balanced wide frame with a level horizon.'],['Foreground','Move position to include a stronger foreground element.'],['Simplify','Take one cleaner frame with fewer edge distractions.']],
    action:[['Track','Start tracking early and take the first controlled burst.'],['Timing','Wait a fraction longer and capture the peak moment.'],['Framing','Shoot slightly wider so you keep space in front of the subject.']],
    indoor:[['Baseline','Take the shot with the current light and setup.'],['Light','Move closer to the best available light without changing exposure yet.'],['Position','Change your angle to simplify the background and reflections.']],
    night:[['Baseline','Take the stable long-exposure frame.'],['Composition','Shift position to strengthen leading lights or lines.'],['Protect lights','Try a cleaner frame that avoids large blown-out signs or lamps.']]
  };
  const scenePlans={
    tvDark:[['Baseline','Take the TV frame around the recommended shutter speed.'],['Screen test','Try one nearby shutter speed if the screen shows bands or looks too bright.'],['Room balance','Keep the screen protected and adjust position or TV brightness for more room detail.']],
    brightWindow:[['Baseline','Take the portrait with the face turned toward the window.'],['Position','Move the subject or camera to reduce bright empty window area.'],['Expression','Keep the setup and capture a stronger expression with the same focus point.']],
    blackCarSun:[['Baseline','Take the protected-highlight three-quarter frame.'],['Reflection','Shift position until the body reflections look cleaner.'],['Angle','Try a lower angle while keeping bright reflections under control.']],
    indoorProduct:[['Baseline','Take the clean product frame near soft light.'],['Distance','Step back and use the long end of the lens for cleaner perspective.'],['Light angle','Rotate the product or your position slightly to improve reflections.']],
    movingCar:[['Track','Track early and capture one controlled burst.'],['Timing','Take the next burst later in the pass.'],['Lead room','Shoot slightly wider with more space in front of the car.']],
    nightHandheld:[['Baseline','Take the handheld frame at the recommended shutter.'],['Brace','Brace against a wall or tuck your elbows and repeat.'],['Light','Move closer to useful light while keeping the shutter protected.']]
  };

  function state(){
    const scene=window.T7Store?.get?.('shootScene',null)||(()=>{try{return localStorage.getItem('canonT7LastScene')}catch{return null}})();
    const subject=window.T7Store?.get?.('shootSubject',null)||(()=>{try{return localStorage.getItem('canonT7LastShootSubject')}catch{return null}})()||'portrait';
    return{scene,subject};
  }
  function setupText(){
    const mode=$('#setupMode')?.textContent?.trim()||'—',lens=$('#setupLens')?.textContent?.trim()||'—',exp=$('#setupExposure')?.textContent?.trim()||'—';
    return{mode,lens,exp};
  }
  function focusLabel(subject,scene){
    if(scene==='tvDark')return'Screen text / edge';if(scene==='blackCarSun')return'Badge / body edge';if(subject==='portrait')return'Nearest eye';if(subject==='product')return'Logo / key detail';if(subject==='landscape')return'Mid-distance detail';if(subject==='action')return'Moving subject';if(subject==='night')return'Contrasty edge';return'Important detail';
  }
  function renderViewfinder(){
    const {scene,subject}=state(),s=setupText();
    const name=scene?window.T7Engine?.scenes?.[scene]?.name:window.T7Engine?.profiles?.[subject]?.name||subject;
    const subj=$('#sfVfSubject'),set=$('#sfVfSetup'),lens=$('#sfVfLens'),exp=$('#sfVfExposure'),focus=$('#sfVfFocus');
    if(subj)subj.textContent=name||'SUBJECT';if(set)set.textContent=s.mode==='—'?'T7 READY':`${s.mode} MODE`;if(lens)lens.textContent=s.lens;if(exp)exp.textContent=s.exp;if(focus)focus.textContent=focusLabel(subject,scene);
  }

  let guideIndex=0;
  function renderGuide(){
    const rows=guides?[...guides.querySelectorAll('.guide-row-v2')]:[];if(!rows.length)return;
    guideIndex=Math.max(0,Math.min(rows.length-1,guideIndex));rows.forEach((r,i)=>r.classList.toggle('sf-frame-guide-active',i===guideIndex));
    const row=rows[guideIndex],title=row.querySelector('b')?.textContent||'Frame carefully',text=row.querySelector('span')?.textContent||'Take one deliberate look before shooting.';
    $('#sfFrameTitle').textContent=title;$('#sfFrameText').textContent=text;coach.querySelector('i').textContent=String(guideIndex+1);$('#sfNextGuide').textContent=guideIndex===rows.length-1?'Start over':'Next tip';
  }
  $('#sfNextGuide')?.addEventListener('click',()=>{const count=guides?.querySelectorAll('.guide-row-v2').length||1;guideIndex=(guideIndex+1)%count;renderGuide()});

  let done=[false,false,false];
  function renderSequence(){
    const {scene,subject}=state(),plan=(scene&&scenePlans[scene])||plans[subject]||plans.portrait,list=$('#sfShotList');if(!list)return;
    list.innerHTML=plan.map((x,i)=>`<button type="button" class="sf-shot-card ${done[i]?'done':(!done[i]&&done.slice(0,i).every(Boolean)?'current':'')}" data-shot-index="${i}"><i>${done[i]?'✓':i+1}</i><div><b>${x[0]}</b><span>${x[1]}</span></div><em>${done[i]?'✓':'○'}</em></button>`).join('');
    list.querySelectorAll('[data-shot-index]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.shotIndex);done[i]=!done[i];renderSequence()});
    const count=done.filter(Boolean).length;$('#sfShotCount').textContent=`${count} / 3`;sequence.classList.toggle('complete',count===3);$('#sfCaptureNote').textContent=count===3?'Nice. Pick the strongest frame—not simply the brightest one—and send that to Review.':count===0?'Keep the camera setup the same. Change only the thing named in each shot.':`${count} captured. Keep the setup steady and make the next variation deliberate.`;
    const review=step4.querySelector('#reviewShot');if(review)review.textContent=count===3?'Review strongest photo':'Review my photo';
  }

  const observer=new MutationObserver(()=>{renderViewfinder();renderGuide()});
  ['#setupMode','#setupLens','#setupExposure','#frameGuides'].forEach(s=>{const el=$(s);if(el)observer.observe(el,{childList:true,subtree:true,characterData:true})});
  window.addEventListener('t7-store-change',e=>{if(['shootSubject','shootScene'].includes(e.detail?.name)){done=[false,false,false];renderViewfinder();renderSequence();guideIndex=0;renderGuide()}});
  window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='shoot'){renderViewfinder();renderGuide();renderSequence()}});
  renderViewfinder();renderGuide();renderSequence();
})();
