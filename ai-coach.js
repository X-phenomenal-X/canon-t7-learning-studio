(()=>{
  const $=s=>document.querySelector(s);
  const edit=$('#edit'),fileInput=$('#fileInput');
  if(!edit||!fileInput||$('#aiCoach'))return;

  let currentFile=null,endpoint='',working=false;
  const review=document.querySelector('.review-flow');
  const panel=document.createElement('div');
  panel.id='aiCoach';panel.className='ai-coach';
  panel.innerHTML=`
    <div class="ai-coach-head">
      <div><span class="tag">AI PHOTO COACH</span><h3>Get image-specific photography feedback</h3><p>AI looks at composition, lighting, subject placement, background, and likely focus quality, then combines that with your T7 settings.</p></div>
      <span class="ai-badge">OPTIONAL • CLOUD ANALYSIS</span>
    </div>
    <div class="ai-coach-empty" id="aiCoachEmpty"><b>Upload a photo first.</b><p>The normal technical Review stays private and on-device. AI analysis only runs when you tap the button below.</p></div>
    <div class="ai-coach-controls">
      <label>What were you trying to shoot?
        <select id="aiCoachGoal"><option value="portrait">Portrait</option><option value="product">Product / tech</option><option value="landscape">Landscape / building</option><option value="action">Action / movement</option><option value="indoor">Indoor</option><option value="night">Night / low light</option><option value="general">General</option></select>
      </label>
      <button class="button primary" id="runAiCoach" disabled>Analyze with AI</button>
    </div>
    <div class="ai-coach-pin" id="aiCoachPinWrap">
      <label>Private coach PIN<input id="aiCoachPin" type="password" inputmode="numeric" autocomplete="off" placeholder="Enter PIN"></label>
      <button class="button" id="rememberCoachPin">Use this PIN</button>
    </div>
    <div class="ai-status" id="aiCoachStatus">Connecting to the secure coach backend…</div>
    <div class="ai-results" id="aiCoachResults" hidden>
      <div class="ai-summary"><h4 id="aiSummaryTitle">Photo coach</h4><p id="aiSummaryText">—</p></div>
      <div class="ai-grid">
        <div class="ai-card"><small>Composition</small><b id="aiCompositionLabel">—</b><p id="aiCompositionText">—</p></div>
        <div class="ai-card"><small>Lighting</small><b id="aiLightingLabel">—</b><p id="aiLightingText">—</p></div>
        <div class="ai-card"><small>Focus / detail</small><b id="aiFocusLabel">—</b><p id="aiFocusText">—</p></div>
        <div class="ai-card"><small>Background</small><b id="aiBackgroundLabel">—</b><p id="aiBackgroundText">—</p></div>
      </div>
      <div class="ai-priority"><span>CHANGE ONE THING FIRST</span><h4 id="aiPriorityTitle">—</h4><p id="aiPriorityWhy">—</p><p><b>Do this:</b> <span id="aiPriorityAction">—</span></p></div>
      <div class="ai-insights">
        <div class="ai-box"><h4>What worked</h4><ul id="aiStrengths"></ul></div>
        <div class="ai-box"><h4>Watch next time</h4><ul id="aiWatch"></ul></div>
      </div>
      <div class="ai-next"><h4>Exact T7 setup for the next attempt</h4><div class="ai-next-grid"><div><small>Mode</small><b id="aiMode">—</b></div><div><small>Lens</small><b id="aiLens">—</b></div><div><small>Exposure</small><b id="aiExposure">—</b></div><div><small>ISO</small><b id="aiIso">—</b></div><div><small>AF mode</small><b id="aiAf">—</b></div><div><small>Focus point</small><b id="aiPoint">—</b></div><div><small>Drive</small><b id="aiDrive">—</b></div><div><small>Main change</small><b id="aiChange">—</b></div></div><div class="ai-actions"><a class="button primary" href="#shoot">Try this setup</a><a class="button" href="#learn">Learn the skill</a></div></div>
    </div>`;
  if(review)review.before(panel);else edit.querySelector('.editor-layout')?.before(panel);

  const status=$('#aiCoachStatus'),run=$('#runAiCoach'),goal=$('#aiCoachGoal'),pin=$('#aiCoachPin');
  try{const saved=sessionStorage.getItem('canonCoachPin');if(saved)pin.value=saved}catch{}
  try{const savedGoal=localStorage.getItem('canonReviewGoal');if(savedGoal)goal.value=savedGoal}catch{}

  function setStatus(text,type=''){
    status.textContent=text;status.className='ai-status'+(type?' '+type:'');
  }
  async function loadConfig(){
    try{
      const r=await fetch('./coach-config.json?v='+Date.now(),{cache:'no-store'});const c=await r.json();endpoint=(c.endpoint||'').trim();
      if(endpoint){setStatus('Secure AI Coach backend connected. Upload a photo and tap Analyze with AI.','success');}
      else setStatus('AI Coach frontend is ready, but the secure backend has not been connected yet.','error');
      syncRun();
    }catch{setStatus('Could not read AI Coach configuration.','error')}
  }
  function syncRun(){run.disabled=!currentFile||!endpoint||working;$('#aiCoachEmpty').innerHTML=currentFile?'<b>Photo ready.</b><p>Technical Review runs locally. AI Coach will only upload a compressed copy after you tap Analyze with AI.</p>':'<b>Upload a photo first.</b><p>The normal technical Review stays private and on-device. AI analysis only runs when you tap the button below.</p>'}
  fileInput.addEventListener('change',e=>{currentFile=e.target.files?.[0]||null;syncRun()});
  $('#rememberCoachPin').onclick=()=>{try{sessionStorage.setItem('canonCoachPin',pin.value.trim())}catch{}setStatus(pin.value.trim()?'PIN saved for this browser session.':'Enter a PIN first.',pin.value.trim()?'success':'error')};

  function collectExif(){return{camera:$('#exifCamera')?.textContent||'',focal:$('#exifFocal')?.textContent||'',aperture:$('#exifAperture')?.textContent||'',shutter:$('#exifShutter')?.textContent||'',iso:$('#exifIso')?.textContent||'',captured:$('#exifDate')?.textContent||''}}
  function collectTechnical(){return{overall:$('#reviewScore')?.textContent||'',exposure:$('#reviewExposure')?.textContent||'',detail:$('#reviewDetail')?.textContent||'',contrast:$('#reviewContrast')?.textContent||'',clipping:$('#reviewClip')?.textContent||''}}
  function readAsImage(file){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onerror=reject;fr.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>resolve(img);img.src=fr.result};fr.readAsDataURL(file)})}
  async function compressedDataUrl(file){
    const img=await readAsImage(file),max=1400,scale=Math.min(1,max/img.width,max/img.height),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);return c.toDataURL('image/jpeg',.82)
  }
  function render(data){
    $('#aiCoachResults').hidden=false;$('#aiSummaryTitle').textContent=data.summary_title||'Photo coach';$('#aiSummaryText').textContent=data.summary||'';
    const cats=[['Composition',data.composition],['Lighting',data.lighting],['Focus',data.focus],['Background',data.background]];
    cats.forEach(([id,x])=>{if(!x)return;$('#ai'+id+'Label').textContent=x.rating||'—';$('#ai'+id+'Text').textContent=x.feedback||''});
    $('#aiPriorityTitle').textContent=data.priority_fix?.title||'—';$('#aiPriorityWhy').textContent=data.priority_fix?.why||'';$('#aiPriorityAction').textContent=data.priority_fix?.action||'';
    $('#aiStrengths').innerHTML=(data.strengths||[]).map(x=>`<li>${x}</li>`).join('');$('#aiWatch').innerHTML=(data.watch_next_time||[]).map(x=>`<li>${x}</li>`).join('');
    const n=data.t7_next_shot||{};$('#aiMode').textContent=n.mode||'—';$('#aiLens').textContent=n.lens||'—';$('#aiExposure').textContent=n.exposure||'—';$('#aiIso').textContent=n.iso||'—';$('#aiAf').textContent=n.af_mode||'—';$('#aiPoint').textContent=n.focus_point||'—';$('#aiDrive').textContent=n.drive||'—';$('#aiChange').textContent=n.change_one_thing||'—';
    $('#aiCoachResults').scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  run.onclick=async()=>{
    if(working||!currentFile||!endpoint)return;
    const coachPin=pin.value.trim();if(!coachPin){setStatus('Enter your private coach PIN first.','error');pin.focus();return}
    working=true;syncRun();run.textContent='Analyzing…';setStatus('Compressing the photo and sending it to the secure AI Coach…','loading');
    try{
      const image=await compressedDataUrl(currentFile);
      const body={image_data_url:image,goal:goal.value,exif:collectExif(),technical:collectTechnical(),camera:{name:'Canon EOS Rebel T7',lens:'EF-S 18–55mm f/3.5–5.6 IS II'}};
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Coach-Pin':coachPin},body:JSON.stringify(body)});
      const payload=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(payload.error||('Coach request failed ('+r.status+')'));
      render(payload.analysis||payload);setStatus('AI Photo Coach analysis complete.','success');
      try{sessionStorage.setItem('canonCoachPin',coachPin)}catch{}
    }catch(err){setStatus(err.message||'AI Coach could not analyze the photo.','error')}
    finally{working=false;run.textContent='Analyze with AI';syncRun()}
  };

  loadConfig();
})();