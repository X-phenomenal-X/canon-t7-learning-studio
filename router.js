(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const routeMap={
    home:{title:'T7 Studio',tab:'home',target:'home'},
    shoot:{title:'Guided Shoot',tab:'shoot',target:'shoot'},
    review:{title:'Photo Review',tab:'review',target:'review'},
    learn:{title:'Guide',tab:'learn',target:'learn'},
    library:{title:'Library',tab:'library',target:'library'},
    edit:{title:'Editor',tab:'review',target:'edit'},
    conditions:{title:'Photo Conditions',tab:'shoot',target:'conditions'},
    camera:{title:'Camera Controls',tab:'learn',target:'camera'},
    simulator:{title:'Exposure Simulator',tab:'learn',target:'simulator'},
    visuals:{title:'Visual Guides',tab:'learn',target:'visuals'},
    practice:{title:'Practice',tab:'learn',target:'practice'}
  };

  function currentKey(){return (location.hash||'#home').slice(1)||'home'}

  function route(){
    const requested=currentKey();
    const cfg=routeMap[requested]||routeMap.home;
    const key=routeMap[requested]?requested:'home';
    const home=$('#home');
    const screens=$$('main > .section, main > .dashboard-home');
    screens.forEach(el=>{el.classList.add('app-screen-hidden');el.classList.remove('app-screen-active')});
    $('.advanced-section')?.classList.add('app-screen-hidden');

    let target=document.getElementById(cfg.target);
    if(!target)target=home;
    target?.classList.remove('app-screen-hidden');
    target?.classList.add('app-screen-active');
    document.body.dataset.route=key;

    /* The tab title tracks the route: a browser with several tabs open, and the
       browser history, both read this. */
    document.title=key==='home'?'T7 Studio — Canon Rebel T7 photography guide':`${cfg.title} · T7 Studio`;
    const brandTitle=$('.brand b');if(brandTitle)brandTitle.textContent=cfg.title;
    const brandSub=$('.brand small');if(brandSub)brandSub.textContent=key==='home'?'Photography companion':'EOS Rebel T7';
    $$('.mobile-dock a,.desktop-nav a').forEach(a=>a.classList.remove('active'));
    $$('.mobile-dock a,.desktop-nav a').forEach(a=>{const tab=(a.getAttribute('href')||'').replace('#','');if(tab===cfg.tab)a.classList.add('active')});

    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
    window.dispatchEvent(new CustomEvent('t7-route-changed',{detail:{route:key,config:cfg}}));
  }

  document.addEventListener('click',e=>{
    const reviewButton=e.target.closest?.('#reviewShot');
    if(!reviewButton)return;
    e.preventDefault();e.stopImmediatePropagation();
    const subject=window.T7Store?.get('shootSubject',null)||null,scene=window.T7Store?.get('shootScene',null)||null;
    if(subject)window.T7Store?.set('reviewGoal',subject);
    window.T7Store?.set('reviewScene',scene||null);
    try{if(subject)localStorage.setItem('canonReviewGoal',subject)}catch{}
    location.hash='review';
    setTimeout(()=>{try{$('#fileInput')?.click()}catch{}},220);
  },true);

  window.T7Router={route,current:currentKey,routes:routeMap};
  window.addEventListener('hashchange',route);
  route();
})();