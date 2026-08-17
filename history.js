(()=>{
  const DB_NAME='canonT7Studio',STORE='photoHistory',DB_VERSION=1;
  let db=null,lastSignature='';

  function openDB(){
    if(db)return Promise.resolve(db);
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE)){const s=d.createObjectStore(STORE,{keyPath:'id'});s.createIndex('time','time');s.createIndex('goal','goal')}};
      req.onsuccess=()=>{db=req.result;resolve(db)};req.onerror=()=>reject(req.error);
    });
  }
  async function store(mode='readonly'){const d=await openDB();return d.transaction(STORE,mode).objectStore(STORE)}
  async function put(value){const s=await store('readwrite');return new Promise((res,rej)=>{const r=s.put(value);r.onsuccess=()=>res(value);r.onerror=()=>rej(r.error)})}
  async function remove(id){const s=await store('readwrite');return new Promise((res,rej)=>{const r=s.delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
  async function clear(){const s=await store('readwrite');return new Promise((res,rej)=>{const r=s.clear();r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
  async function all(){const s=await store();return new Promise((res,rej)=>{const r=s.getAll();r.onsuccess=()=>res((r.result||[]).sort((a,b)=>(b.time||0)-(a.time||0)));r.onerror=()=>rej(r.error)})}

  function metricStatus(value){return value>=78?'Strong':value>=62?'Developing':'Practice'}
  function trend(items,key){
    const vals=items.filter(x=>Number.isFinite(Number(x[key]))).slice(0,6);if(vals.length<2)return{label:'Need more',delta:0};
    const recent=vals.slice(0,Math.min(3,vals.length)),older=vals.slice(3,6);
    if(!older.length){const d=Math.round(Number(recent[0][key])-Number(recent[recent.length-1][key]));return{label:d>3?'Improving':d<-3?'Down':'Stable',delta:d}}
    const avg=a=>a.reduce((s,x)=>s+Number(x[key]||0),0)/a.length,d=Math.round(avg(recent)-avg(older));return{label:d>3?'Improving':d<-3?'Down':'Stable',delta:d};
  }
  function stats(items){const avg=key=>items.length?Math.round(items.reduce((s,x)=>s+Number(x[key]||0),0)/items.length):0;return{count:items.length,detail:avg('detail'),exposure:avg('exposure'),contrast:avg('contrast'),clipping:avg('clipping'),detailTrend:trend(items,'detail'),exposureTrend:trend(items,'exposure')}}
  async function broadcast(){const items=await all(),summary=stats(items);window.dispatchEvent(new CustomEvent('t7-history-updated',{detail:{items,stats:summary}}));return{items,stats:summary}}

  function localPreview(photo){
    try{
      const src=photo?.workingCanvas;if(!src?.width||!src?.height)return photo?.thumb||'';
      const max=1100,scale=Math.min(1,max/Math.max(src.width,src.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(src.width*scale));c.height=Math.max(1,Math.round(src.height*scale));c.getContext('2d').drawImage(src,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.84);
    }catch{return photo?.thumb||''}
  }
  function snapshot(analysis){
    const photo=window.T7PhotoSession?.current?.()||window.T7Store?.getSession('photo')||{},m=analysis.metrics||{},d=analysis.diagnosis||{},l=analysis.labels||{},setup=analysis.nextSetup||{},scene=analysis.scene||window.T7Store?.get('reviewScene',null)||null,audit=analysis.settingsAudit||null;
    const time=Number(photo.createdAt||analysis.time||Date.now()),sceneName=scene&&window.T7Engine?.scenes?.[scene]?.name||'';
    return{
      id:time,time,sessionId:photo.id||'',goal:analysis.goal||window.T7Store?.get('reviewGoal','general')||'general',scene,sceneName,thumb:analysis.thumb||photo.thumb||'',preview:localPreview(photo),
      settings:[setup.mode,setup.lens,setup.settings||setup.exposure].filter(Boolean).join(' • '),score:Number(m.overall||0),exposure:Number(m.exposure||0),detail:Number(m.detail||0),contrast:Number(m.contrast||0),clipping:Number(m.clipping||0),detailConfidence:Number(m.detailConfidence||0),
      status:d.short||'Reviewed',diagnosis:d.title||'Technical review',confidence:d.confidenceLabel||'',labels:{exposure:l.exposure||'',detail:l.detail||'',contrast:l.contrast||'',clipping:l.clipping||''},
      exif:photo.exif||{},settingsAudit:audit?{has:!!audit.has,level:audit.level||'',summary:audit.summary||''}:null,version:analysis.version||'2.4.0'
    };
  }
  function signature(record){return[record.id,record.goal,record.scene||'',record.score,record.exposure,record.detail,record.contrast,record.clipping,record.settings,record.settingsAudit?.level||'',record.settingsAudit?.summary||''].join('|')}
  async function saveAnalysis(analysis){
    if(!analysis?.metrics?.overall)return null;
    const record=snapshot(analysis),sig=signature(record);if(sig===lastSignature)return record;lastSignature=sig;
    await put(record);await broadcast();return record;
  }

  window.T7History={
    open:openDB,all,put,
    remove:async id=>{await remove(id);lastSignature='';return broadcast()},
    clear:async()=>{await clear();lastSignature='';return broadcast()},
    stats,trend,metricStatus,saveAnalysis,version:'2.4.0'
  };
  window.addEventListener('t7-review-updated',e=>saveAnalysis(e.detail).catch(err=>console.warn('Could not save photo history',err)));
  openDB().then(broadcast).catch(err=>console.warn('Photo history unavailable',err));
  window.dispatchEvent(new CustomEvent('t7-history-ready',{detail:window.T7History}));
})();