(()=>{
  const $=s=>document.querySelector(s);
  const review=$('.review-flow'),file=$('#fileInput'),score=$('#reviewScore');
  if(!review||!file||!score||$('.review-v2-overview'))return;

  const goal=$('.review-goal');
  const overview=document.createElement('section');
  overview.className='review-v2-overview';
  overview.innerHTML=`
    <div class="rv2-empty" id="rv2Empty">
      <div class="rv2-empty-copy">
        <span class="rv2-eyebrow">PHOTO REVIEW</span>
        <h2>Bring in a photo. Leave with one clear fix.</h2>
        <p>Your photo stays on this device. T7 Studio checks the technical capture, reads Canon settings when available, and gives you the next setup to try.</p>
        <button class="rv2-upload" id="rv2Upload">Choose Canon photo</button>
        <small>JPEG works best for EXIF + review.</small>
      </div>
      <div class="rv2-empty-visual" aria-hidden="true"><span>+</span></div>
    </div>

    <div class="rv2-result" id="rv2Result" hidden>
      <div class="rv2-photo-wrap"><img id="rv2Photo" alt="Latest reviewed photo"><div class="rv2-score"><b id="rv2Score">—</b><small>TECH</small></div></div>
      <div class="rv2-result-copy">
        <span class="rv2-eyebrow">YOUR REVIEW</span>
        <h2 id="rv2Verdict">Photo reviewed</h2>
        <p id="rv2Summary">Your next useful change appears below.</p>
      </div>
    </div>

    <div class="rv2-priority" id="rv2Priority" hidden>
      <div class="rv2-priority-number">1</div>
      <div><small>CHANGE THIS FIRST</small><h3 id="rv2PriorityTitle">—</h3><p id="rv2PriorityWhy">—</p></div>
    </div>

    <div class="rv2-setup" id="rv2Setup" hidden>
      <div class="rv2-setup-head"><span>Next T7 setup</span><small>Starting point</small></div>
      <div class="rv2-setting-row">
        <div><small>MODE</small><b id="rv2Mode">—</b></div>
        <div><small>LENS</small><b id="rv2Lens">—</b></div>
        <div><small>EXPOSURE</small><b id="rv2Exposure">—</b></div>
        <div><small>ISO</small><b id="rv2Iso">—</b></div>
      </div>
      <div class="rv2-actions"><a class="rv2-primary" href="#shoot">Reshoot with this setup</a><a class="rv2-secondary" href="#edit">Edit this photo</a></div>
    </div>

    <details class="rv2-details" id="rv2Details" hidden>
      <summary><span>Technical details</span><small>Exposure · detail · contrast · clipping</small></summary>
      <div class="rv2-details-host" id="rv2DetailsHost"></div>
    </details>`;
  (goal||review.firstElementChild)?.after(overview);

  const empty=$('#rv2Empty'),result=$('#rv2Result'),priority=$('#rv2Priority'),setup=$('#rv2Setup'),details=$('#rv2Details'),detailsHost=$('#rv2DetailsHost');
  $('#rv2Upload').onclick=()=>file.click();

  const originalResults=$('#reviewResults');
  if(originalResults){
    originalResults.classList.add('rv2-original-results');
    detailsHost.appendChild(originalResults);
  }

  function txt(sel,fallback='—'){const v=$(sel)?.textContent?.trim();return v&&v!=='—'?v:fallback}
  function latest(){try{return JSON.parse(localStorage.getItem('canonRecentPhoto')||'null')}catch{return null}}
  function verdict(n){return n>=82?'Strong technical base':n>=68?'Good capture — refine one thing':n>=52?'Usable — fix one thing first':'Reshoot before heavy editing'}
  function summary(n){return n>=82?'The capture is technically solid. Keep the setup and concentrate on composition, timing, and light.':n>=68?'You have a good file to work with. One targeted change should make the next attempt stronger.':n>=52?'The photo is usable, but another capture will improve more than aggressive editing.':'The technical capture is holding the photo back. Use the recommendation below and try again.'}

  function refresh(){
    const n=Number(String(score.textContent).replace(/[^0-9.]/g,''))||0;
    if(!n){empty.hidden=false;result.hidden=true;priority.hidden=true;setup.hidden=true;details.hidden=true;return}
    empty.hidden=true;result.hidden=false;priority.hidden=false;setup.hidden=false;details.hidden=false;
    $('#rv2Score').textContent=n;
    $('#rv2Verdict').textContent=verdict(n);
    $('#rv2Summary').textContent=summary(n);
    const p=latest();
    const img=$('#rv2Photo');
    if(p?.thumb){img.src=p.thumb;img.hidden=false}else img.hidden=true;
    $('#rv2PriorityTitle').textContent=txt('#smartTitle',txt('#reviewTitle','Improve one thing first'));
    $('#rv2PriorityWhy').textContent=txt('#smartWhy',txt('#reviewText','Use the technical details below to choose the next adjustment.'));
    $('#rv2Mode').textContent=txt('#smartMode',txt('#reviewMode'));
    $('#rv2Lens').textContent=txt('#smartLens',txt('#reviewLens'));
    $('#rv2Exposure').textContent=txt('#smartExposure',txt('#reviewSettings'));
    $('#rv2Iso').textContent=txt('#smartIso',txt('#reviewIso'));
  }

  const observer=new MutationObserver(()=>setTimeout(refresh,60));
  observer.observe(score,{childList:true,characterData:true,subtree:true});
  const reviewNode=review;
  observer.observe(reviewNode,{childList:true,subtree:true,characterData:true});
  file.addEventListener('change',()=>setTimeout(refresh,800));
  setTimeout(refresh,220);
})();