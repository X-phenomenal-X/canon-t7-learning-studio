(()=>{
  if(window.T7PracticeMissions)return;
  const $=(s,r=document)=>r.querySelector(s),KEY='canonT7PracticeMissionV1';
  const icon=name=>window.T7Icons?.icon?.(name)||document.createElement('span');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
  function write(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{};window.dispatchEvent(new CustomEvent('t7-practice-mission-updated',{detail:v}))}
  function courseStep(stepId){
    const el=$(`#photographyCourse [data-step="${CSS.escape(stepId)}"]`);if(!el)return null;
    const chapter=el.closest('[data-chapter]'),cards=[...el.querySelectorAll('.pc-detail-card')];
    const detail=i=>cards[i]?.querySelector('b')?.textContent?.trim()||'';
    return{el,chapterId:chapter?.dataset.chapter||'',chapterTitle:chapter?.querySelector('.pc-chapter-copy b')?.textContent?.trim()||'',title:el.querySelector('.pc-step-copy b')?.textContent?.trim()||'Practice checkpoint',time:el.querySelector('.pc-step-time')?.textContent?.trim()||'10 min',understand:detail(0),t7:detail(1),assignment:detail(2),inspect:detail(3),complete:el.classList.contains('complete')};
  }
  function recommendation(){
    const adaptive=window.T7AdaptiveLearning?.load?.();
    if(adaptive?.step){const step=courseStep(adaptive.step);if(step&&!step.complete)return{source:'review',reason:adaptive.reason||'This mission targets the strongest learning need from your latest reviewed photo.',chapter:adaptive.chapter||step.chapterId,step:adaptive.step,stepData:step,stamp:adaptive.createdAt||0}}
    const next=window.T7PhotographyCourse?.nextStep?.();
    if(next?.id){const step=courseStep(next.id);if(step)return{source:'course',reason:'This is the next unfinished checkpoint in your photography course.',chapter:next.chapter?.id||step.chapterId,step:next.id,stepData:step,stamp:0}}
    return null;
  }
  function mission(){
    const rec=recommendation();if(!rec)return null;
    const sourceKey=`${rec.source}:${rec.chapter}:${rec.step}:${rec.source==='review'?rec.stamp:'course'}`;
    const old=read();if(old?.sourceKey===sourceKey&&!old.completed)return old;
    const s=rec.stepData,m={id:`mission-${Date.now()}`,sourceKey,source:rec.source,chapter:rec.chapter,step:rec.step,title:s.title,chapterTitle:s.chapterTitle,time:s.time,t7:s.t7,assignment:s.assignment,inspect:s.inspect,reason:rec.reason,createdAt:Date.now(),completed:false};write(m);return m;
  }
  function current(){const m=read(),rec=recommendation();if(!rec)return null;if(m?.sourceKey===`${rec.source}:${rec.chapter}:${rec.step}:${rec.source==='review'?rec.stamp:'course'}`&&!m.completed)return m;return mission()}

  function openCheckpoint(m){location.hash='learn';let tries=0;const timer=setInterval(()=>{tries++;if(window.T7PhotographyCourse?.openStep){window.T7PhotographyCourse.openStep(m.chapter,m.step);clearInterval(timer)}else if(tries>15)clearInterval(timer)},60)}
  function startMission(m){
    const doStart=()=>{const step=courseStep(m.step),primary=step?.el?.querySelector('.pc-step-actions button.primary');if(primary){primary.click();return true}return false};
    if(doStart())return;location.hash='learn';let tries=0;const timer=setInterval(()=>{tries++;if(doStart()||tries>15)clearInterval(timer)},70);
  }
  function completeMission(m){
    const step=courseStep(m.step);if(step&&!step.complete){const b=step.el.querySelector('.complete-action');b?.click()}
    const next={...m,completed:true,completedAt:Date.now()};write(next);setTimeout(refresh,120);
  }

  function card(m,context){
    const wrap=document.createElement('section');wrap.className=`practice-mission ${context==='home'?'home-practice-mission':''}`;wrap.dataset.mission=m.id;
    const main=document.createElement('div');main.className='pm-main';
    main.innerHTML=`<div class="pm-eyebrow"><i></i>${m.source==='review'?'PRACTICE FROM YOUR LAST REVIEW':'YOUR PRACTICE MISSION'}</div><h3 class="pm-title">${esc(m.title)}</h3><p class="pm-reason">${esc(m.reason)}</p><div class="pm-meta"><span class="pm-chip pm-time"><span class="pm-time-icon"></span>${esc(m.time)}</span><span class="pm-chip pm-course"><span class="pm-course-icon"></span>${esc(m.chapterTitle||'Photography course')}</span></div><div class="pm-brief"><div><small>SET IT ON THE T7</small><b>${esc(m.t7||'Open the checkpoint for the exact camera setup.')}</b></div><div><small>TAKE THIS PHOTO</small><b>${esc(m.assignment||'Complete the checkpoint assignment with one deliberate set of changes.')}</b></div><div><small>SUCCESS CHECK</small><b>${esc(m.inspect||'Review the result and look for the intended change.')}</b></div><div><small>WHY THIS MISSION</small><b>${esc(m.source==='review'?'Your latest photo review selected this skill.':'This is your next unfinished course checkpoint.')}</b></div></div>`;
    main.querySelector('.pm-time-icon').appendChild(icon('shutter'));main.querySelector('.pm-course-icon').appendChild(icon('learn'));
    const actions=document.createElement('div');actions.className='pm-actions';
    const start=document.createElement('button');start.className='pm-start';start.textContent='Start mission';start.onclick=()=>startMission(m);
    const view=document.createElement('button');view.textContent='View checkpoint';view.onclick=()=>openCheckpoint(m);
    const done=document.createElement('button');done.className='pm-complete';done.textContent='Mark complete';done.onclick=()=>completeMission(m);
    actions.append(start,view,done);wrap.append(main,actions);return wrap;
  }

  function renderHome(m){const home=$('#home');if(!home)return;home.querySelector('#homePracticeMission')?.remove();if(!m)return;const host=document.createElement('div');host.id='homePracticeMission';host.appendChild(card(m,'home'));const coach=$('#homeCoach',home);coach?.after(host)}
  function renderGuide(m){const guide=$('#photographyGuide');if(!guide)return;let host=$('#guidePracticeMission');if(!host){host=document.createElement('div');host.id='guidePracticeMission';host.className='pm-guide-wrap';const course=$('#photographyCourse');(course||guide.querySelector('.pg-section'))?.before(host)}host.innerHTML='';if(m)host.appendChild(card(m,'guide'));host.hidden=!m}
  function refresh(){const m=current();renderHome(m);renderGuide(m)}

  window.addEventListener('t7-adaptive-learning-updated',()=>setTimeout(refresh,100));
  window.addEventListener('t7-course-updated',()=>setTimeout(()=>{const old=read();if(old?.completed){try{localStorage.removeItem(KEY)}catch{}}refresh()},120));
  window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='home'||e.detail?.route==='learn')setTimeout(refresh,50)});
  window.addEventListener('storage',e=>{if([KEY,'canonT7AdaptiveCourseRecommendationV1','canonT7PhotographyCourseV1','canonLearnDone'].includes(e.key))refresh()});
  setTimeout(refresh,650);
  window.T7PracticeMissions={current,refresh,start:startMission,open:openCheckpoint,complete:completeMission,version:'1.0.0'};
})();
