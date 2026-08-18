(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  document.body.classList.add('qa-v54');

  function cleanLearn(){
    const learn=$('#learn');if(!learn)return;
    const complete=$('#lessonComplete');if(complete)complete.setAttribute('aria-label','Mark current photography lesson learned');
    const progress=$('#learnHeaderProgress');if(progress)progress.setAttribute('aria-hidden','true');
  }

  function cleanReview(){
    const review=$('.review-flow');if(!review)return;
    const goal=review.querySelector('.review-goal label');if(goal)goal.textContent='Review as';
    const select=$('#reviewGoal');if(select)select.setAttribute('aria-label','Choose the type of photo being reviewed');
    const upload=$('#rv2Upload');if(upload)upload.setAttribute('aria-describedby','rv2UploadHint');
    const hint=$('#rv2Empty small');if(hint&&!hint.id)hint.id='rv2UploadHint';
  }

  function cleanConditions(){
    const status=$('#photoWeatherStatus');if(status)status.setAttribute('aria-live','polite');
    const input=$('#photoLocation');if(input)input.setAttribute('aria-label','City for photography conditions');
  }

  function cleanCamera(){
    const camera=$('#camera');if(!camera)return;
    const intro=camera.querySelector('.cv3-hero p');if(intro)intro.textContent='Tap a control, find the same control on your Rebel T7, and follow the exact steps while the camera is in your hands.';
    const hint=camera.querySelector('.cv3-camera-hint');if(hint)hint.textContent='Tap a number to learn that control.';
    const source=camera.querySelector('.cv3-source');if(source)source.textContent='Control names and layout based on Canon EOS Rebel T7 documentation.';
    const reset=$('#cv3Reset');if(reset)reset.textContent='Reset progress';
  }

  function cleanEditor(){
    const placeholder=$('#placeholder');if(placeholder){
      const title=placeholder.querySelector('h3'),copy=placeholder.querySelector('p');
      if(title)title.textContent='Choose a photo to start';
      if(copy)copy.textContent='Use an original Canon JPEG when you want the best EXIF-aware workflow.';
    }
    const status=$('#ev2FileStatus');if(status)status.setAttribute('aria-live','polite');
  }

  function cleanLibrary(){
    const section=$('#library');if(!section)return;
    const listCard=section.querySelector('.library-list-card');
    if(listCard&&!section.querySelector('.qa-library-archive')){
      const details=document.createElement('details');details.className='qa-library-archive';
      const summary=document.createElement('summary');summary.innerHTML='<div><small>FULL LIBRARY</small><b>All reviewed photos</b></div><span>Open archive</span>';
      listCard.before(details);details.append(summary,listCard);
      details.addEventListener('toggle',()=>{summary.querySelector('span').textContent=details.open?'Close archive':'Open archive'});
    }
    const contact=section.querySelector('.library-list-card .library-card-head h2');if(contact)contact.textContent='All reviews';
    const contactP=section.querySelector('.library-list-card .library-card-head p');if(contactP)contactP.textContent='Open this archive when you want older reviews, reshoot shortcuts, or history controls.';
  }

  function navigationQA(){
    const route=()=>{
      /* document.title belongs to router.js. */
      $$('.mobile-dock a,.desktop-nav a').forEach(a=>{
        if(a.classList.contains('active'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
      });
    };
    route();window.addEventListener('t7-route-changed',route);
  }

  function imageQA(root=document){
    root.querySelectorAll?.('img').forEach((img,i)=>{
      if(!img.hasAttribute('decoding'))img.decoding='async';
      if(i>0&&!img.hasAttribute('loading'))img.loading='lazy';
    });
  }

  function archiveCSS(){
    if(document.getElementById('qaArchiveStyles'))return;
    const s=document.createElement('style');s.id='qaArchiveStyles';s.textContent=`
      .qa-library-archive{margin-top:10px;border:1px solid rgba(255,255,255,.075);border-radius:22px;background:linear-gradient(150deg,rgba(17,22,29,.82),rgba(9,13,18,.88));overflow:hidden}
      .qa-library-archive>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:66px;padding:12px 15px;cursor:pointer}
      .qa-library-archive>summary::-webkit-details-marker{display:none}.qa-library-archive>summary small{display:block;color:#707b87;font-size:10px;font-weight:900;letter-spacing:.11em}.qa-library-archive>summary b{display:block;margin-top:3px;font-size:14px}.qa-library-archive>summary>span{color:#8b96a1;font-size:11px;font-weight:850}
      .qa-library-archive>.library-list-card{margin:0!important;border:0!important;border-top:1px solid rgba(255,255,255,.06)!important;border-radius:0!important;box-shadow:none!important;background:rgba(8,12,16,.44)!important}
      @media(max-width:760px){.qa-library-archive>summary{min-height:60px}.qa-library-archive>.library-list-card{padding:12px!important}}
    `;document.head.appendChild(s);
  }

  archiveCSS();cleanLearn();cleanReview();cleanConditions();cleanCamera();cleanEditor();cleanLibrary();navigationQA();imageQA();

  const observer=new MutationObserver(muts=>{
    let images=false;
    for(const m of muts){for(const n of m.addedNodes){if(n.nodeType===1){if(n.matches?.('img')||n.querySelector?.('img'))images=true}}}
    if(images)imageQA();
  });
  observer.observe(document.body,{childList:true,subtree:true});

  window.addEventListener('t7-route-changed',e=>{
    if(e.detail?.route==='learn')cleanLearn();
    if(e.detail?.route==='review')cleanReview();
    if(e.detail?.route==='conditions')cleanConditions();
    if(e.detail?.route==='camera')cleanCamera();
    if(e.detail?.route==='edit')cleanEditor();
    if(e.detail?.route==='library')cleanLibrary();
  });
})();
