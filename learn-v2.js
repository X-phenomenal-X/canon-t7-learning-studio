(()=>{
  const $=s=>document.querySelector(s);
  const learn=$('#learn'),titleEl=$('#lessonTitle'),stage=$('#lessonStage');
  if(!learn||!titleEl||!stage||learn.querySelector('.learn-v2-head'))return;

  const configs={
    'Aperture':{
      desc:'Aperture changes two things at once: how much light enters the camera and how much of the scene looks sharp.',
      demo:`<div class="lv2-demo-grid"><div class="lv2-shot lv2-ap-wide"><div class="lv2-scene"><div class="lv2-bg"></div><div class="lv2-person"></div></div><div class="lv2-shot-label"><b>f/5.6</b><small>More background blur</small></div></div><div class="lv2-shot lv2-ap-deep"><div class="lv2-scene"><div class="lv2-bg"></div><div class="lv2-person"></div></div><div class="lv2-shot-label"><b>f/11</b><small>More scene in focus</small></div></div></div>`,
      take:[['PORTRAITS','Use the lowest f-number available'],['LANDSCAPES','Start around f/8'],['REMEMBER','Lower f-number = larger opening']],
      challenge:'Put one object 3–6 ft from the background. Shoot it at 55mm and f/5.6, then try f/11 without changing your position.',
      href:'#shoot',cta:'Try on your T7',t7:'On your 18–55mm kit lens, the widest aperture changes as you zoom. At 55mm, f/5.6 is the widest available.'
    },
    'Shutter Speed':{
      desc:'Shutter speed decides how long the sensor sees the scene. Faster speeds freeze movement; slower speeds show movement.',
      demo:`<div class="lv2-demo-grid"><div class="lv2-shot lv2-motion-slow"><div class="lv2-motion-subject"></div><div class="lv2-shot-label"><b>1/30</b><small>Movement can smear</small></div></div><div class="lv2-shot lv2-motion-fast"><div class="lv2-motion-subject"></div><div class="lv2-shot-label"><b>1/1000</b><small>Movement freezes</small></div></div></div>`,
      take:[['STILL PEOPLE','Aim for 1/125+'],['MOVING PEOPLE','Start near 1/250'],['FAST ACTION','Use 1/500–1/1000']],
      challenge:'Photograph someone walking or move an object through the frame. Compare 1/30, 1/250 and 1/1000.',
      href:'#simulator',cta:'Practice shutter',t7:'For action, use Tv mode + AI Servo AF. Your T7 shoots about 3 fps, so timing the moment matters more than holding the shutter.'
    },
    'ISO':{
      desc:'ISO makes the image signal brighter when you cannot get enough light with aperture and shutter speed alone.',
      demo:`<div class="lv2-demo-grid"><div class="lv2-shot lv2-iso-low"><div class="lv2-iso-scene"></div><div class="lv2-shot-label"><b>ISO 100</b><small>Cleaner detail</small></div></div><div class="lv2-shot lv2-iso-high"><div class="lv2-iso-scene"></div><div class="lv2-shot-label"><b>ISO 3200</b><small>Brighter, more noise</small></div></div></div>`,
      take:[['OUTDOORS','Start at ISO 100'],['INDOORS','800–1600 is normal'],['PRIORITY','A sharp photo beats a blurry low-ISO photo']],
      challenge:'Keep the same framing indoors. Compare ISO 400 and ISO 1600 while keeping your shutter fast enough to avoid blur.',
      href:'#simulator',cta:'Practice ISO',t7:'Your Rebel T7 goes to ISO 6400. Use higher ISO when it protects a shutter speed you actually need.'
    },
    '18–55mm Lens':{
      desc:'Zoom is not only “closer or farther.” Focal length changes how much environment you include and how the subject feels in the frame.',
      demo:`<div class="lv2-demo-grid"><div class="lv2-shot lv2-focal-wide"><div class="lv2-focal-scene"></div><div class="lv2-focal-subject"></div><div class="lv2-shot-label"><b>18mm</b><small>More environment</small></div></div><div class="lv2-shot lv2-focal-tight"><div class="lv2-focal-scene"></div><div class="lv2-focal-subject"></div><div class="lv2-shot-label"><b>55mm</b><small>Tighter subject</small></div></div></div>`,
      take:[['18–24MM','Rooms, buildings, wide scenes'],['35MM','Natural everyday framing'],['50–55MM','Portraits, cars, product detail']],
      challenge:'Photograph the same stationary subject at 18mm, 35mm and 55mm. Keep your camera position as similar as possible.',
      href:'#shoot',cta:'Try focal lengths',t7:'For a flattering portrait or product shot, zoom toward 50–55mm and step back rather than shooting very close at 18mm.'
    },
    'Focus':{
      desc:'A technically good exposure still fails if the important detail is soft. Decide what must be sharp before pressing the shutter.',
      demo:`<div class="lv2-demo-grid"><div class="lv2-shot lv2-focus-bad"><div class="lv2-focus-scene"></div><div class="lv2-focus-target"></div><div class="lv2-shot-label"><b>Missed</b><small>Camera chose poorly</small></div></div><div class="lv2-shot"><div class="lv2-focus-scene"></div><div class="lv2-focus-target"></div><div class="lv2-focus-box"></div><div class="lv2-shot-label"><b>Single point</b><small>You choose the detail</small></div></div></div>`,
      take:[['STILL SUBJECT','Use One-Shot AF'],['PORTRAIT','Put one AF point on the nearest eye'],['SHUTTER','Half-press first, then shoot']],
      challenge:'Choose one object with clear lettering. Use one AF point, half-press until focus confirms, then take three careful shots.',
      href:'#camera',cta:'Find AF controls',t7:'Your T7 has 9 AF points. Learning to choose one point is more predictable than letting the camera decide what matters.'
    },
    'Composition':{
      desc:'Composition is mostly where you stand, what you include, and what you remove. Settings cannot fix a distracting frame.',
      demo:`<div class="lv2-demo-grid"><div class="lv2-shot"><div class="lv2-thirds"></div><div class="lv2-shot-label"><b>Thirds</b><small>Intentional placement</small></div></div><div class="lv2-shot"><div class="lv2-clean-scene"></div><div class="lv2-shot-label"><b>Clean frame</b><small>Check every edge</small></div></div></div>`,
      take:[['FIRST','Move your feet before changing settings'],['EDGES','Remove poles, clutter and cut-off objects'],['DEPTH','Use paths, lines and foreground to guide the eye']],
      challenge:'Find a path, driveway or hallway. Make one centered shot and one rule-of-thirds shot. Compare which feels more intentional.',
      href:'#shoot',cta:'Start a composition shoot',t7:'Use the viewfinder edges deliberately. Your walkway or driveway can become a strong leading line when the frame is simplified.'
    }
  };

  const head=document.createElement('div');
  head.className='learn-v2-head';
  head.innerHTML=`<div><span class="lv2-eyebrow">T7 FOUNDATIONS</span><h1>Learn by seeing it.</h1><p>One photography idea at a time. See the difference, try it on your camera, then move on.</p></div><div class="lv2-progress"><b id="lv2Progress">0 / 6</b><small>learned</small></div>`;
  learn.prepend(head);

  function currentProgress(){
    const raw=$('#learnHeaderProgress')?.textContent||'0 / 6 learned';
    const m=raw.match(/(\d+)\s*\/\s*(\d+)/);return m?`${m[1]} / ${m[2]}`:'0 / 6';
  }

  function render(){
    const title=titleEl.textContent.trim(),cfg=configs[title];if(!cfg)return;
    const kicker=$('#lessonKicker')?.textContent||'';
    stage.innerHTML=`<div class="lv2-card"><div class="lv2-hero"><div class="lv2-hero-copy"><span class="lv2-lesson-no">${kicker}</span><h2>${title}</h2><p>${cfg.desc}</p></div><div class="lv2-demo">${cfg.demo}</div></div><div class="lv2-body"><div class="lv2-takeaways">${cfg.take.map(x=>`<div class="lv2-takeaway"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div><div class="lv2-challenge"><div class="lv2-challenge-icon">✓</div><div><small>TRY IT ON YOUR CAMERA</small><b>Mini challenge</b><p>${cfg.challenge}</p></div><a href="${cfg.href}">${cfg.cta}</a></div><div class="lv2-t7"><div class="lv2-t7-mark">T7</div><div><small>YOUR CAMERA</small><b>${cfg.t7}</b></div></div></div></div>`;
    const p=$('#lv2Progress');if(p)p.textContent=currentProgress();
  }

  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;render()},0)}
  new MutationObserver(schedule).observe(titleEl,{childList:true,characterData:true,subtree:true});
  const progress=$('#learnHeaderProgress');if(progress)new MutationObserver(()=>{const p=$('#lv2Progress');if(p)p.textContent=currentProgress()}).observe(progress,{childList:true,characterData:true,subtree:true});
  schedule();
})();
