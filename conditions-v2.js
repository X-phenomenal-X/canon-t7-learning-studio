(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const section=$('#conditions'),legacyCard=section?.querySelector(':scope > .card'),input=$('#photoLocation'),searchBtn=$('#searchPhotoWeather'),locateBtn=$('#usePhotoLocation'),status=$('#photoWeatherStatus'),weatherResults=$('#weatherResults');
  if(!section||!legacyCard||!input||!searchBtn||!locateBtn||!status||!weatherResults||section.querySelector('.conditions-v2'))return;

  let selected='portrait',latest=null;
  try{const saved=localStorage.getItem('canonConditionsGoal')||localStorage.getItem('canonT7LastShootSubject');if(['portrait','product','landscape','action'].includes(saved))selected=saved}catch{}

  const shell=document.createElement('div');shell.className='conditions-v2';
  shell.innerHTML=`
    <div class="cv2-intro"><div><small>PHOTO CONDITIONS</small><h1>Should you shoot right now?</h1><p>Check the light, choose what you want to photograph, and get a practical Canon T7 starting setup.</p></div><span class="cv2-live">LIVE • FREE</span></div>
    <div class="cv2-search" id="cv2Search"></div>
    <div class="cv2-status" id="cv2Status"></div>
    <div class="cv2-goals" aria-label="Shooting goal">
      <button class="cv2-goal" data-cv2-goal="portrait">Portrait</button>
      <button class="cv2-goal" data-cv2-goal="product">Product / car</button>
      <button class="cv2-goal" data-cv2-goal="landscape">Landscape</button>
      <button class="cv2-goal" data-cv2-goal="action">Action</button>
    </div>
    <div class="cv2-empty" id="cv2Empty"><div><div class="cv2-empty-mark"></div><h2>Check the light before you head out.</h2><p>Search a city or use your location. T7 Studio will translate the weather into a shooting decision instead of dumping weather data on you.</p></div></div>
    <div class="cv2-result" id="cv2Result" hidden>
      <div class="cv2-hero">
        <div class="cv2-verdict"><span class="cv2-verdict-badge" id="cv2Badge">GOOD TO SHOOT</span><h2 id="cv2Title">Good light right now</h2><p id="cv2Reason">—</p></div>
        <div class="cv2-score" id="cv2ScoreRing" style="--cv2-score:0"><b id="cv2Score">—</b><small>LIGHT</small></div>
      </div>
      <div class="cv2-window"><div class="cv2-window-main"><small>BEST WINDOW</small><h3 id="cv2Window">—</h3><p id="cv2WindowWhy">—</p></div><div class="cv2-watch"><small>WATCH OUT FOR</small><b id="cv2Watch">—</b><p id="cv2WatchWhy">—</p></div></div>
      <div class="cv2-setup"><div class="cv2-setup-head"><b>Your T7 starting setup</b><span id="cv2GoalLabel">Portrait</span></div><div class="cv2-settings"><div class="cv2-setting"><small>MODE</small><b id="cv2Mode">—</b></div><div class="cv2-setting"><small>LENS</small><b id="cv2Lens">—</b></div><div class="cv2-setting"><small>EXPOSURE</small><b id="cv2Exposure">—</b></div><div class="cv2-setting"><small>ISO</small><b id="cv2Iso">—</b></div></div><div class="cv2-setup-tip"><i>1</i><p id="cv2Tip">—</p></div><div class="cv2-actions"><a class="primary" href="#shoot" id="cv2Shoot">Start guided shoot</a><a class="secondary" href="#learn">Learn the setting</a></div></div>
      <details class="cv2-weather-details"><summary><span>Weather details</span><small id="cv2WeatherSummary">—</small></summary><div id="cv2LegacyWeather"></div></details>
    </div>`;
  legacyCard.before(shell);

  const searchHost=$('#cv2Search'),legacySearch=legacyCard.querySelector('.search-row'),legacyButtons=legacyCard.querySelector('.button-row');
  input.placeholder='Search city';searchBtn.textContent='Check';locateBtn.textContent='Use my location';searchBtn.classList.add('cv2-check');locateBtn.classList.add('cv2-locate');
  searchHost.append(input,searchBtn,locateBtn);
  $('#cv2Status').append(status);
  $('#cv2LegacyWeather').append(weatherResults);
  legacyCard.style.display='none';

  function fmt(iso){if(!iso)return'—';const d=new Date(iso);return isNaN(d)?String(iso).split('T')[1]||iso:d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}
  function shiftDate(iso,min){if(!iso)return null;const d=new Date(iso);if(isNaN(d))return null;d.setMinutes(d.getMinutes()+min);return d}
  function timeRange(a,b){if(!a||!b)return'Golden hour';return `${a.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} – ${b.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`}
  function goalName(){return selected==='product'?'Product / car':selected[0].toUpperCase()+selected.slice(1)}

  function grade(cur,daily){
    const cloud=Number(cur.cloud_cover||0),wind=Number(cur.wind_speed_10m||0),rain=Number((daily.precipitation_probability_max||[0])[0]||0),code=Number(cur.weather_code||0);
    let score=78,reasons=[];
    if(selected==='portrait'||selected==='product'){
      if(cloud>=45&&cloud<=90){score+=12;reasons.push('cloud cover is giving you softer, easier light')}else if(cloud<20){score-=16;reasons.push('direct sun can create hard highlights and deep shadows')}else reasons.push('the light is workable with some direction');
    }else if(selected==='landscape'){
      if(cloud>=20&&cloud<=75){score+=8;reasons.push('the sky has enough texture to add depth')}else if(cloud<10){score-=5;reasons.push('the clear sky may look flatter at midday')}else reasons.push('the scene has soft, even light');
    }else if(selected==='action'){
      if(cloud<70){score+=6;reasons.push('there should be enough light for a fast shutter')}else{score-=7;reasons.push('you may need more ISO to keep a fast shutter')}
    }
    if(rain>=60){score-=22;reasons.push('rain is likely')}
    else if(rain>=30){score-=7;reasons.push('there is some rain risk')}
    if(wind>=35){score-=17;reasons.push('wind is strong')}
    else if(wind>=22){score-=7;reasons.push('wind may move hair, leaves, or clothing')}
    if(code>=95)score-=30;
    score=Math.max(20,Math.min(98,Math.round(score)));
    return{score,cloud,wind,rain,reasons,code};
  }

  function timeAdvice(daily,g){
    const rise=(daily.sunrise||[])[0],set=(daily.sunset||[])[0],riseD=rise?new Date(rise):null,setD=set?new Date(set):null,now=new Date(),amEnd=shiftDate(rise,60),pmStart=shiftDate(set,-60);
    if(riseD&&!isNaN(riseD)&&amEnd&&now>=riseD&&now<=amEnd)return{label:'Now — morning golden hour',why:'The sun is low and directional. This is one of the easiest times to get depth without harsh overhead light.'};
    if(pmStart&&setD&&!isNaN(setD)&&now>=pmStart&&now<=setD)return{label:'Now — evening golden hour',why:'You are inside the soft evening window. Shoot now before the light drops.'};
    if(pmStart&&now<pmStart)return g.score>=82?{label:'Now, or '+timeRange(pmStart,setD),why:'Conditions are already good. Golden hour later should give you warmer, lower-angle light.'}:{label:timeRange(pmStart,setD),why:'The evening golden-hour window should be easier than the current light.'};
    if(g.score>=75)return{label:'Now — next 45–60 min',why:'The current light is usable. Concentrate on subject position and background instead of waiting for perfect weather.'};
    return{label:'Next golden-hour window',why:'Current conditions are usable with care, but lower-angle light will make the scene easier to control.'};
  }

  function watch(g){
    if(g.code>=95)return{title:'Thunderstorms',why:'Skip the shoot and keep the camera protected.'};
    if(g.rain>=60)return{title:'Rain / moisture',why:'The Rebel T7 and kit lens are not a setup to casually expose to rain. Keep them protected.'};
    if(g.wind>=30)return{title:'Strong wind',why:selected==='action'?'Wind adds unpredictable movement. Keep your shutter fast.':'Hair, clothing, leaves, and camera stability can become distracting.'};
    if(g.cloud<20&&(selected==='portrait'||selected==='product'))return{title:'Hard highlights',why:'Move the subject into open shade or put the sun behind/side of the subject rather than directly overhead.'};
    if(selected==='action'&&g.cloud>=70)return{title:'Shutter speed',why:'Don’t let the camera slow down. Raise ISO before sacrificing the shutter speed you need.'};
    return{title:'Changing light',why:'Recheck exposure when the sun moves behind clouds or when you change shooting direction.'};
  }

  function recommendation(g){
    let light=g.cloud<22?'bright':'normal';if(g.rain>=60||g.cloud>=92)light='indoor';
    const context={light,motion:selected==='action'?'fast':'still',support:'handheld'};
    const rec=window.T7Engine?.recommend(selected,context)||{mode:selected==='action'?'Tv':'Av',lens:selected==='landscape'?'18–24mm':selected==='portrait'?'50–55mm':'35–55mm',exposure:selected==='action'?'1/1000':selected==='landscape'?'f/8':'f/5.6',iso:light==='bright'?'100':'100–400',tip:'Check focus, framing, and exposure before taking the shot.'};
    if(selected==='portrait'&&g.cloud<20){rec.iso='100';rec.tip='Use open shade if possible. Keep one AF point on the nearest eye and protect bright skin highlights.'}
    if(selected==='product'&&g.cloud<20){rec.iso='100';rec.tip='Avoid direct overhead sun on glossy surfaces. Use shade or soft side light to control reflections.'}
    if(selected==='landscape'&&g.cloud<20){rec.iso='100';rec.exposure='f/8';rec.tip='Keep ISO low, watch the bright sky, and consider a small negative exposure compensation if highlights are clipping.'}
    if(selected==='action'){rec.mode='Tv';rec.exposure='1/1000';if(g.cloud>=70)rec.iso='Auto / 800–3200';}
    return rec;
  }

  function paint(detail){
    latest=detail;const cur=detail.current||{},daily=detail.daily||{},g=grade(cur,daily),t=timeAdvice(daily,g),w=watch(g),rec=recommendation(g);
    $('#cv2Empty').hidden=true;$('#cv2Result').hidden=false;
    const badge=$('#cv2Badge');badge.className='cv2-verdict-badge';
    let title,badgeText;
    if(g.score>=82){title=selected==='portrait'&&g.cloud>=45?'Excellent soft light':'Good conditions right now';badgeText='GO SHOOT'}
    else if(g.score>=62){title='Shootable with one adjustment';badgeText='GOOD WITH CARE';badge.classList.add('caution')}
    else{title='Better light is worth waiting for';badgeText='WAIT IF YOU CAN';badge.classList.add('wait')}
    badge.textContent=badgeText;$('#cv2Title').textContent=title;$('#cv2Reason').textContent=`For ${goalName().toLowerCase()}, ${g.reasons.slice(0,2).join(' and ')}.`;
    $('#cv2Score').textContent=g.score;$('#cv2ScoreRing').style.setProperty('--cv2-score',g.score);
    $('#cv2Window').textContent=t.label;$('#cv2WindowWhy').textContent=t.why;$('#cv2Watch').textContent=w.title;$('#cv2WatchWhy').textContent=w.why;
    $('#cv2GoalLabel').textContent=goalName();$('#cv2Mode').textContent=rec.mode;$('#cv2Lens').textContent=rec.lens;$('#cv2Exposure').textContent=rec.exposure;$('#cv2Iso').textContent=rec.iso;$('#cv2Tip').textContent=rec.tip;
    $('#cv2WeatherSummary').textContent=`${Math.round(cur.temperature_2m||0)}° · ${Math.round(g.cloud)}% cloud · ${Math.round(g.wind)} km/h`;
    $('#cv2Shoot').onclick=()=>{try{localStorage.setItem('canonT7LastShootSubject',selected);localStorage.setItem('canonReviewGoal',selected)}catch{}};
  }

  $$('.cv2-goal').forEach(b=>{b.classList.toggle('active',b.dataset.cv2Goal===selected);b.onclick=()=>{selected=b.dataset.cv2Goal;$$('.cv2-goal').forEach(x=>x.classList.toggle('active',x===b));try{localStorage.setItem('canonConditionsGoal',selected)}catch{}if(latest)paint(latest)}});
  window.addEventListener('t7-conditions-updated',e=>paint(e.detail||{}));
})();
