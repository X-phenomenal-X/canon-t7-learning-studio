(()=>{
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const edit=$('#edit'),layout=edit?.querySelector('.editor-layout'),stack=layout?.querySelector('.stack'),canvasWrap=layout?.querySelector('.canvas-wrap'),canvas=$('#canvas'),file=$('#fileInput');
  if(!edit||!layout||!stack||!canvasWrap||!canvas||!file||layout.classList.contains('editor-v2-layout'))return;
  layout.classList.add('editor-v2-layout');

  const toolbar=document.createElement('div');
  toolbar.className='editor-v2-toolbar';
  toolbar.innerHTML=`<button class="ev2-tool-btn primary" id="ev2Upload">Choose photo</button><button class="ev2-tool-btn" id="ev2Auto">Auto Fix</button><button class="ev2-tool-btn" id="ev2Compare">Compare</button><button class="ev2-tool-btn" id="ev2Export">Export</button><span class="ev2-file-status" id="ev2FileStatus">No photo loaded</span>`;
  edit.querySelector('.section-head')?.after(toolbar);

  const tabs=document.createElement('div');
  tabs.className='ev2-tabs';
  tabs.innerHTML=['Quick','Light','Color','Crop','Detail'].map((x,i)=>`<button class="ev2-tab${i===0?' active':''}" data-ev2-tab="${x.toLowerCase()}">${x}</button>`).join('');
  stack.prepend(tabs);

  const controls=$$('#editorControls .editor-control');
  const byInput={};
  controls.forEach(c=>{const i=c.querySelector('input');if(i)byInput[i.id]=c});
  const panelHost=document.createElement('div');
  panelHost.className='ev2-panels';
  tabs.after(panelHost);
  function panel(name,title,desc){const p=document.createElement('section');p.className=`ev2-panel${name==='quick'?' active':''}`;p.dataset.ev2Panel=name;p.innerHTML=`<div class="ev2-panel-head"><small>${name}</small><b>${title}</b><p>${desc}</p></div>`;panelHost.appendChild(p);return p}

  const quick=panel('quick','Start simple','Use a preset or let the app apply a balanced first pass.');
  const auto=document.createElement('div');auto.className='ev2-auto-card';auto.innerHTML='<small>SMART START</small><b>One-tap balanced edit</b><p>Uses your photo review when available. Otherwise applies a gentle general-purpose adjustment.</p><button class="button primary" id="ev2AutoInside">Apply Auto Fix</button>';quick.appendChild(auto);
  const qgrid=document.createElement('div');qgrid.className='ev2-quick-grid';qgrid.innerHTML=`<button class="ev2-preset" data-ev2-recipe="portrait"><b>Portrait Clean</b><small>Warm, gentle, natural</small></button><button class="ev2-preset" data-ev2-recipe="product"><b>Product Crisp</b><small>Detail and contrast</small></button><button class="ev2-preset" data-ev2-recipe="landscape"><b>Landscape Pop</b><small>Colour and depth</small></button><button class="ev2-preset" data-ev2-recipe="night"><b>Night Clean</b><small>Lift darker areas</small></button>`;quick.appendChild(qgrid);

  const light=panel('light','Light','Fix brightness first, then protect highlights and lift shadows.');['exposure','highlights','shadows','contrast'].forEach(id=>byInput[id]&&light.appendChild(byInput[id]));
  const color=panel('color','Color','Keep colour subtle. Small changes usually look more natural.');['warmth','saturation'].forEach(id=>byInput[id]&&color.appendChild(byInput[id]));
  const detail=panel('detail','Detail','Sharpen carefully after exposure and colour are already right.');['sharpness'].forEach(id=>byInput[id]&&detail.appendChild(byInput[id]));

  const crop=panel('crop','Crop & rotate','Choose an output shape. The crop is centered and applied when you export.');
  const cropGrid=document.createElement('div');cropGrid.className='ev2-crop-grid';cropGrid.innerHTML=`<button class="ev2-crop active" data-ratio="original">Original</button><button class="ev2-crop" data-ratio="1">Square 1:1</button><button class="ev2-crop" data-ratio="0.8">Portrait 4:5</button><button class="ev2-crop" data-ratio="1.7777778">Wide 16:9</button>`;crop.appendChild(cropGrid);
  const rotate=document.createElement('div');rotate.className='ev2-rotate-row';rotate.innerHTML='<button class="button" id="ev2RotateLeft">Rotate left</button><button class="button" id="ev2RotateRight">Rotate right</button>';crop.appendChild(rotate);

  const advanced=document.createElement('details');advanced.className='ev2-advanced';advanced.innerHTML='<summary>More controls</summary><div class="ev2-advanced-body"></div>';stack.appendChild(advanced);
  const adv=advanced.querySelector('.ev2-advanced-body');
  ['#resetBtn','#splitBtn'].forEach(sel=>{const el=$(sel);if(el)adv.appendChild(el)});
  const split=$('#splitControl');if(split)adv.appendChild(split);
  const oldRows=[...stack.querySelectorAll(':scope > .button-row')];oldRows.forEach(r=>{if(r.querySelector('#rotateLeft,#rotateRight,#compareBtn,#downloadBtn'))r.style.display='none'});
  const originalUpload=stack.querySelector('.upload');if(originalUpload)originalUpload.style.display='none';

  const overlay=document.createElement('div');overlay.className='ev2-crop-overlay';canvasWrap.appendChild(overlay);
  let cropRatio='original';
  function updateCropOverlay(){
    if(cropRatio==='original'||!canvas.width||canvas.hidden){overlay.classList.remove('show');return}
    const c=canvas.getBoundingClientRect(),w=Number(cropRatio),targetRatio=w;
    let ow=c.width,oh=ow/targetRatio;if(oh>c.height){oh=c.height;ow=oh*targetRatio}
    const wr=canvasWrap.getBoundingClientRect();overlay.style.width=ow+'px';overlay.style.height=oh+'px';overlay.style.left=(c.left-wr.left+(c.width-ow)/2)+'px';overlay.style.top=(c.top-wr.top+(c.height-oh)/2)+'px';overlay.classList.add('show');
  }
  window.addEventListener('resize',()=>requestAnimationFrame(updateCropOverlay));

  $$('.ev2-tab').forEach(b=>b.onclick=()=>{$$('.ev2-tab').forEach(x=>x.classList.toggle('active',x===b));$$('.ev2-panel').forEach(p=>p.classList.toggle('active',p.dataset.ev2Panel===b.dataset.ev2Tab));if(b.dataset.ev2Tab==='crop')requestAnimationFrame(updateCropOverlay)});
  $$('.ev2-crop').forEach(b=>b.onclick=()=>{cropRatio=b.dataset.ratio;$$('.ev2-crop').forEach(x=>x.classList.toggle('active',x===b));updateCropOverlay()});

  function setValue(id,v){const el=$('#'+id);if(!el)return;el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}
  function autoFix(){
    const score=Number(String($('#reviewScore')?.textContent||'').replace(/[^0-9.]/g,''))||0;
    if(score&&$('#applyReviewEdit')){$('#applyReviewEdit').click();return}
    const general={exposure:4,highlights:-12,shadows:8,contrast:5,warmth:1,saturation:3,sharpness:8};Object.entries(general).forEach(([k,v])=>setValue(k,v));
  }
  $('#ev2Auto').onclick=autoFix;$('#ev2AutoInside').onclick=autoFix;
  $('#ev2Upload').onclick=()=>file.click();
  $('#ev2RotateLeft').onclick=()=>$('#rotateLeft')?.click();$('#ev2RotateRight').onclick=()=>$('#rotateRight')?.click();
  $$('.ev2-preset').forEach(b=>b.onclick=()=>document.querySelector(`.recipe[data-recipe="${b.dataset.ev2Recipe}"]`)?.click());

  const compare=$('#compareBtn'),compareTop=$('#ev2Compare');
  if(compare&&compareTop){compareTop.addEventListener('pointerdown',()=>compare.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));['pointerup','pointerleave','pointercancel'].forEach(ev=>compareTop.addEventListener(ev,()=>compare.dispatchEvent(new PointerEvent(ev,{bubbles:true}))));}

  function cropCanvasSource(){
    const ratio=cropRatio==='original'?null:Number(cropRatio);if(!ratio||!canvas.width||!canvas.height)return canvas;
    let sw=canvas.width,sh=sw/ratio;if(sh>canvas.height){sh=canvas.height;sw=sh*ratio}
    const sx=(canvas.width-sw)/2,sy=(canvas.height-sh)/2,out=document.createElement('canvas');out.width=Math.round(sw);out.height=Math.round(sh);out.getContext('2d').drawImage(canvas,sx,sy,sw,sh,0,0,out.width,out.height);return out;
  }
  const exportBtn=$('#downloadBtn');
  if(exportBtn){exportBtn.onclick=()=>{if(!canvas.width)return;const splitBtn=$('#splitBtn');if(splitBtn&&/Exit split/i.test(splitBtn.textContent))splitBtn.click();const src=cropCanvasSource(),a=document.createElement('a');a.download='canon-t7-edited.jpg';a.href=src.toDataURL('image/jpeg',.94);a.click()};}
  $('#ev2Export').onclick=()=>exportBtn?.click();

  file.addEventListener('change',()=>{const f=file.files?.[0];$('#ev2FileStatus').textContent=f?f.name:'No photo loaded';setTimeout(()=>requestAnimationFrame(updateCropOverlay),300)});
  const obs=new MutationObserver(()=>requestAnimationFrame(updateCropOverlay));obs.observe(canvas,{attributes:true,attributeFilter:['width','height','style']});
})();