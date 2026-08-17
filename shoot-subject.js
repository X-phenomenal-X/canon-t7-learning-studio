(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const shoot=$('#shoot'),screen=shoot?.querySelector('.shoot-screen[data-screen="1"]'),engine=window.T7Engine;
  if(!shoot||!screen||!engine||screen.dataset.subjectV50)return;screen.dataset.subjectV50='1';

  const title=screen.querySelector('.shoot-v2-screen-title h3'),sub=screen.querySelector('.shoot-v2-screen-title p'),cards=$$('.subject-card-v2'),sceneCard=screen.querySelector('.scene-assist-card'),sceneHead=sceneCard?.querySelector('.scene-assist-head b'),sceneOptions=$$('.scene-assist-option'),clear=$('#sceneAssistClear');
  if(title)title.textContent='What are you actually shooting?';
  if(sub)sub.textContent='Pick the closest photo type first. If the scene has a special lighting or motion problem, refine it underneath.';

  const tags={portrait:'PEOPLE',product:'OBJECTS',landscape:'SCENERY',action:'MOTION',indoor:'LOW LIGHT',night:'TRIPOD'};
  cards.forEach(card=>{
    const key=card.dataset.subject,index=card.querySelector('.subject-index');
    if(index)index.textContent=tags[key]||'PHOTO';
    if(!card.querySelector('.subject-photo')){const visual=document.createElement('span');visual.className='subject-photo';visual.setAttribute('aria-hidden','true');card.prepend(visual)}
  });

  const names={portrait:'Portrait',product:'Product',landscape:'Landscape',action:'Action',indoor:'Indoor',night:'Night'};
  function stored(name){try{return window.T7Store?.get?.(name,null)||null}catch{return null}}
  function currentSubject(){
    return stored('shootSubject')||(()=>{try{return localStorage.getItem('canonT7LastShootSubject')}catch{return null}})()||cards.find(x=>x.classList.contains('selected'))?.dataset.subject||null;
  }
  function currentScene(){return stored('shootScene')||(()=>{try{return localStorage.getItem('canonT7LastScene')}catch{return null}})()||null}
  function relevant(subject){return sceneOptions.filter(o=>engine.scenes?.[o.dataset.scene]?.subject===subject)}

  function sync(){
    const subject=currentSubject(),scene=currentScene(),list=subject?relevant(subject):[];
    cards.forEach(c=>c.classList.toggle('subject-active-context',!!subject&&c.dataset.subject===subject));
    sceneOptions.forEach(o=>o.hidden=!list.includes(o));
    if(sceneCard){sceneCard.hidden=!subject||list.length===0;}
    if(sceneHead&&subject&&list.length)sceneHead.textContent=`Anything special about this ${names[subject]?.toLowerCase()||'shot'}?`;
    if(clear){
      clear.textContent=`No special situation — use ${names[subject]||'this subject'}`;
      clear.hidden=!scene;
    }
  }

  cards.forEach(c=>c.addEventListener('click',()=>requestAnimationFrame(sync)));
  sceneOptions.forEach(o=>o.addEventListener('click',()=>requestAnimationFrame(sync)));
  clear?.addEventListener('click',()=>requestAnimationFrame(sync));
  window.addEventListener('t7-store-change',e=>{if(['shootSubject','shootScene'].includes(e.detail?.name))requestAnimationFrame(sync)});
  window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='shoot')requestAnimationFrame(sync)});
  sync();
})();
