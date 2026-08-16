(()=>{
  const $=s=>document.querySelector(s),review=$('.review-flow'),file=$('#fileInput'),score=$('#reviewScore');
  if(!review||!file||!score||$('.review-v2-overview'))return;

  const goal=$('.review-goal'),overview=document.createElement('section');overview.className='review-v2-overview';
  overview.innerHTML=`
    <div class="rv2-empty" id="rv2Empty"><div class="rv2-empty-copy"><span class="rv2-eyebrow">PHOTO REVIEW</span><h2>Bring in a photo. Leave with one clear fix.</h2><p>Your photo stays on this device. T7 Studio checks the technical capture, reads Canon settings when available, and gives you the next setup to try.</p><button class="rv2-upload" id="rv2Upload">Choose Canon photo</button><small>JPEG works best for EXIF + review.</small></div><div class="rv2-empty-visual" aria-hidden="true"><span>+</span></div></div>

    <div class="rv2-result" id="rv2Result" hidden>
      <div class="rv2-photo-wrap"><img id="rv2Photo" alt="Latest reviewed photo"><div class="rv2-status"><b id="rv2Status">Reviewed</b><small id="rv2Confidence">Technical check</small></div></div>
      <div class="rv2-result-copy"><span class="rv2-eyebrow">YOUR REVIEW</span><h2 id="rv2Verdict">Photo reviewed</h2><p id="rv2Summary">Your next useful change appears below.</p></div>
    </div>

    <div class="rv2-diagnostics" id="rv2Diagnostics" hidden>
      <div><small>EXPOSURE</small><b id="rv2DiagExposure">—</b></div>
      <div><small>FOCUS / DETAIL</small><b id="rv2DiagDetail">—</b></div>
      <div><small>HIGHLIGHTS / SHADOWS</small><b id="rv2DiagTone">—</b></div>
      <div><small>CONTRAST</small><b id="rv2DiagContrast">—</b></div>
    </div>

    <div class="rv2-priority" id="rv2Priority" hidden><div class="rv2-priority-number">1</div><div><small>CHANGE THIS FIRST</small><h3 id="rv2PriorityTitle">—</h3><p id="rv2PriorityWhy">—</p></div></div>

    <div class="rv2-setup" id="rv2Setup" hidden><div class="rv2-setup-head"><span>Next T7 setup</span><small>Starting point</small></div><div class="rv2-setting-row"><div><small>MODE</small><b id="rv2Mode">—</b></div><div><small>LENS</small><b id="rv2Lens">—</b></div><div><small>EXPOSURE</small><b id="rv2Exposure">—</b></div><div><small>ISO</small><b id="rv2Iso">—</b></div></div><div class="rv2-actions"><a class="rv2-primary" href="#shoot">Reshoot with this setup</a><a class="rv2-secondary" href="#edit">Edit this photo</a></div></div>

    <details class="rv2-details" id="rv2Details" hidden><summary><span>Technical details</span><small>Scores are diagnostic signals, not a photo rating</small></summary><div class="rv2-details-host" id="rv2DetailsHost"></div></details>`;
  (goal||review.firstElementChild)?.after(overview);

  const empty=$('#rv2Empty'),result=$('#rv2Result'),diagnostics=$('#rv2Diagnostics'),priority=$('#rv2Priority'),setup=$('#rv2Setup'),details=$('#rv2Details'),detailsHost=$('#rv2DetailsHost');
  $('#rv2Upload').onclick=()=>file.click();
  const originalResults=$('#reviewResults');if(originalResults){originalResults.classList.add('rv2-original-results');detailsHost.appendChild(originalResults)}

  function txt(sel,fallback='—'){const v=$(sel)?.textContent?.trim();return v&&v!=='—'?v:fallback}
  function latest(){return window.T7Store?.get('recentPhoto',null)||(()=>{try{return JSON.parse(localStorage.getItem('canonRecentPhoto')||'null')}catch{return null}})()}

  function refresh(){
    const a=window.T7ReviewAnalysis||window.T7Store?.getSession('photo')?.analysis||null;
    const n=Number(String(score.textContent).replace(/[^0-9.]/g,''))||0;
    if(!a&&!n){empty.hidden=false;result.hidden=true;diagnostics.hidden=true;priority.hidden=true;setup.hidden=true;details.hidden=true;return}
    empty.hidden=true;result.hidden=false;diagnostics.hidden=false;priority.hidden=false;setup.hidden=false;details.hidden=false;
    const d=a?.diagnosis||{title:txt('#reviewTitle','Technical review'),short:'Reviewed',summary:txt('#reviewText','Use the details below to choose the next adjustment.'),confidenceLabel:'Technical check'};
    const l=a?.labels||{exposure:txt('#reviewExposureNote'),detail:txt('#reviewDetailNote'),clipping:txt('#reviewClipNote'),contrast:txt('#reviewContrastNote')};
    $('#rv2Status').textContent=d.short||'Reviewed';$('#rv2Confidence').textContent=d.confidenceLabel||'Technical check';
    $('#rv2Verdict').textContent=d.title;$('#rv2Summary').textContent=d.summary;
    $('#rv2DiagExposure').textContent=l.exposure||'—';$('#rv2DiagDetail').textContent=l.detail||'—';$('#rv2DiagTone').textContent=l.clipping||'—';$('#rv2DiagContrast').textContent=l.contrast||'—';
    const p=latest(),img=$('#rv2Photo');if(p?.thumb){img.src=p.thumb;img.hidden=false}else img.hidden=true;
    $('#rv2PriorityTitle').textContent=txt('#smartTitle',txt('#reviewTitle','Improve one thing first'));
    $('#rv2PriorityWhy').textContent=txt('#smartWhy',txt('#reviewText','Use the technical details below to choose the next adjustment.'));
    $('#rv2Mode').textContent=txt('#smartMode',txt('#reviewMode'));$('#rv2Lens').textContent=txt('#smartLens',txt('#reviewLens'));$('#rv2Exposure').textContent=txt('#smartExposure',txt('#reviewSettings'));$('#rv2Iso').textContent=txt('#smartIso',txt('#reviewIso'));
  }

  const observer=new MutationObserver(()=>setTimeout(refresh,50));observer.observe(score,{childList:true,characterData:true,subtree:true});
  ['#smartTitle','#smartWhy','#smartMode','#smartLens','#smartExposure','#smartIso'].forEach(sel=>{const el=$(sel);if(el)observer.observe(el,{childList:true,characterData:true,subtree:true})});
  window.addEventListener('t7-review-updated',()=>setTimeout(refresh,20));
  $('#reviewGoal')?.addEventListener('change',()=>setTimeout(refresh,80));file.addEventListener('change',()=>setTimeout(refresh,850));setTimeout(refresh,220);
})();