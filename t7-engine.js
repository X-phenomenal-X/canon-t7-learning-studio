(()=>{
  const camera={
    name:'Canon EOS Rebel T7',
    lens:'EF-S 18–55mm f/3.5–5.6 IS II',
    sensor:'APS-C',
    afPoints:9,
    burstFps:3,
    isoRange:'100–6400'
  };

  const profiles={
    portrait:{name:'Portrait',sub:'People + natural background blur',mode:'Av',lens:'50–55mm',exposure:'f/5.6',iso:'100–400',focus:'One-Shot • single AF point on nearest eye',afMode:'One-Shot AF',focusPoint:'Single AF point',drive:'Single',tip:'Step back and use 50–55mm. Put one AF point on the nearest eye and move the subject farther from the background.',frame:['Shoot around eye level','Place the nearest eye near an upper-third point','Keep distracting objects away from the head and frame edges'],check:['Lens set near 55mm','Single AF point is placed on the nearest eye','Shutter speed is around 1/125 sec or faster']},
    product:{name:'Product',sub:'Tech, objects, clean detail',mode:'Av',lens:'35–55mm',exposure:'f/5.6–f/8',iso:'100–400',focus:'One-Shot • precise single AF point',afMode:'One-Shot AF',focusPoint:'Single AF point',drive:'Single / 2-sec timer when supported',tip:'Use soft side window light, clean the product, and place one AF point on the most important detail.',frame:['Use an angle that clearly shows the product shape','Leave intentional space around the object','Focus on the logo, texture, or most important detail'],check:['Product and background are clean','Soft light is hitting the subject','Important detail is sharp']},
    landscape:{name:'Landscape',sub:'Scenery, architecture, wide views',mode:'Av',lens:'18–24mm',exposure:'f/8',iso:'100',focus:'One-Shot • single AF point on a mid-distance detail',afMode:'One-Shot AF',focusPoint:'Single AF point',drive:'Single',tip:'Keep the horizon straight. Use 18–24mm for the wider view and include foreground depth when possible.',frame:['Keep the horizon level','Use foreground, middle ground, and background','Check the edges for cut-off objects or distractions'],check:['ISO is low','Horizon is straight','Camera is steady before pressing the shutter']},
    action:{name:'Action',sub:'Sports, pets, cars, movement',mode:'Tv',lens:'35–55mm',exposure:'1/500–1/1000',iso:'Auto / 800–3200 as needed',focus:'AI Servo • selected AF point',afMode:'AI Servo AF',focusPoint:'Selected AF point',drive:'Continuous (~3 fps)',tip:'Start around 1/500 sec and move toward 1/1000 for faster action. Track the subject before pressing the shutter; the T7 is about 3 fps, so timing matters.',frame:['Leave space in front of the moving subject','Track movement before pressing the shutter','Use a slightly wider frame until timing improves'],check:['Shutter is at least 1/500 sec','AI Servo is active','You are following the subject before the shot']},
    indoor:{name:'Indoor',sub:'People and everyday low-light scenes',mode:'Av',lens:'24–55mm',exposure:'widest available aperture',iso:'800–1600',focus:'One-Shot for still subjects • AI Servo if moving',afMode:'One-Shot / AI Servo',focusPoint:'Single AF point',drive:'Single',tip:'Move toward a window before raising ISO further. Keep an eye on shutter speed; for people, aim around 1/125 sec or faster when possible.',frame:['Turn the subject toward the brightest soft light','Avoid mixed lighting when possible','Keep the background simpler than the subject'],check:['Subject is near useful light','Shutter speed is fast enough for handheld use','Focus is confirmed before pressing fully']},
    night:{name:'Night / Tripod',sub:'City lights, landscapes, long exposures',mode:'M',lens:'18–35mm',exposure:'f/8 • start 1–2s',iso:'100',focus:'One-Shot then lock/manual if needed',afMode:'One-Shot AF',focusPoint:'Single AF point',drive:'2-sec timer',tip:'Use a tripod or stable surface, ISO 100, and the 2-second timer. Focus first, then avoid touching the camera during the exposure.',frame:['Use lights or roads as leading lines','Protect bright signs and lamps from blowing out','Keep the composition simple and intentional'],check:['Camera is stable','ISO is 100','2-second timer is enabled']}
  };

  const scenes={
    tvDark:{name:'TV / screen in dark room',subject:'indoor',mode:'M',lens:'24–35mm',exposure:'f/4–f/5.6 • 1/60',iso:'400–800',afMode:'One-Shot AF',focusPoint:'Single AF point on screen text/edge',drive:'Single / 2-sec timer if supported',tip:'Expose for the screen first. Keep flash off. If the screen is much brighter than the room, lower the TV brightness before trying to brighten the room with ISO.',frame:['Keep the camera roughly level with the TV','Let the screen be the brightest object without turning white','Remove bright reflections and distracting foreground clutter'],check:['Flash is OFF','Focus point is on sharp screen text or an edge','Take one test frame before changing anything'],fixes:{tooBright:'Keep ISO where it is and try a faster shutter such as 1/80–1/125. If you want more room detail, reduce TV brightness instead of overexposing the screen.',tooDark:'Raise ISO one step first, for example 400 → 800. Avoid slowing much below 1/60 handheld.',blurry:'Use 1/80–1/125 and raise ISO to compensate, or place the camera on a stable surface with the 2-sec timer.',banding:'Try 1/60 first. Electronic displays can show dark bands at some shutter speeds; test nearby shutter speeds until the screen looks even.'}},
    brightWindow:{name:'Person near a bright window',subject:'portrait',mode:'Av',lens:'50–55mm',exposure:'f/5.6 • watch 1/125+',iso:'Auto / 200–800',afMode:'One-Shot AF',focusPoint:'Single AF point on nearest eye',drive:'Single',tip:'Turn the person toward the window so it becomes soft side/front light instead of a bright background. This usually fixes the scene better than pushing exposure compensation.',frame:['Put the window to one side of the face when possible','Keep the nearest eye sharp','Recompose to reduce unnecessary bright window area'],check:['Face is brighter than the background clutter','Nearest eye has the AF point','Shutter is around 1/125 or faster'],fixes:{tooBright:'Reduce exposure compensation by about 1/3–2/3 stop or reframe to include less bright window.',tooDark:'Turn the face toward the window before raising ISO. If needed, add +1/3 to +2/3 EV.',blurry:'Raise ISO until the camera can keep roughly 1/125–1/250.'}},
    blackCarSun:{name:'Dark / black car in bright sun',subject:'product',mode:'Av',lens:'35–55mm',exposure:'f/5.6–f/8 • −1/3 to −2/3 EV',iso:'100',afMode:'One-Shot AF',focusPoint:'Single AF point on badge/light/body edge',drive:'Single',tip:'Bright reflections on dark paint clip easily. Protect them with slight negative exposure and, when possible, move the car into shade or shoot closer to golden hour.',frame:['Use a low or three-quarter angle for shape','Watch reflections across the body panels','Keep other vehicles and poles from merging into the car'],check:['ISO 100','Important reflections still show texture','Focus is on a crisp body detail'],fixes:{tooBright:'Use more negative exposure compensation, roughly another −1/3 stop.',tooDark:'Return exposure compensation closer to 0 rather than raising ISO in bright daylight.',blurry:'Keep ISO 100–200 and make sure shutter speed stays comfortably above 1/125 handheld.'}},
    indoorProduct:{name:'Product indoors',subject:'product',mode:'Av',lens:'45–55mm',exposure:'f/5.6',iso:'400–800',afMode:'One-Shot AF',focusPoint:'Single AF point on logo/detail',drive:'Single / 2-sec timer if supported',tip:'Move the product near a window or soft lamp and move the background farther away. Good light matters more than aggressive editing.',frame:['Keep the camera level with the important product face','Give the background some distance for separation','Check edges and reflections before shooting'],check:['Important logo/detail is sharp','Background is not touching the subject visually','Shutter is roughly 1/100 or faster handheld'],fixes:{tooBright:'Lower ISO or move the light farther away.',tooDark:'Move closer to the light first, then raise ISO.',blurry:'Use 1/125 or faster handheld, or use a stable surface plus the 2-sec timer.'}},
    movingCar:{name:'Moving car / street action',subject:'action',mode:'Tv',lens:'35–55mm',exposure:'1/1000',iso:'Auto / 800–3200 as needed',afMode:'AI Servo AF',focusPoint:'Selected AF point',drive:'Continuous (~3 fps)',tip:'Track the car before pressing fully. Leave room in front of it and prioritize shutter speed over low ISO.',frame:['Leave space in front of the moving car','Pan smoothly before and through the shot','Start slightly wider until timing improves'],check:['1/1000 sec selected','AI Servo active','Continuous drive active'],fixes:{tooBright:'Keep 1/1000 and lower ISO if it is not already Auto/low.',tooDark:'Keep the fast shutter and raise ISO rather than sacrificing motion freezing.',blurry:'Confirm AI Servo, track before shooting, and keep 1/1000 or faster if light allows.'}},
    nightHandheld:{name:'Night handheld — no tripod',subject:'indoor',mode:'M',lens:'18–35mm',exposure:'widest available • 1/60',iso:'1600–3200',afMode:'One-Shot AF',focusPoint:'Single AF point on a contrasty detail',drive:'Single',tip:'At night handheld, protect shutter speed first. Use the widest aperture and accept higher ISO rather than making a blurry low-ISO photo.',frame:['Brace your elbows against your body','Use nearby light as part of the composition','Avoid large empty black areas unless intentional'],check:['Stabilizer ON','Shutter around 1/60 or faster','Focus point is on a contrasty edge'],fixes:{tooBright:'Lower ISO first.',tooDark:'Raise ISO before slowing below 1/60 handheld.',blurry:'Move to 1/80–1/125 and raise ISO if necessary.'}}
  };

  const clone=x=>JSON.parse(JSON.stringify(x));

  function recommend(subject='portrait',context={}){
    const base=clone(profiles[subject]||profiles.portrait);
    const light=context.light||'normal';
    const motion=context.motion||((subject==='action')?'fast':'still');
    const support=context.support||((subject==='night')?'tripod':'handheld');

    if(motion==='fast'){
      base.mode='Tv';base.exposure='1/1000';base.afMode='AI Servo AF';base.focus='AI Servo • selected AF point';base.drive='Continuous (~3 fps)';
      base.iso=light==='bright'?'100–400':'Auto / 800–3200 as needed';
      base.tip='Freeze the action first. Use 1/1000 sec, AI Servo, and start tracking before the moment happens.';
    }else if(motion==='slow'&&subject!=='night'){
      base.mode='Tv';base.exposure='1/250';base.afMode='AI Servo AF';base.focus='AI Servo • selected AF point';base.drive='Continuous (~3 fps)';
    }

    if(light==='bright'){
      if(!String(base.iso).includes('100'))base.iso='100–400';
    }else if(light==='indoor'){
      if(support==='tripod'){base.iso='100–400';}
      else if(subject!=='action')base.iso='800–1600';
    }else if(light==='dark'||light==='night'){
      if(support==='tripod')base.iso='100';
      else if(subject!=='action')base.iso='1600–3200';
    }

    if(support==='tripod'){
      base.drive='2-sec timer';
      if(subject==='landscape'||subject==='night')base.iso='100';
    }

    if(subject==='portrait'&&context.background==='near'){
      base.tip+=' Move the subject farther from the background; that will create more blur than changing settings alone.';
    }

    base.camera=camera;
    base.context={light,motion,support};
    base.why=`${base.mode} prioritizes the setting that matters most for this situation. ${base.lens} uses the useful range of your 18–55mm kit lens without adding unnecessary complexity.`;
    return base;
  }

  function recommendScene(sceneKey,context={}){
    const scene=scenes[sceneKey];if(!scene)return null;
    const base=recommend(scene.subject,context),out={...base,...clone(scene)};
    out.name=scene.name;out.sceneKey=sceneKey;out.scene=true;out.camera=camera;out.why=`This scene has a specific exposure problem, so the setup prioritizes that problem instead of using a generic ${profiles[scene.subject]?.name||'shooting'} preset.`;
    return out;
  }

  function sceneFix(sceneKey,problem){return scenes[sceneKey]?.fixes?.[problem]||''}

  function reviewNext(goal='general',metrics={}){
    const key=profiles[goal]?goal:(goal==='general'?'portrait':'portrait');
    let context={light:'normal',motion:key==='action'?'fast':'still',support:key==='night'?'tripod':'handheld'};
    if(metrics.mean<100&&key!=='night')context.light='indoor';
    const r=recommend(key,context);
    if(metrics.detailScore!=null&&metrics.detailScore<60&&key!=='night'){
      if(key==='action'){r.mode='Tv';r.exposure='1/1000';r.afMode='AI Servo AF';r.drive='Continuous (~3 fps)';}
      else r.exposure=(r.exposure.includes('1/')?r.exposure:r.exposure+' • keep 1/250+ if possible');
      r.tip='The previous photo looked soft. Prioritize focus and a faster shutter on the next attempt. '+r.tip;
    }
    return r;
  }

  function modeLabel(mode){return mode==='Av'?'Aperture priority':mode==='Tv'?'Shutter priority':mode==='M'?'Manual exposure':mode;}

  window.T7Engine={camera,profiles,scenes,recommend,recommendScene,sceneFix,reviewNext,modeLabel,version:'1.1.0'};
  window.dispatchEvent(new CustomEvent('t7-engine-ready',{detail:window.T7Engine}));
})();