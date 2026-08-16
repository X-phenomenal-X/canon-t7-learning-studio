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

  window.T7Engine={camera,profiles,recommend,reviewNext,modeLabel,version:'1.0.0'};
  window.dispatchEvent(new CustomEvent('t7-engine-ready',{detail:window.T7Engine}));
})();