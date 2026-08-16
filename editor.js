(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const canvas=$('#canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d',{willReadFrequently:true}),placeholder=$('#placeholder'),compareTag=$('#compareTag');
  let originalImage=null,originalCanvas=document.createElement('canvas'),rotation=0,splitMode=false,splitPct=50,lastSession=null;
  const ids=['exposure','highlights','shadows','contrast','warmth','saturation','sharpness'];

  const controls=$('#editorControls');
  controls.innerHTML=ids.map(id=>`<div class="editor-control"><label><span>${id[0].toUpperCase()+id.slice(1)}</span><b id="v-${id}">0</b></label><input id="${id}" type="range" min="${id==='sharpness'?0:-100}" max="100" value="0"></div>`).join('');

  function vals(){const o={};ids.forEach(id=>o[id]=Number($('#'+id).value));return o}
  function labels(){ids.forEach(id=>$('#v-'+id).textContent=$('#'+id).value)}
  function adjust(data,v){
    const d=data.data,exp=v.exposure*2,cont=(259*(v.contrast+255))/(255*(259-v.contrast)),sat=1+v.saturation/100,w=v.warmth/100,hi=v.highlights/100,sh=v.shadows/100;
    for(let i=0;i<d.length;i+=4){
      let r=d[i]+exp,g=d[i+1]+exp,b=d[i+2]+exp;
      r=cont*(r-128)+128;g=cont*(g-128)+128;b=cont*(b-128)+128;
      const lum=.2126*r+.7152*g+.0722*b;r=lum+(r-lum)*sat;g=lum+(g-lum)*sat;b=lum+(b-lum)*sat;r+=w*18;b-=w*18;
      const L=(r+g+b)/3;
      if(hi<0&&L>150){const f=((L-150)/105)*(-hi)*.55;r-=r*f;g-=g*f;b-=b*f}else if(hi>0&&L>150){const f=((L-150)/105)*hi*.35;r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}
      if(sh>0&&L<140){const f=((140-L)/140)*sh*.65;r+=(255-r)*f*.45;g+=(255-g)*f*.45;b+=(255-b)*f*.45}else if(sh<0&&L<140){const f=((140-L)/140)*(-sh)*.55;r-=r*f;g-=g*f;b-=b*f}
      d[i]=Math.max(0,Math.min(255,r));d[i+1]=Math.max(0,Math.min(255,g));d[i+2]=Math.max(0,Math.min(255,b));
    }
    return data;
  }
  function sharpen(data,amt){if(amt<=0)return data;const w=data.width,h=data.height,src=new Uint8ClampedArray(data.data),out=data.data,a=amt/100*.5;for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const idx=(y*w+x)*4;for(let c=0;c<3;c++){const center=src[idx+c],neighbors=src[idx-4+c]+src[idx+4+c]+src[idx-w*4+c]+src[idx+w*4+c];out[idx+c]=Math.max(0,Math.min(255,center*(1+4*a)-neighbors*a))}}return data}
  function drawBase(){const swap=Math.abs(rotation)%180===90;canvas.width=swap?originalCanvas.height:originalCanvas.width;canvas.height=swap?originalCanvas.width:originalCanvas.height;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rotation*Math.PI/180);ctx.drawImage(originalCanvas,-originalCanvas.width/2,-originalCanvas.height/2);ctx.restore()}
  function editedCopy(){drawBase();let d=ctx.getImageData(0,0,canvas.width,canvas.height),v=vals();d=adjust(d,v);d=sharpen(d,v.sharpness);ctx.putImageData(d,0,0);const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;c.getContext('2d').drawImage(canvas,0,0);return c}
  function render(original=false){if(!originalImage)return;if(original){drawBase();compareTag.style.display='block';return}compareTag.style.display='none';if(splitMode){const edited=editedCopy();drawBase();const cut=Math.round(canvas.width*splitPct/100);ctx.save();ctx.beginPath();ctx.rect(cut,0,canvas.width-cut,canvas.height);ctx.clip();ctx.drawImage(edited,0,0);ctx.restore();ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(cut-1,0,2,canvas.height);return}editedCopy()}
  function reset(){ids.forEach(id=>$('#'+id).value=0);labels();rotation=0;render(false)}
  ids.forEach(id=>$('#'+id).oninput=()=>{labels();render(false)});

  $('#rotateLeft').onclick=()=>{if(originalImage){rotation=(rotation-90)%360;render(false)}};
  $('#rotateRight').onclick=()=>{if(originalImage){rotation=(rotation+90)%360;render(false)}};
  $('#resetBtn').onclick=reset;
  const cmp=$('#compareBtn');cmp.addEventListener('pointerdown',()=>render(true));['pointerup','pointerleave','pointercancel'].forEach(ev=>cmp.addEventListener(ev,()=>render(false)));
  $('#downloadBtn').onclick=()=>{if(!originalImage)return;const prev=splitMode;splitMode=false;render(false);const a=document.createElement('a');a.download='canon-t7-edited.jpg';a.href=canvas.toDataURL('image/jpeg',.94);a.click();splitMode=prev;render(false)};
  $('#splitBtn').onclick=()=>{splitMode=!splitMode;$('#splitControl').hidden=!splitMode;$('#splitBtn').textContent=splitMode?'Exit split compare':'Split before / after';render(false)};
  $('#splitSlider').oninput=e=>{splitPct=Number(e.target.value);render(false)};

  const recipes={portrait:{exposure:10,highlights:-5,shadows:8,contrast:4,warmth:6,saturation:5,sharpness:8},product:{exposure:6,highlights:-3,shadows:4,contrast:12,warmth:0,saturation:6,sharpness:20},landscape:{exposure:0,highlights:-5,shadows:10,contrast:15,warmth:2,saturation:12,sharpness:15},night:{exposure:8,highlights:-10,shadows:12,contrast:5,warmth:0,saturation:0,sharpness:10}};
  $$('.recipe').forEach(b=>b.onclick=()=>{const r=recipes[b.dataset.recipe];Object.entries(r).forEach(([k,v])=>$('#'+k).value=v);labels();render(false)});labels();

  const editSection=$('#edit'),editorLayout=editSection?.querySelector('.editor-layout');
  if(editorLayout){
    const style=document.createElement('style');style.textContent=`.exif-panel{margin-bottom:12px}.exif-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.exif-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:11px}.exif-card{background:var(--panel2);border:1px solid var(--line);border-radius:13px;padding:10px}.exif-card small{display:block;color:var(--muted);font-size:11px}.exif-card b{display:block;margin-top:3px;font-size:16px;word-break:break-word}.exif-feedback{margin-top:10px;background:#151d29;border:1px solid var(--line);border-radius:14px;padding:12px}.exif-feedback ul{margin:7px 0 0;padding-left:20px;color:var(--muted)}.exif-feedback li{margin:5px 0}.privacy-badge{font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;background:#14231b;border:1px solid #254935;color:#9fe6b8}@media(max-width:900px){.exif-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:620px){.exif-grid{grid-template-columns:repeat(2,1fr)}}`;document.head.appendChild(style);
    const panel=document.createElement('div');panel.className='card exif-panel';panel.innerHTML=`<div class="exif-top"><div><h3>Photo Settings Analyzer</h3><p>EXIF is read once from the shared local photo session and explained here.</p></div><span class="privacy-badge">PRIVATE • ON-DEVICE</span></div><div id="exifEmpty" class="tip"><b>Try it:</b> choose an original JPEG straight from your Canon T7.</div><div id="exifResults" hidden><div class="exif-grid"><div class="exif-card"><small>Camera</small><b id="exifCamera">—</b></div><div class="exif-card"><small>Lens / focal</small><b id="exifFocal">—</b></div><div class="exif-card"><small>Aperture</small><b id="exifAperture">—</b></div><div class="exif-card"><small>Shutter</small><b id="exifShutter">—</b></div><div class="exif-card"><small>ISO</small><b id="exifIso">—</b></div><div class="exif-card"><small>Captured</small><b id="exifDate">—</b></div></div><div class="exif-feedback"><b>What these settings did</b><ul id="exifAdvice"></ul></div></div>`;editorLayout.before(panel);
  }

  function shutterLabel(sec){if(!(sec>0))return'—';if(sec>=1)return(Math.round(sec*10)/10)+'s';return'1/'+Math.max(1,Math.round(1/sec))}
  function photoAdvice(x){const tips=[];if(x.focal){if(x.focal>=50)tips.push(`${Math.round(x.focal)}mm gives a tighter, more flattering perspective — useful for portraits and product detail.`);else if(x.focal<=24)tips.push(`${Math.round(x.focal)}mm is wide, so it captures more environment but can exaggerate subjects near the edges.`);else tips.push(`${Math.round(x.focal)}mm is a natural general-purpose focal length for everyday scenes.`)}if(x.aperture){if(x.aperture<=4)tips.push(`f/${Number(x.aperture).toFixed(1)} lets in plenty of light and helps separate the subject from the background.`);else if(x.aperture>=8)tips.push(`f/${Number(x.aperture).toFixed(1)} gives more depth of field, which suits landscapes and scenes where more should stay sharp.`);else tips.push(`f/${Number(x.aperture).toFixed(1)} is a balanced aperture for general shooting.`)}if(x.exposure){if(x.exposure<1/60)tips.push(`${shutterLabel(x.exposure)} is fairly slow handheld; camera shake or subject movement can blur the photo.`);else if(x.exposure>=1/500)tips.push(`${shutterLabel(x.exposure)} is fast enough to freeze a lot of everyday movement.`);else tips.push(`${shutterLabel(x.exposure)} is a practical handheld shutter speed for many still or gently moving subjects.`)}if(x.iso){if(x.iso<=400)tips.push(`ISO ${x.iso} should keep image noise relatively low in good light.`);else if(x.iso>=3200)tips.push(`ISO ${x.iso} helps in low light but can show more grain and reduce fine detail.`);else tips.push(`ISO ${x.iso} is a reasonable compromise when you need more light without slowing the shutter too much.`)}return tips.length?tips:['The file contains limited EXIF data, so there is not enough information for a detailed settings explanation.']}
  function renderExif(exif={}){const empty=$('#exifEmpty'),results=$('#exifResults'),has=exif.model||exif.exposure||exif.aperture||exif.iso||exif.focal;if(!has){if(results)results.hidden=true;if(empty){empty.hidden=false;empty.innerHTML='<b>No camera EXIF found.</b> Try an original JPEG straight from the Canon. Screenshots, social-media downloads, PNGs, and some edited exports often remove metadata.'}return}if(empty)empty.hidden=true;if(results)results.hidden=false;$('#exifCamera').textContent=[exif.make,exif.model].filter(Boolean).join(' ')||'Camera data found';$('#exifFocal').textContent=(exif.lens?exif.lens+' • ':'')+(exif.focal?`${Math.round(exif.focal*10)/10}mm`:'—');$('#exifAperture').textContent=exif.aperture?`f/${Math.round(exif.aperture*10)/10}`:'—';$('#exifShutter').textContent=shutterLabel(exif.exposure);$('#exifIso').textContent=exif.iso?`ISO ${exif.iso}`:'—';$('#exifDate').textContent=exif.date||'—';$('#exifAdvice').innerHTML=photoAdvice(exif).map(t=>`<li>${t}</li>`).join('')}

  function loadSession(session){if(!session?.workingCanvas)return;lastSession=session;originalImage=session.image||session.workingCanvas;rotation=0;originalCanvas.width=session.workingCanvas.width;originalCanvas.height=session.workingCanvas.height;originalCanvas.getContext('2d').drawImage(session.workingCanvas,0,0);ids.forEach(id=>$('#'+id).value=0);labels();if(placeholder)placeholder.hidden=true;renderExif(session.exif||{});render(false);window.dispatchEvent(new CustomEvent('t7-editor-photo-ready',{detail:session}))}
  window.addEventListener('t7-photo-ready',e=>loadSession(e.detail));
  window.addEventListener('t7-photo-error',()=>{const empty=$('#exifEmpty');if(empty){empty.hidden=false;empty.innerHTML='<b>Could not open this photo.</b> Try another JPEG.'}});
  const existing=window.T7PhotoSession?.current?.();if(existing)setTimeout(()=>loadSession(existing),0);
  window.T7EditorCore={loadSession,render,reset,current:()=>lastSession};
})();