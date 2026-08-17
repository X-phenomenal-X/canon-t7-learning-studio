(()=>{
  if(window.T7Icons)return;
  const NS='http://www.w3.org/2000/svg';
  const $=s=>document.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

  const symbols={
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9.5 20v-6h5v6"/>',
    shoot:'<path d="M4 8.5h3l1.4-2h7.2l1.4 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14.5" r="4"/><path d="M18.5 11.5h.01"/>',
    review:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m6.5 16 3.5-3.5 2.8 2.8 2.2-2.2 2.5 2.5"/><path d="m16.5 7.5 1.2 1.2 2.3-2.3"/>',
    learn:'<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v4.5c2.8 2 7.2 2 10 0V12"/><path d="M21 9v6"/>',
    library:'<rect x="3" y="5" width="14" height="14" rx="2.5"/><path d="m5.5 16 3.2-3.2 2.7 2.7 2-2 2 2"/><path d="M8 9h.01"/><path d="M18 8h3v11a2 2 0 0 1-2 2H8v-2"/>',
    camera:'<path d="M4 8.5h3l1.5-2h7l1.5 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14.5" r="4"/>',
    aperture:'<circle cx="12" cy="12" r="9"/><path d="m12 3 3.1 5.4M20.3 7.5 14 7.6M21 15h-6.2M16.5 20.3 13.3 15M7.5 20.3l3.2-5.3M3.7 16.5 10 16.4M3 9h6.2M7.5 3.7 10.7 9"/>',
    lens:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3.5V1.8M12 22.2v-1.7M3.5 12H1.8M22.2 12h-1.7"/>',
    shutter:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M7.5 3.5 9 5M16.5 3.5 15 5"/>',
    iso:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    focus:'<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/>',
    drive:'<rect x="4" y="5" width="12" height="14" rx="2"/><path d="M8 2h10a2 2 0 0 1 2 2v13"/>',
    exposure:'<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/><path d="M5.7 5.7 18.3 18.3"/>',
    wb:'<path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',
    portrait:'<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.8-4.1 3-6.2 6.5-6.2s5.7 2.1 6.5 6.2"/>',
    product:'<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/>',
    landscape:'<path d="m3 19 5.5-8 3.5 4.2 2.8-3.2L21 19H3Z"/><circle cx="17" cy="7" r="2.2"/>',
    action:'<path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/>',
    indoor:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9 20v-6h6v6"/>',
    night:'<path d="M20 15.2A8 8 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/><path d="m17.5 5 .4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4.4-1.1Z"/>',
    monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    window:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M4 12h16"/><circle cx="16" cy="8" r="1.8"/>',
    car:'<path d="M4 15v-3l2-5h12l2 5v3"/><path d="M3 15h18v4H3z"/><circle cx="6.5" cy="19" r="1.5"/><circle cx="17.5" cy="19" r="1.5"/><path d="M7 7 8.5 4h7L17 7"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    cloud:'<path d="M6.5 18h11a4 4 0 0 0 .5-8 6.2 6.2 0 0 0-11.8 1.8A3.2 3.2 0 0 0 6.5 18Z"/>',
    sunset:'<path d="M3 18h18M5 21h14M12 4v3M5.6 7.6l2.1 2.1M18.4 7.6l-2.1 2.1"/><path d="M6 18a6 6 0 0 1 12 0"/>',
    location:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"/>',
    sliders:'<path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
    wand:'<path d="m4 20 11-11"/><path d="m14 4 .6 1.7L16.3 6l-1.7.6L14 8.3l-.6-1.7L11.7 6l1.7-.3L14 4ZM19 11l.5 1.3 1.3.5-1.3.5L19 14.6l-.5-1.3-1.3-.5 1.3-.5L19 11Z"/><path d="m5 15 4 4"/>',
    compare:'<path d="M8 4H4v16h4M16 4h4v16h-4M12 3v18"/>',
    download:'<path d="M12 3v12M8 11l4 4 4-4"/><path d="M5 20h14"/>',
    upload:'<path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 20h14"/>',
    crop:'<path d="M6 2v16a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
    rotate:'<path d="M4 8V3l3 3a8 8 0 1 1-1.2 11"/>',
    palette:'<path d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.3H18A3 3 0 0 0 21 11c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.5" r="1"/><circle cx="15" cy="7" r="1"/>',
    sparkles:'<path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3ZM18.5 13l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7L5 14Z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    gauge:'<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 13 4-4"/><path d="M6 17h12"/>',
    guide:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 17h6M17 14v6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8.5"/>',
    arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    back:'<path d="M19 12H5M10 7l-5 5 5 5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
    refresh:'<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6.2 6.2L4 11M5.5 15A7 7 0 0 0 17.8 17.8L20 13"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    folder:'<path d="M3 6h7l2 2h9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/>',
    history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    bolt:'<path d="m13 2-8 12h6l-1 8 9-13h-6V2Z"/>',
    eye:'<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/>',
    grid:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>'
  };

  function installSprite(){
    if($('#t7IconSprite'))return;
    const svg=document.createElementNS(NS,'svg');svg.id='t7IconSprite';svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    const defs=document.createElementNS(NS,'defs');
    Object.entries(symbols).forEach(([name,body])=>{const sym=document.createElementNS(NS,'symbol');sym.id=`t7i-${name}`;sym.setAttribute('viewBox','0 0 24 24');sym.innerHTML=body;defs.appendChild(sym)});
    svg.appendChild(defs);document.body.prepend(svg);
  }
  function icon(name,cls=''){
    if(!symbols[name])name='sparkles';
    const svg=document.createElementNS(NS,'svg');svg.classList.add('t7-icon');if(cls)cls.split(' ').forEach(c=>c&&svg.classList.add(c));svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    const use=document.createElementNS(NS,'use');use.setAttribute('href',`#t7i-${name}`);svg.appendChild(use);return svg;
  }
  function cleanText(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function add(el,name,where='prepend',cls=''){
    if(!el||!symbols[name]||el.dataset.t7Iconized==='1')return;
    const i=icon(name,cls);where==='append'?el.appendChild(i):el.prepend(i);el.dataset.t7Iconized='1';el.classList.add('t7-has-icon');return i;
  }
  function addHeading(host,name){
    if(!host||host.querySelector(':scope > .t7-heading-icon'))return;
    const badge=document.createElement('span');badge.className='t7-heading-icon';badge.appendChild(icon(name));host.prepend(badge);host.classList.add('t7-heading-with-icon');
  }

  const routeIcons={home:'home',shoot:'shoot',review:'review',learn:'learn',library:'library',camera:'camera',simulator:'gauge',conditions:'sun',practice:'target',edit:'sliders',visuals:'guide'};
  const subjectIcons={portrait:'portrait',product:'product',landscape:'landscape',action:'action',indoor:'indoor',night:'night'};
  const sceneIcons={tvDark:'monitor',brightWindow:'window',blackCarSun:'car',indoorProduct:'product',movingCar:'car',nightHandheld:'night'};
  const labelIcons={
    'mode':'settings','lens':'lens','iso':'iso','af':'focus','autofocus':'focus','af mode':'focus','af point':'focus','drive':'drive','exposure':'exposure','shutter':'shutter','shutter speed':'shutter','aperture':'aperture','focal length':'lens','focus / detail':'focus','focus/detail':'focus','contrast':'sliders','tone range':'sun','highlights':'sun','shadows':'night','white balance':'wb','light':'sun','color':'palette','colour':'palette','crop':'crop','detail':'sparkles','camera':'camera','reshoot':'refresh','reviewed':'review','learning':'learn','recent session':'history','actual camera settings':'camera','technical trend':'gauge','skills':'target','full library':'folder'
  };
  function iconForText(text){
    const t=String(text||'').toLowerCase().trim();
    if(!t)return null;
    const entries=[
      [/^home$/, 'home'],[/^shoot$|start shooting|guided shoot|start a shoot|open guided shoot|try guided shoot/,'shoot'],[/review|analy[sz]e photo|strongest photo/,'review'],[/learn|lesson|skill/,'learn'],[/library|archive|history/,'library'],[/camera control|your camera|rebel t7|camera$/,'camera'],[/simulator|exposure simulator/,'gauge'],[/condition|golden hour|sunrise|sunset|weather|light/,'sun'],[/practice|challenge|drill/,'target'],[/edit|editor/,'sliders'],[/visual|guide|viewfinder|frame/,'guide'],[/portrait|person|people/,'portrait'],[/product|tech/,'product'],[/landscape|building/,'landscape'],[/action|movement|moving/,'action'],[/indoor|room/,'indoor'],[/night|low light/,'night'],[/tv|screen|monitor/,'monitor'],[/window/,'window'],[/car|vehicle/,'car'],[/upload|choose photo|open photo/,'upload'],[/export|download/,'download'],[/auto fix|smart start|auto/,'wand'],[/compare|before \/ after|split/,'compare'],[/crop/,'crop'],[/rotate/,'rotate'],[/reset|start over/,'refresh'],[/apply suggested edit|apply auto|apply/,'wand'],[/continue|next|resume|open|try on your t7|try focal|start$/,'arrow'],[/previous|back/,'back'],[/complete|learned|finish|done|mark/,'checkCircle'],[/cancel|clear|close/,'close'],[/delete|trash/,'trash'],[/search|check conditions/,'search'],[/use my location|location/,'location'],[/settings|setup|controls/,'settings'],[/focus|af point|autofocus/,'focus'],[/iso/,'iso'],[/aperture|f\//,'aperture'],[/shutter|1\//,'shutter'],[/lens|mm/,'lens'],[/exposure|ev/,'exposure'],[/white balance|wb/,'wb'],[/quick/,'bolt'],[/color|colour|warmth|saturation/,'palette'],[/detail|sharpness/,'sparkles'],[/grid|contact sheet/,'grid'],[/local|private/,'lock'],[/info|about/,'info']
    ];
    for(const [re,name] of entries)if(re.test(t))return name;
    return null;
  }

  function decorateNavigation(root=document){
    $$('.desktop-nav a,.mobile-dock a',root).forEach(a=>{const route=(a.getAttribute('href')||'').replace('#','');add(a,routeIcons[route]||'chevron')});
  }
  function decorateSubjects(root=document){
    $$('[data-subject]',root).forEach(el=>add(el,subjectIcons[el.dataset.subject]||iconForText(cleanText(el))||'shoot'));
    $$('[data-shot]',root).forEach(el=>add(el,subjectIcons[el.dataset.shot]||iconForText(cleanText(el))||'shoot'));
    $$('[data-scene]',root).forEach(el=>add(el,sceneIcons[el.dataset.scene]||iconForText(cleanText(el))||'sparkles'));
  }
  function decorateButtons(root=document){
    $$('a.button,button,.ev2-tool-btn,.ev2-tab,.ev2-crop,.library-mini,.cv3-tab,.cv3-control-chip,.home-v2-utility',root).forEach(el=>{
      if(el.closest('#t7IconSprite')||el.classList.contains('cv3-hotspot')||el.classList.contains('hotspot')||el.matches('[data-subject],[data-shot],[data-scene]'))return;
      const text=cleanText(el),name=iconForText(text);if(name)add(el,name);
    });
  }
  function decorateDataCards(root=document){
    $$('.review-metric,.review-exif-values>div,.rv2-setting-row>div,.library-stat,.library-skill,.home-v2-session-stat,.shoot-focus-support>div,.shoot-focus-full-grid>div,.cv3-ref,.exif-card,.weather-grid>div,.golden-grid>div',root).forEach(card=>{
      if(card.querySelector(':scope > .t7-card-icon'))return;
      const label=cleanText(card.querySelector('small,label')||card).split('•')[0].trim(),name=labelIcons[label]||iconForText(label);if(!name)return;
      const i=icon(name,'t7-card-icon');card.prepend(i);card.classList.add('t7-icon-card');
    });
  }
  function decorateMajorCards(root=document){
    const defs=[
      ['.home-v2-next','target'],['.home-v2-recent','history'],['.home-v2-light','sun'],['.home-v2-learning','learn'],
      ['.review-exif-audit','camera'],['.review-next','arrow'],['.reshoot-flow','refresh'],['.library-reshoot','refresh'],['.library-list-card','grid'],
      ['.lv2-challenge','target'],['.lv2-t7','camera'],['.ev2-auto-card','wand'],['.conditions-v2','sun'],['.cv3-tour','target'],['.cv3-reference','settings']
    ];
    defs.forEach(([sel,name])=>$$(`${sel}`,root).forEach(el=>{if(el.querySelector(':scope > .t7-corner-icon'))return;const b=document.createElement('span');b.className='t7-corner-icon';b.appendChild(icon(name));el.prepend(b)}));
  }
  function decorateHeadings(root=document){
    const defs=[
      ['#home .home-v2-hero-copy','shoot'],['#shoot .shoot-flow-head>div','#shoot'],['#review .rv2-head>div','review'],['#learn .learn-v2-head>div','learn'],['#library .library-hero>div','library'],['#conditions .cv2-hero>div','sun'],['#camera .cv3-hero>div','camera'],['#edit .section-head>div','sliders'],['#simulator .section-head>div','gauge'],['#practice .section-head>div','target'],['#visuals .section-head>div','guide']
    ];
    defs.forEach(([sel,name])=>{const host=$(sel);if(host)addHeading(host,name==='#shoot'?'shoot':name)});
    // fallback section heads
    $$('.section-head>div',root).forEach(host=>{if(host.querySelector(':scope > .t7-heading-icon'))return;const h=host.querySelector('h1,h2,h3'),name=iconForText(cleanText(h));if(name)addHeading(host,name)});
  }
  function decorateSpecial(root=document){
    // Editor tabs get fixed semantics rather than text heuristics.
    const editorTabs={quick:'bolt',light:'sun',color:'palette',crop:'crop',detail:'sparkles'};
    $$('.ev2-tab',root).forEach(el=>{const k=el.dataset.ev2Tab; if(k&&editorTabs[k]&&!el.dataset.t7Iconized)add(el,editorTabs[k])});
    // Camera views and key physical controls.
    $$('.cv3-tab',root).forEach(el=>{const t=cleanText(el);if(t.includes('back'))add(el,'back');else if(t.includes('top'))add(el,'camera');else if(t.includes('lens'))add(el,'lens')});
    $$('.cv3-control-chip',root).forEach(el=>{const t=cleanText(el);let n=iconForText(t);if(t.includes('mode dial'))n='settings';if(t.includes('main dial'))n='sliders';if(t.includes('quick control'))n='bolt';if(t.includes('av ±'))n='exposure';if(t.includes('live view'))n='eye';if(t.includes('drive'))n='drive';if(t.includes('white balance'))n='wb';if(t.includes('stabilizer'))n='focus';if(n)add(el,n)});
    // Library archive summary.
    $$('.qa-library-archive>summary',root).forEach(el=>add(el,'folder'));
    // Review scene badge and privacy/status pills.
    $$('.review-scene-context,.review-badge,.library-local,.privacy-badge',root).forEach(el=>{if(!el.querySelector(':scope > .t7-status-icon')){const i=icon(cleanText(el).includes('scene')?'sparkles':'lock','t7-status-icon');el.prepend(i)}});
    // Progress / done markers.
    $$('.task input:checked',root).forEach(input=>input.closest('.task')?.classList.add('t7-task-done'));
  }
  function decorate(root=document){
    installSprite();decorateNavigation(root);decorateSubjects(root);decorateButtons(root);decorateDataCards(root);decorateMajorCards(root);decorateHeadings(root);decorateSpecial(root);
  }

  installSprite();decorate();
  let queued=false;
  const observer=new MutationObserver(muts=>{
    let relevant=false;for(const m of muts){if(m.addedNodes.length||m.type==='characterData'){relevant=true;break}}
    if(!relevant||queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()});
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('t7-route-changed',()=>setTimeout(()=>decorate(),0));
  window.addEventListener('t7-history-updated',()=>setTimeout(()=>decorate(),30));
  window.addEventListener('t7-review-updated',()=>setTimeout(()=>decorate(),30));
  window.T7Icons={icon,add,decorate,version:'1.0.0'};
})();