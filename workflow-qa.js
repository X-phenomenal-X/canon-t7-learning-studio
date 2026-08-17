(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  let libraryItems=[];

  async function syncLibraryActions(){
    if(!$('#library')||!window.T7History?.all)return;
    try{libraryItems=await window.T7History.all()}catch{libraryItems=[]}
    const filter=$('#libFilter')?.value||'all',visible=filter==='all'?libraryItems:libraryItems.filter(x=>x.goal===filter),buttons=$$('#libList .library-mini[data-shoot-goal]');
    buttons.forEach((b,i)=>{const item=visible[i];if(!item)return;b.dataset.shootScene=item.scene||'';b.dataset.sessionId=item.sessionId||'';b.setAttribute('aria-label',`Shoot ${item.sceneName||item.goal||'this subject'} again`)});
    $$('.library-gallery-shot').forEach((card,i)=>{card.href='#library';card.dataset.libraryIndex=String(i);card.setAttribute('aria-label','Open this photo in the full Library archive')});
  }

  document.addEventListener('click',e=>{
    const shoot=e.target.closest?.('#libList .library-mini[data-shoot-goal]');
    if(shoot){
      e.preventDefault();e.stopImmediatePropagation();
      const goal=shoot.dataset.shootGoal==='general'?'portrait':shoot.dataset.shootGoal,scene=shoot.dataset.shootScene||null;
      window.T7Store?.set('shootSubject',goal);window.T7Store?.set('shootScene',scene);
      try{localStorage.setItem('canonT7LastShootSubject',goal);if(scene)localStorage.setItem('canonT7LastScene',scene);else localStorage.removeItem('canonT7LastScene')}catch{}
      location.hash='shoot';return;
    }
    const gallery=e.target.closest?.('.library-gallery-shot');
    if(gallery){
      e.preventDefault();e.stopImmediatePropagation();
      const archive=$('.qa-library-archive');if(archive)archive.open=true;
      setTimeout(()=>$('.library-list-card')?.scrollIntoView({behavior:'smooth',block:'start'}),40);
    }
  },true);

  window.addEventListener('t7-history-updated',()=>setTimeout(syncLibraryActions,60));
  window.addEventListener('t7-route-changed',e=>{if(e.detail?.route==='library')setTimeout(syncLibraryActions,80)});
  $('#libFilter')?.addEventListener('change',()=>setTimeout(syncLibraryActions,40));
  setTimeout(syncLibraryActions,300);

  window.T7WorkflowQA={syncLibraryActions,version:'1.0.0'};
})();