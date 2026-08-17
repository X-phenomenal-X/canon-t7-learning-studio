(()=>{
  const $=s=>document.querySelector(s),finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
  let lastRoute=(location.hash||'#home').slice(1)||'home';

  const shutterText=sec=>{const v=Number(sec);if(!finite(v))return'—';if(v>=1)return`${Math.round(v*10)/10}s`;return`1/${Math.max(1,Math.round(1/v))}s`};
  const apertureText=v=>finite(v)?`f/${Math.round(Number(v)*10)/10}`:'—';
  const focalText=v=>finite(v)?`${Math.round(Number(v))}mm`:'—';
  const isoText=v=>finite(v)?`ISO ${Math.round(Number(v))}`:'—';
  const rules={
    portrait:{minShutter:1/125,focal:[45,55],isoMax:1600},product:{minShutter:1/100,focal:[35,55],isoMax:1600},landscape:{isoMax:800},action:{minShutter:1/500,focal:[30,55]},indoor:{minShutter:1/100,isoMax:3200},night:{isoMax:800},
    tvDark:{minShutter:1/60,maxShutter:1/125,focal:[20,40],iso:[200,1600]},brightWindow:{minShutter:1/125,focal:[45,55],isoMax:1600},blackCarSun:{minShutter:1/125,focal:[30,55],isoMax:400},indoorProduct:{minShutter:1/100,focal:[40,55],isoMax:1600},movingCar:{minShutter:1/800,focal:[30,55]},nightHandheld:{minShutter:1/60,focal:[18,40],iso:[800,6400]}
  };

  function contextAudit(key,analysis){
    const photo=window.T7PhotoSession?.current?.()||window.T7Store?.getSession('photo')||{},exif=photo.exif||{},target=rules[key]||{},shutter=Number(exif.exposure),aperture=Number(exif.aperture),iso=Number(exif.iso),focal=Number(exif.focal),has=finite(shutter)||finite(aperture)||finite(iso)||finite(focal),notes=[];
    if(!has)return{has:false,exif,items:[],summary:'No usable camera settings were found in this file. Try the original Canon JPEG if you want EXIF-aware coaching.',level:'neutral'};
    if(finite(shutter)&&target.minShutter&&shutter>target.minShutter*1.08)notes.push({type:'warn',text:`You shot at ${shutterText(shutter)}. For this situation, start around ${shutterText(target.minShutter)} or faster.`});
    if(finite(shutter)&&target.maxShutter&&shutter<target.maxShutter*.92)notes.push({type:'note',text:`Your ${shutterText(shutter)} shutter is faster than the usual screen-testing range. If you see dark bands, test around 1/60–1/125s.`});
    if(finite(focal)&&target.focal&&(focal<target.focal[0]-2||focal>target.focal[1]+2))notes.push({type:'note',text:`You used ${focalText(focal)}. A useful starting range here is about ${target.focal[0]}–${target.focal[1]}mm.`});
    if(finite(iso)&&target.isoMax&&iso>target.isoMax)notes.push({type:'note',text:`${isoText(iso)} is relatively high for this situation. If shutter speed is already safe, lower ISO for a cleaner file.`});
    if(finite(iso)&&target.iso&&(iso<target.iso[0]||iso>target.iso[1]))notes.push({type:'note',text:`You used ${isoText(iso)}. A practical starting range here is roughly ISO ${target.iso[0]}–${target.iso[1]}, adjusted for the light.`});
    const weak=analysis?.metrics?.detail<58&&analysis?.metrics?.detailConfidence>=55;
    if(weak&&finite(shutter)&&!notes.some(n=>n.type==='warn')&&key!=='night')notes.unshift({type:'warn',text:`Detail looks weak at ${shutterText(shutter)}. Protect shutter speed first, then raise ISO only as needed.`});
    if(!notes.length)notes.push({type:'good',text:'The stored shutter, ISO and focal length look reasonable for this shooting context. Work on focus placement, light and composition next.'});
    return{has:true,exif,items:[['SHUTTER',shutterText(shutter)],['APERTURE',apertureText(aperture)],['ISO',finite(iso)?Math.round(iso):'—'],['FOCAL LENGTH',focalText(focal)]],notes,summary:notes[0].text,level:notes[0].type};
  }

  function normalize(detail,scene,goal){
    const engine=window.T7Engine,raw=detail.raw||{},metrics=detail.metrics||{};
    if(scene&&engine?.scenes?.[scene]){
      const def=engine.scenes[scene],rec=engine.recommendScene(scene);let tip=rec.tip;
      if(raw.mean>155&&engine.sceneFix?.(scene,'tooBright'))tip=engine.sceneFix(scene,'tooBright');
      else if(raw.mean<92&&engine.sceneFix?.(scene,'tooDark'))tip=engine.sceneFix(scene,'tooDark');
      else if(metrics.detail<58&&metrics.detailConfidence>=55&&engine.sceneFix?.(scene,'blurry'))tip=engine.sceneFix(scene,'blurry');
      return{...detail,goal:def.subject||goal||detail.goal,scene,nextSetup:{mode:rec.mode,lens:rec.lens,settings:rec.exposure,exposure:rec.exposure,iso:rec.iso,afMode:rec.afMode,drive:rec.drive,tip,scene:rec.name},settingsAudit:contextAudit(scene,detail),_contextSynced:true};
    }
    if(goal&&goal!=='general'&&engine?.profiles?.[goal]){
      const detailProblem=metrics.detail<58&&metrics.detailConfidence>=55,rec=engine.reviewNext?.(goal,{mean:raw.mean,detailScore:detailProblem?metrics.detail:75})||engine.recommend(goal);
      return{...detail,goal,scene:null,nextSetup:{mode:rec.mode,lens:rec.lens,settings:rec.exposure,exposure:rec.exposure,iso:rec.iso,afMode:rec.afMode,drive:rec.drive,tip:rec.tip},settingsAudit:contextAudit(goal,detail),_contextSynced:true};
    }
    if(goal==='general'&&detail.goal!=='general')return{...detail,goal:'general',scene:null,_contextSynced:true};
    return{...detail,_contextSynced:true};
  }

  function paintContext(corrected){
    const scene=corrected.scene,def=scene&&window.T7Engine?.scenes?.[scene],setup=corrected.nextSetup||{},audit=corrected.settingsAudit,select=$('#reviewGoal');
    if(select&&corrected.goal)select.value=corrected.goal;
    const box=$('#reviewSceneContext');if(box)box.hidden=!def;if(def&&$('#reviewSceneName'))$('#reviewSceneName').textContent=def.name;
    if($('#reviewMode'))$('#reviewMode').textContent=setup.mode||'—';if($('#reviewLens'))$('#reviewLens').textContent=setup.lens||'—';if($('#reviewSettings'))$('#reviewSettings').textContent=setup.exposure||setup.settings||'—';if($('#reviewIso'))$('#reviewIso').textContent=setup.iso||'—';
    if(audit?.has&&$('#reviewExifValues'))$('#reviewExifValues').innerHTML=audit.items.map(([label,value])=>`<div><small>${label}</small><b>${value}</b></div>`).join('');
    if(audit&&$('#reviewExifVerdict')){$('#reviewExifVerdict').className=`review-exif-verdict ${audit.level||'neutral'}`;$('#reviewExifVerdict').innerHTML=`<b>${audit.level==='good'?'Settings look sensible':audit.level==='warn'?'Setting worth changing':'Setting check'}</b><span>${audit.summary}</span>`}
  }

  window.addEventListener('t7-review-updated',e=>{
    const detail=e.detail;if(!detail||detail._contextSynced)return;
    const scene=window.T7Store?.get('reviewScene',null),goal=window.T7Store?.get('reviewGoal','general')||'general',sceneValid=scene&&window.T7Engine?.scenes?.[scene],needsScene=!!sceneValid&&detail.scene!==scene,needsGoal=!sceneValid&&detail.goal!==goal;
    if(!needsScene&&!needsGoal)return;
    e.stopImmediatePropagation();
    const corrected=normalize(detail,sceneValid?scene:null,goal);window.T7ReviewAnalysis=corrected;window.T7PhotoSession?.patch?.({analysis:corrected});paintContext(corrected);
    setTimeout(()=>window.dispatchEvent(new CustomEvent('t7-review-updated',{detail:corrected})),0);
  });

  window.addEventListener('t7-route-changed',e=>{
    const route=e.detail?.route||'home';
    if(route==='review'){
      if(lastRoute==='shoot'){
        if(!window.T7Store?.get('reviewScene',null))window.T7Store?.set('reviewScene',window.T7Store?.get('shootScene',null)||null);
        const subject=window.T7Store?.get('shootSubject',null);if(subject)window.T7Store?.set('reviewGoal',subject);
      }else window.T7Store?.remove('reviewScene');
    }
    lastRoute=route;
  });

  const file=$('#fileInput');if(file)file.addEventListener('click',()=>{file.value=''});
  window.T7ReviewSceneSync={normalize,version:'1.1.0'};
})();