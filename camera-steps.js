(()=>{
  const $=s=>document.querySelector(s);
  const targets=[
    ['#setupMode','mode'],['#setupLens','lens'],['#setupExposure','exposure'],['#setupIso','iso'],['#setupFocus','af'],['#setupDrive','drive'],
    ['#rv2Mode','mode'],['#rv2Lens','lens'],['#rv2Exposure','exposure'],['#rv2Iso','iso']
  ];

  const backdrop=document.createElement('div');
  backdrop.className='t7-guide-backdrop';backdrop.setAttribute('aria-hidden','true');
  backdrop.innerHTML=`<section class="t7-guide-sheet" role="dialog" aria-modal="true" aria-labelledby="t7GuideTitle"><div class="t7-guide-handle"></div><div class="t7-guide-top"><div><span class="t7-guide-kicker">ON YOUR REBEL T7</span><h2 id="t7GuideTitle">How to set it</h2><span class="t7-guide-value" id="t7GuideValue">—</span></div><button class="t7-guide-close" aria-label="Close instructions">×</button></div><div class="t7-guide-steps" id="t7GuideSteps"></div><div class="t7-guide-note"><small>BEGINNER TIP</small><p id="t7GuideNote">Change one setting at a time and take a test photo.</p></div><a class="t7-guide-open-camera" href="#camera">Show me the camera controls</a></section>`;
  document.body.appendChild(backdrop);
  const sheet=backdrop.querySelector('.t7-guide-sheet'),close=backdrop.querySelector('.t7-guide-close');

  function step(title,body){return{title,body}}
  function guide(type,value){
    const v=String(value||'').trim();
    if(type==='mode'){
      const mode=/\bTv\b/i.test(v)?'Tv':/\bM\b/i.test(v)?'M':/\bAv\b/i.test(v)?'Av':v;
      const last=mode==='Av'?'In Av, the Main Dial changes the f-number.':mode==='Tv'?'In Tv, the Main Dial changes shutter speed.':mode==='M'?'In M, the Main Dial changes shutter speed; hold the Av +/- button while turning the dial to change aperture.':'Half-press the shutter to return to shooting.';
      return{title:`Set ${mode} mode`,steps:[step('Find the Mode Dial','It is the large dial on top of the camera.'),step(`Turn it to ${mode}`,`Line ${mode} up with the white index mark beside the dial.`),step('Wake the camera',`Half-press the shutter button. ${last}`)],note:'Av is the easiest mode for portraits and everyday still subjects. Tv is better when motion and shutter speed matter.'};
    }
    if(type==='lens')return{title:'Set the focal length',steps:[step('Look at the zoom ring','Use the large ring on your 18–55mm lens with the 18, 24, 35 and 55 markings.'),step(`Rotate toward ${v||'the recommended range'}`,`Turn the zoom ring until the white index line is near the recommended focal length. It does not have to be mathematically exact.`),step('Keep the lens switches ready','For normal handheld learning, keep AF selected and Image Stabilizer ON.')],note:'18mm is wide. 35mm feels natural. 50–55mm is usually the better starting range for portraits and tighter product/car photos.'};
    if(type==='iso')return{title:'Set ISO',steps:[step('Press ISO','Press the ISO button on the rear cross-key controls.'),step(`Choose ${v||'the recommended ISO'}`,`Use the cross keys or Main Dial to highlight the ISO value. If the recommendation says Auto, select AUTO.`),step('Confirm','Press SET, then half-press the shutter to return to shooting.')],note:'Use the lowest ISO that still lets you keep the shutter speed you need. A sharp higher-ISO photo is usually better than a blurry low-ISO photo.'};
    if(type==='af'){
      const name=/servo/i.test(v)?'AI Servo AF':/one[- ]?shot/i.test(v)?'One-Shot AF':v||'the recommended AF mode';
      return{title:`Set ${name}`,steps:[step('Press AF','Press the AF button on the rear cross-key controls.'),step(`Select ${name}`,`Use the left/right cross keys to choose the autofocus operation shown in the recommendation.`),step('Press SET','Confirm the choice. For a still portrait, use One-Shot. For a moving subject, use AI Servo.')],note:'For precise still subjects, also select one AF point and place it on the most important detail—usually the nearest eye in a portrait.'};
    }
    if(type==='drive'){
      const name=/continuous/i.test(v)?'Continuous shooting':/2[- ]?sec/i.test(v)?'2-second self-timer':'Single shooting';
      return{title:`Set ${name}`,steps:[step('Press Drive / Self-timer','Use the Drive/Self-timer button on the rear cross-key controls.'),step(`Choose ${name}`,`Use the cross keys to highlight the matching drive icon.`),step('Press SET','Confirm the drive mode, then half-press the shutter to return to shooting.')],note:name.includes('Continuous')?'For action, start tracking the subject before you press fully. The T7 is about 3 fps, so timing still matters.':name.includes('timer')?'The 2-second timer is useful on a tripod because it reduces camera shake from pressing the shutter.':'Single shooting is the simplest choice for portraits, products and landscapes.'};
    }
    if(type==='exposure'){
      const hasShutter=/1\s*\/\s*\d+|\d+(?:\.\d+)?\s*s\b/i.test(v),hasAperture=/f\s*\/?\s*\d|widest/i.test(v);
      if(hasShutter&&hasAperture)return{title:'Set manual exposure',steps:[step('Turn the Mode Dial to M','Manual mode lets you set both shutter speed and aperture.'),step(`Set the shutter: ${v}`,`Turn the Main Dial beside the shutter button until the shutter part of the recommendation is shown.`),step('Set the aperture','Hold the Av +/- button on the back of the camera while turning the Main Dial until the recommended f-number is shown.')],note:'For tripod night shots, keep ISO low and use the 2-second self-timer after focusing.'};
      if(hasShutter)return{title:`Set ${v}`,steps:[step('Turn the Mode Dial to Tv','Tv is Shutter-priority mode.'),step('Turn the Main Dial',`Rotate the Main Dial beside the shutter button until the display shows ${v}.`),step('Check ISO','If the image is too dark at a fast shutter speed, raise ISO rather than slowing the shutter if freezing movement is the priority.')],note:'1/1000 freezes much more movement than 1/125. Faster shutter speeds also let in less light.'};
      return{title:`Set ${v||'the aperture'}`,steps:[step('Turn the Mode Dial to Av','Av is Aperture-priority mode.'),step('Turn the Main Dial',`Rotate the Main Dial beside the shutter button until you reach ${v||'the recommended f-number'}.`),step('Watch the shutter speed','Half-press the shutter and check the shutter speed the camera chooses. If it becomes too slow for handheld shooting, raise ISO or add light.')],note:'With the 18–55mm kit lens, the widest available aperture changes as you zoom. At 55mm, f/5.6 is the widest aperture.'};
    }
    return{title:'Set this on your T7',steps:[step('Open the matching control','Use the camera button or dial for this setting.'),step('Choose the recommended value',v||'Use the value shown in T7 Studio.'),step('Take a test photo','Check focus and exposure, then adjust only if the result needs it.')],note:'The goal is a strong starting point, not a perfect number before you take the first photo.'};
  }

  function open(type,value){
    const g=guide(type,value);$('#t7GuideTitle').textContent=g.title;$('#t7GuideValue').textContent=value||'Recommended setting';$('#t7GuideSteps').innerHTML=g.steps.map((s,i)=>`<div class="t7-guide-step"><i>${i+1}</i><div><b>${s.title}</b><p>${s.body}</p></div></div>`).join('');$('#t7GuideNote').textContent=g.note;
    backdrop.classList.add('show');backdrop.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>close.focus(),20);
  }
  function hide(){backdrop.classList.remove('show');backdrop.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  close.onclick=hide;backdrop.addEventListener('click',e=>{if(e.target===backdrop)hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('show'))hide()});
  backdrop.querySelector('.t7-guide-open-camera').addEventListener('click',hide);

  function decorate(selector,type){
    const valueEl=$(selector);if(!valueEl)return;const target=valueEl.closest('.setup-v2-mode,.setup-v2-main>div,.setup-v2-strip>div,.rv2-setting-row>div')||valueEl.parentElement;if(!target||target.dataset.t7Guide)return;
    target.dataset.t7Guide=type;target.classList.add('t7-help-target');target.setAttribute('role','button');target.setAttribute('tabindex','0');target.setAttribute('aria-label',`How to set ${type} on the Canon Rebel T7`);
    const activate=()=>open(type,valueEl.textContent.trim());target.addEventListener('click',activate);target.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});
  }
  targets.forEach(([selector,type])=>decorate(selector,type));
})();