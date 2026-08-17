(()=>{
  const keys={
    controls:'canonSeenControls',
    simulatorPresets:'canonSeenPresets',
    practice:'canonPracticeV5',
    learn:'canonLearnDone',
    recentPhoto:'canonRecentPhoto',
    shootSubject:'canonT7LastShootSubject',
    shootScene:'canonT7LastScene',
    reviewGoal:'canonReviewGoal',
    conditionsGoal:'canonConditionsGoal',
    practiceInsight:'canonT7PracticeInsightV1',
    reshoot:'canonReshootSessionV1'
  };
  const stringKeys=new Set(['shootSubject','shootScene','reviewGoal','conditionsGoal']);
  const volatileKeys=new Set(['reviewScene']);
  const volatile={reviewScene:null};
  const session={photo:null,conditions:null,shoot:null,cameraHelp:null};

  try{
    localStorage.removeItem('reviewScene');
    localStorage.removeItem('shootScene');
  }catch{}

  function storageKey(name){return keys[name]||name}
  function get(name,fallback=null){
    if(volatileKeys.has(name))return volatile[name]??fallback;
    try{
      const raw=localStorage.getItem(storageKey(name));
      if(raw==null)return fallback;
      if(stringKeys.has(name))return raw;
      return JSON.parse(raw);
    }catch{return fallback}
  }
  function set(name,value){
    if(volatileKeys.has(name)){
      volatile[name]=value==null?null:value;
      window.dispatchEvent(new CustomEvent('t7-store-change',{detail:{name,value:volatile[name]}}));
      return true;
    }
    try{
      const key=storageKey(name);
      if(value==null)localStorage.removeItem(key);
      else if(stringKeys.has(name))localStorage.setItem(key,String(value));
      else localStorage.setItem(key,JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('t7-store-change',{detail:{name,value}}));
      return true;
    }catch{return false}
  }
  function remove(name){return set(name,null)}
  function progress(){
    const controls=get('controls',{}),presets=get('simulatorPresets',{}),practice=get('practice',[]),learn=get('learn',{});
    return{
      controlsSeen:Object.keys(controls||{}).length,
      presetsSeen:Object.keys(presets||{}).length,
      practiceDone:Array.isArray(practice)?practice.filter(Boolean).length:0,
      practiceTotal:Math.max(7,Array.isArray(practice)?practice.length:0),
      lessonsDone:Object.values(learn||{}).filter(Boolean).length
    };
  }
  function setSession(name,value){session[name]=value;window.dispatchEvent(new CustomEvent('t7-session-change',{detail:{name,value}}));return value}
  function getSession(name){return session[name]||null}
  function snapshot(){return{progress:progress(),shootSubject:get('shootSubject'),shootScene:get('shootScene'),reviewGoal:get('reviewGoal'),reviewScene:get('reviewScene'),conditionsGoal:get('conditionsGoal'),recentPhoto:get('recentPhoto'),reshoot:get('reshoot')}}

  window.T7Store={keys,get,set,remove,progress,setSession,getSession,snapshot,version:2};
  window.dispatchEvent(new CustomEvent('t7-store-ready',{detail:window.T7Store}));
})();