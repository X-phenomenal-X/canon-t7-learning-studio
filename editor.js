(()=>{
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const canvas=$('#canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const fileInput=$('#fileInput'), placeholder=$('#placeholder'), compareTag=$('#compareTag');
  let originalImage=null, originalCanvas=document.createElement('canvas'), rotation=0, splitMode=false, splitPct=50;
  const ids=['exposure','highlights','shadows','contrast','warmth','saturation','sharpness'];
  let coachFile=null,lastExif=null,coachEndpoint='';

  const controls=$('#editorControls');
  controls.innerHTML=ids.map(id=>`<div class="editor-control"><label><span>${id[0].toUpperCase()+id.slice(1)}</span><b id="v-${id}">0</b></label><input id="${id}" type="range" min="${id==='sharpness'?0:-100}" max="100" value="0"></div>`).join('');

  function vals(){const o={};ids.forEach(id=>o[id]=Number($('#'+id).value));return o}
  function labels(){ids.forEach(id=>$('#v-'+id).textContent=$('#'+id).value)}
  function adjust(data,v){
    const d=data.data,exp=v.exposure*2,cont=(259*(v.contrast+255))/(255*(259-v.contrast)),sat=1+v.saturation/100,w=v.warmth/100,hi=v.highlights/100,sh=v.shadows/100;
    for(let i=0;i<d.length;i+=4){
      let r=d[i]+exp,g=d[i+1]+exp,b=d[i+2]+exp;
      r=cont*(r-128)+128;g=cont*(g-128)+128;b=cont*(b-128)+128;
      const lum=.2126*r+.7152*g+.0722*b;
      r=lum+(r-lum)*sat;g=lum+(g-lum)*sat;b=lum+(b-lum)*sat;
      r+=w*18;b-=w*18;
      const L=(r+g+b)/3;
      if(hi<0&&L>150){const f=((L-150)/105)*(-hi)*.55;r-=r*f;g-=g*f;b-=b*f}
      else if(hi>0&&L>150){const f=((L-150)/105)*hi*.35;r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}
      if(sh>0&&L<140){const f=((140-L)/140)*sh*.65;r+=(255-r)*f*.45;g+=(255-g)*f*.45;b+=(255-b)*f*.45}
      else if(sh<0&&L<140){const f=((140-L)/140)*(-sh)*.55;r-=r*f;g-=g*f;b-=b*f}
      d[i]=Math.max(0,Math.min(255,r));d[i+1]=Math.max(0,Math.min(255,g));d[i+2]=Math.max(0,Math.min(255,b));
    }
    return data;
  }
  function sharpen(data,amt){
    if(amt<=0)return data;
    const w=data.width,h=data.height,src=new Uint8ClampedArray(data.data),out=data.data,a=amt/100*.5;
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const idx=(y*w+x)*4;
      for(let c=0;c<3;c++){
        const center=src[idx+c],neighbors=src[idx-4+c]+src[idx+4+c]+src[idx-w*4+c]+src[idx+w*4+c];
        out[idx+c]=Math.max(0,Math.min(255,center*(1+4*a)-neighbors*a));
      }
    }
    return data;
  }
  function drawBase(){
    const swap=Math.abs(rotation)%180===90;
    canvas.width=swap?originalCanvas.height:originalCanvas.width;
    canvas.height=swap?originalCanvas.width:originalCanvas.height;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rotation*Math.PI/180);
    ctx.drawImage(originalCanvas,-originalCanvas.width/2,-originalCanvas.height/2);ctx.restore();
  }
  function editedCopy(){
    drawBase();
    let d=ctx.getImageData(0,0,canvas.width,canvas.height),v=vals();
    d=adjust(d,v);d=sharpen(d,v.sharpness);ctx.putImageData(d,0,0);
    const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;c.getContext('2d').drawImage(canvas,0,0);return c;
  }
  function render(original=false){
    if(!originalImage)return;
    if(original){drawBase();compareTag.style.display='block';return}
    compareTag.style.display='none';
    if(splitMode){
      const edited=editedCopy();drawBase();const cut=Math.round(canvas.width*splitPct/100);
      ctx.save();ctx.beginPath();ctx.rect(cut,0,canvas.width-cut,canvas.height);ctx.clip();ctx.drawImage(edited,0,0);ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(cut-1,0,2,canvas.height);return;
    }
    editedCopy();
  }
  function reset(){ids.forEach(id=>$('#'+id).value=0);labels();rotation=0;render(false)}
  ids.forEach(id=>$('#'+id).oninput=()=>{labels();render(false)});

  fileInput.onchange=e=>{
    const file=e.target.files?.[0]; if(!file)return;
    coachFile=file;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        originalImage=img;rotation=0;
        const maxW=1600,maxH=1200;let w=img.width,h=img.height,sc=Math.min(1,maxW/w,maxH/h);w=Math.round(w*sc);h=Math.round(h*sc);
        originalCanvas.width=w;originalCanvas.height=h;originalCanvas.getContext('2d').drawImage(img,0,0,w,h);
        ids.forEach(id=>$('#'+id).value=0);labels();placeholder.hidden=true;render(false);
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  $('#rotateLeft').onclick=()=>{if(originalImage){rotation=(rotation-90)%360;render(false)}};
  $('#rotateRight').onclick=()=>{if(originalImage){rotation=(rotation+90)%360;render(false)}};
  $('#resetBtn').onclick=reset;
  const cmp=$('#compareBtn');
  cmp.addEventListener('pointerdown',()=>render(true));
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>cmp.addEventListener(ev,()=>render(false)));
  $('#downloadBtn').onclick=()=>{
    if(!originalImage)return;
    const prev=splitMode;splitMode=false;render(false);
    const a=document.createElement('a');a.download='canon-t7-edited.jpg';a.href=canvas.toDataURL('image/jpeg',.94);a.click();
    splitMode=prev;render(false);
  };
  $('#splitBtn').onclick=()=>{splitMode=!splitMode;$('#splitControl').hidden=!splitMode;$('#splitBtn').textContent=splitMode?'Exit split compare':'Split before / after';render(false)};
  $('#splitSlider').oninput=e=>{splitPct=Number(e.target.value);render(false)};

  const recipes={
    portrait:{exposure:10,highlights:-5,shadows:8,contrast:4,warmth:6,saturation:5,sharpness:8},
    product:{exposure:6,highlights:-3,shadows:4,contrast:12,warmth:0,saturation:6,sharpness:20},
    landscape:{exposure:0,highlights:-5,shadows:10,contrast:15,warmth:2,saturation:12,sharpness:15},
    night:{exposure:8,highlights:-10,shadows:12,contrast:5,warmth:0,saturation:0,sharpness:10}
  };
  $$('.recipe').forEach(b=>b.onclick=()=>{const r=recipes[b.dataset.recipe];Object.entries(r).forEach(([k,v])=>$('#'+k).value=v);labels();render(false)});
  labels();

  // EXIF analyzer — all metadata parsing stays on the user's device.
  const editSection=$('#edit');
  const editorLayout=editSection?.querySelector('.editor-layout');
  if(editorLayout){
    const style=document.createElement('style');
    style.textContent=`
      .exif-panel{margin-bottom:12px}
      .exif-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
      .exif-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:11px}
      .exif-card{background:var(--panel2);border:1px solid var(--line);border-radius:13px;padding:10px}
      .exif-card small{display:block;color:var(--muted);font-size:11px}.exif-card b{display:block;margin-top:3px;font-size:16px;word-break:break-word}
      .exif-feedback{margin-top:10px;background:#151d29;border:1px solid var(--line);border-radius:14px;padding:12px}
      .exif-feedback ul{margin:7px 0 0;padding-left:20px;color:var(--muted)}.exif-feedback li{margin:5px 0}
      .privacy-badge{font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;background:#14231b;border:1px solid #254935;color:#9fe6b8}
      @media(max-width:900px){.exif-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:620px){.exif-grid{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(style);
    const panel=document.createElement('div');
    panel.className='card exif-panel';
    panel.innerHTML=`
      <div class="exif-top">
        <div><h3>Photo Settings Analyzer</h3><p>Upload a camera JPEG below. The app reads its EXIF metadata locally and explains the settings.</p></div>
        <span class="privacy-badge">PRIVATE • ON-DEVICE</span>
      </div>
      <div id="exifEmpty" class="tip"><b>Try it:</b> tap <em>Upload photo</em> below and choose a JPEG straight from your Canon T7.</div>
      <div id="exifResults" hidden>
        <div class="exif-grid">
          <div class="exif-card"><small>Camera</small><b id="exifCamera">—</b></div>
          <div class="exif-card"><small>Lens / focal</small><b id="exifFocal">—</b></div>
          <div class="exif-card"><small>Aperture</small><b id="exifAperture">—</b></div>
          <div class="exif-card"><small>Shutter</small><b id="exifShutter">—</b></div>
          <div class="exif-card"><small>ISO</small><b id="exifIso">—</b></div>
          <div class="exif-card"><small>Captured</small><b id="exifDate">—</b></div>
        </div>
        <div class="exif-feedback"><b>What these settings did</b><ul id="exifAdvice"></ul></div>
      </div>
    `;
    editorLayout.before(panel);
  }

  function textAt(view,start,count){
    let s='';for(let i=0;i<count;i++){const c=view.getUint8(start+i);if(c===0)break;s+=String.fromCharCode(c)}return s.trim();
  }
  function parseExif(buffer){
    const view=new DataView(buffer);
    if(view.byteLength<4||view.getUint16(0,false)!==0xFFD8)return {};
    let offset=2;
    while(offset+4<view.byteLength){
      if(view.getUint8(offset)!==0xFF){offset++;continue}
      const marker=view.getUint8(offset+1);
      if(marker===0xDA||marker===0xD9)break;
      const size=view.getUint16(offset+2,false);
      if(marker===0xE1&&offset+4+size<=view.byteLength&&textAt(view,offset+4,4)==='Exif'){
        const tiff=offset+10;
        const endian=view.getUint16(tiff,false);
        const little=endian===0x4949;
        if(!little&&endian!==0x4D4D)return {};
        const u16=p=>view.getUint16(p,little),u32=p=>view.getUint32(p,little),i32=p=>view.getInt32(p,little);
        if(u16(tiff+2)!==42)return {};
        const typeSize={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8};
        function valueAt(entry,type,count){
          const bytes=(typeSize[type]||1)*count;
          const pos=bytes<=4?entry+8:tiff+u32(entry+8);
          if(pos<0||pos+Math.max(1,bytes)>view.byteLength)return null;
          if(type===2)return textAt(view,pos,count);
          if(type===3)return u16(pos);
          if(type===4)return u32(pos);
          if(type===5){const n=u32(pos),d=u32(pos+4);return d?n/d:null}
          if(type===9)return i32(pos);
          if(type===10){const n=i32(pos),d=i32(pos+4);return d?n/d:null}
          return null;
        }
        function readIFD(pos){
          const out={};
          if(pos<0||pos+2>view.byteLength)return out;
          const n=u16(pos);
          for(let i=0;i<n;i++){
            const e=pos+2+i*12;if(e+12>view.byteLength)break;
            const tag=u16(e),type=u16(e+2),count=u32(e+4);
            out[tag]=valueAt(e,type,count);
          }
          return out;
        }
        const root=readIFD(tiff+u32(tiff+4));
        const exifPtr=root[0x8769];
        const exif=typeof exifPtr==='number'?readIFD(tiff+exifPtr):{};
        return {make:root[0x010F]||'',model:root[0x0110]||'',date:exif[0x9003]||root[0x0132]||'',exposure:exif[0x829A],aperture:exif[0x829D],iso:exif[0x8827],focal:exif[0x920A],lens:exif[0xA434]||''};
      }
      if(!size||size<2)break;
      offset+=2+size;
    }
    return {};
  }
  function shutterLabel(sec){
    if(!(sec>0))return '—';
    if(sec>=1)return (Math.round(sec*10)/10)+'s';
    return '1/'+Math.max(1,Math.round(1/sec));
  }
  function photoAdvice(x){
    const tips=[];
    if(x.focal){
      if(x.focal>=50)tips.push(`${Math.round(x.focal)}mm gives a tighter, more flattering perspective — useful for portraits and product detail.`);
      else if(x.focal<=24)tips.push(`${Math.round(x.focal)}mm is wide, so it captures more environment but can exaggerate subjects near the edges.`);
      else tips.push(`${Math.round(x.focal)}mm is a natural general-purpose focal length for everyday scenes.`);
    }
    if(x.aperture){
      if(x.aperture<=4)tips.push(`f/${Number(x.aperture).toFixed(1)} lets in plenty of light and helps separate the subject from the background.`);
      else if(x.aperture>=8)tips.push(`f/${Number(x.aperture).toFixed(1)} gives more depth of field, which suits landscapes and scenes where more should stay sharp.`);
      else tips.push(`f/${Number(x.aperture).toFixed(1)} is a balanced aperture for general shooting.`);
    }
    if(x.exposure){
      if(x.exposure<1/60)tips.push(`${shutterLabel(x.exposure)} is fairly slow handheld; camera shake or subject movement can blur the photo.`);
      else if(x.exposure>=1/500)tips.push(`${shutterLabel(x.exposure)} is fast enough to freeze a lot of everyday movement.`);
      else tips.push(`${shutterLabel(x.exposure)} is a practical handheld shutter speed for many still or gently moving subjects.`);
    }
    if(x.iso){
      if(x.iso<=400)tips.push(`ISO ${x.iso} should keep image noise relatively low in good light.`);
      else if(x.iso>=3200)tips.push(`ISO ${x.iso} helps in low light but can show more grain and reduce fine detail.`);
      else tips.push(`ISO ${x.iso} is a reasonable compromise when you need more light without slowing the shutter too much.`);
    }
    return tips.length?tips:['The file contains limited EXIF data, so there is not enough information for a detailed settings explanation.'];
  }

  fileInput.addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    const empty=$('#exifEmpty'),results=$('#exifResults');
    if(empty)empty.innerHTML='<b>Reading settings…</b> Metadata stays on this device.';
    try{
      const exif=parseExif(await file.arrayBuffer());
      lastExif=exif;
      const has=exif.model||exif.exposure||exif.aperture||exif.iso||exif.focal;
      if(!has){
        if(results)results.hidden=true;
        if(empty)empty.innerHTML='<b>No camera EXIF found.</b> Try an original JPEG straight from the Canon. Screenshots, social-media downloads, PNGs, and some edited exports often remove metadata.';
        return;
      }
      if(empty)empty.hidden=true;if(results)results.hidden=false;
      $('#exifCamera').textContent=[exif.make,exif.model].filter(Boolean).join(' ')||'Camera data found';
      $('#exifFocal').textContent=(exif.lens?exif.lens+' • ':'')+(exif.focal?`${Math.round(exif.focal*10)/10}mm`:'—');
      $('#exifAperture').textContent=exif.aperture?`f/${Math.round(exif.aperture*10)/10}`:'—';
      $('#exifShutter').textContent=shutterLabel(exif.exposure);
      $('#exifIso').textContent=exif.iso?`ISO ${exif.iso}`:'—';
      $('#exifDate').textContent=exif.date||'—';
      $('#exifAdvice').innerHTML=photoAdvice(exif).map(t=>`<li>${t}</li>`).join('');
    }catch(err){
      if(results)results.hidden=true;
      if(empty){empty.hidden=false;empty.innerHTML='<b>Could not read EXIF metadata.</b> The editor can still open the photo.';}
    }
  });

  // AI Photo Coach. The frontend never contains the OpenAI API key.
  // It calls a small Supabase Edge Function configured in coach-config.json.
  if(editSection && editorLayout){
    const aiStyle=document.createElement('style');
    aiStyle.textContent=`
      .coach-panel{margin-bottom:12px;background:linear-gradient(135deg,#141d2a,#101722)}
      .coach-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}
      .coach-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
      .coach-score{background:var(--panel2);border:1px solid var(--line);border-radius:13px;padding:10px}
      .coach-score small{display:block;color:var(--muted);font-size:11px}.coach-score b{display:block;font-size:22px;margin-top:3px}
      .coach-actions{display:grid;grid-template-columns:1fr 180px auto;gap:8px;margin-top:10px}
      .coach-actions select,.coach-actions input{width:100%;background:var(--panel2);color:#fff;border:1px solid var(--line);border-radius:10px;padding:10px}
      .coach-status{margin-top:9px}
      .coach-result{margin-top:10px;display:grid;gap:9px}
      .coach-result-box{background:#151d29;border:1px solid var(--line);border-radius:14px;padding:12px}
      .coach-result-box h4{margin:0 0 6px}.coach-result-box ul{margin:5px 0 0;padding-left:20px;color:var(--muted)}.coach-result-box li{margin:5px 0}
      .coach-next{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px}
      .coach-next div{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:9px}.coach-next small{display:block;color:var(--muted);font-size:11px}
      @media(max-width:800px){.coach-grid,.coach-next{grid-template-columns:repeat(2,1fr)}.coach-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(aiStyle);

    const coach=document.createElement('div');
    coach.className='card coach-panel';
    coach.innerHTML=`
      <div class="coach-head">
        <div><span class="tag">AI PHOTO COACH</span><h3 style="margin-top:8px">Get feedback on your real photo</h3><p>Upload the photo below, choose what you were trying to shoot, then get practical Canon T7 feedback.</p></div>
        <span class="privacy-badge">OPENAI • SECURE BACKEND</span>
      </div>
      <div class="coach-actions">
        <select id="coachGoal">
          <option value="general">General photography</option>
          <option value="portrait">Portrait</option>
          <option value="product">Product / tech</option>
          <option value="landscape">Landscape / architecture</option>
          <option value="action">Action / moving subject</option>
          <option value="night">Night / low light</option>
        </select>
        <input id="coachPin" type="password" inputmode="numeric" autocomplete="off" placeholder="Private coach PIN">
        <button id="coachAnalyze" class="button primary">Analyze photo</button>
      </div>
      <div id="coachStatus" class="tip coach-status"><b>Setup pending:</b> the secure AI backend has not been connected yet.</div>
      <div id="coachResults" class="coach-result" hidden>
        <div class="coach-grid">
          <div class="coach-score"><small>Focus / sharpness</small><b id="coachFocus">—</b></div>
          <div class="coach-score"><small>Exposure</small><b id="coachExposure">—</b></div>
          <div class="coach-score"><small>Composition</small><b id="coachComposition">—</b></div>
          <div class="coach-score"><small>Lighting</small><b id="coachLighting">—</b></div>
        </div>
        <div class="coach-result-box"><h4 id="coachSummary">Coach summary</h4><p id="coachSummaryText"></p></div>
        <div class="coach-result-box"><h4>What worked</h4><ul id="coachStrengths"></ul></div>
        <div class="coach-result-box"><h4>Improve on the next attempt</h4><ul id="coachImprove"></ul></div>
        <div class="coach-result-box"><h4>Try these T7 settings next</h4>
          <div class="coach-next">
            <div><small>Mode</small><b id="coachMode">—</b></div>
            <div><small>Lens</small><b id="coachLens">—</b></div>
            <div><small>Exposure</small><b id="coachSettings">—</b></div>
            <div><small>ISO</small><b id="coachIso">—</b></div>
          </div>
          <p id="coachNextTip"></p>
        </div>
      </div>
    `;
    editorLayout.before(coach);

    try{
      const savedPin=localStorage.getItem('canonCoachPin')||'';
      if(savedPin)$('#coachPin').value=savedPin;
    }catch{}

    fetch('./coach-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(cfg=>{
      coachEndpoint=cfg.endpoint||'';
      const st=$('#coachStatus');
      if(coachEndpoint){
        st.innerHTML='<b>Ready.</b> Upload a photo, choose the goal, and tap Analyze photo.';
      }
    }).catch(()=>{});

    function fileToCoachImage(file){
      return new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onerror=reject;
        reader.onload=e=>{
          const img=new Image();
          img.onerror=reject;
          img.onload=()=>{
            const max=1400,scale=Math.min(1,max/Math.max(img.width,img.height));
            const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
            const c=document.createElement('canvas');c.width=w;c.height=h;
            c.getContext('2d').drawImage(img,0,0,w,h);
            resolve(c.toDataURL('image/jpeg',.82));
          };
          img.src=e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    function score(v){const n=Number(v);return Number.isFinite(n)?Math.max(1,Math.min(10,Math.round(n)))+'/10':'—'}
    function list(el,items){el.innerHTML=(Array.isArray(items)?items:[]).map(x=>`<li>${String(x)}</li>`).join('')}
    function renderCoach(data){
      $('#coachResults').hidden=false;
      $('#coachFocus').textContent=score(data.scores?.focus);
      $('#coachExposure').textContent=score(data.scores?.exposure);
      $('#coachComposition').textContent=score(data.scores?.composition);
      $('#coachLighting').textContent=score(data.scores?.lighting);
      $('#coachSummary').textContent=data.title||'Coach summary';
      $('#coachSummaryText').textContent=data.summary||'';
      list($('#coachStrengths'),data.strengths);
      list($('#coachImprove'),data.improvements);
      const next=data.next_shot||{};
      $('#coachMode').textContent=next.mode||'—';
      $('#coachLens').textContent=next.lens||'—';
      $('#coachSettings').textContent=next.exposure||'—';
      $('#coachIso').textContent=next.iso||'—';
      $('#coachNextTip').textContent=next.tip||'';
    }

    $('#coachAnalyze').onclick=async()=>{
      const st=$('#coachStatus'),pin=$('#coachPin').value.trim();
      if(!coachEndpoint){st.innerHTML='<b>AI backend is not connected yet.</b> The frontend is installed, but the secure server function still needs deployment.';return}
      if(!coachFile){st.innerHTML='<b>Upload a photo first.</b> Use the Upload photo control directly below this panel.';return}
      if(!pin){st.innerHTML='<b>Enter your private coach PIN.</b> This protects your API credits on the public website.';return}
      try{localStorage.setItem('canonCoachPin',pin)}catch{}
      const btn=$('#coachAnalyze');btn.disabled=true;btn.textContent='Analyzing…';
      st.innerHTML='<b>Looking at your photo…</b> Checking visible sharpness, exposure, composition, lighting, and your camera settings.';
      try{
        const image=await fileToCoachImage(coachFile);
        const payload={
          image,
          goal:$('#coachGoal').value,
          exif:lastExif||{},
          filename:coachFile.name
        };
        const res=await fetch(coachEndpoint,{
          method:'POST',
          headers:{'Content-Type':'application/json','x-coach-pin':pin},
          body:JSON.stringify(payload)
        });
        const data=await res.json().catch(()=>({}));
        if(!res.ok)throw new Error(data.error||'Coach request failed');
        renderCoach(data);
        st.innerHTML='<b>Analysis complete.</b> Use the next-shot settings as a starting point, not an absolute rule.';
      }catch(err){
        st.innerHTML='<b>Could not analyze the photo.</b> '+(err?.message||'Try again.');
      }finally{
        btn.disabled=false;btn.textContent='Analyze photo';
      }
    };
  }
})();
