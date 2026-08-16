(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const home=$('#home');if(!home)return;
  const hour=new Date().getHours();
  const hello=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';

  home.className='dashboard-home native-home';
  home.innerHTML=`
    <div class="native-greeting">
      <div><small>${hello}</small><h1>Your T7, made simpler.</h1></div>
      <span class="native-camera">EOS Rebel T7 · 18–55mm</span>
    </div>

    <a class="native-shoot-card" href="#shoot">
      <div class="native-shoot-copy">
        <span class="native-label">GUIDED SHOOT</span>
        <h2>Start with the photo, not the settings.</h2>
        <p>Tell the app what you're shooting and get one clear setup for your Rebel T7.</p>
        <span class="native-shoot-cta">Start shooting <b>→</b></span>
      </div>
    </a>

    <a class="native-progress-row" id="homeContinueSecondary" href="#learn">
      <div class="native-progress-ring" id="homeRing" style="--pct:0"><b id="homePct">0%</b></div>
      <div class="native-progress-copy">
        <small>Continue</small>
        <b id="homeNextTitle">Learn the camera basics</b>
        <span id="homeNextDesc" hidden>Start with the controls you use most.</span>
        <span id="homeControls" hidden>0 / 8 explored</span>
        <span id="homeSimulator" hidden>0 / 3 tried</span>
        <span id="homePractice" hidden>0 / 7 complete</span>
      </div>
      <span class="native-progress-arrow">›</span>
    </a>
    <a id="homeContinue" href="#learn" hidden>Continue learning</a>

    <div class="native-section-title"><h2>Choose a task</h2></div>
    <div class="native-actions">
      <a class="native-action review" href="#review"><span class="native-action-mark">✓</span><div><b>Review a photo</b><small>See what to improve next.</small></div></a>
      <a class="native-action learn" href="#learn"><span class="native-action-mark">L</span><div><b>Learn</b><small>Short visual lessons.</small></div></a>
      <a class="native-action conditions" href="#conditions"><span class="native-action-mark">☼</span><div><b>Conditions</b><small>Light and golden hour.</small></div></a>
      <a class="native-action" href="#edit"><span class="native-action-mark">E</span><div><b>Edit</b><small>Finish your best shot.</small></div></a>
    </div>

    <section class="native-latest">
      <div class="native-latest-head"><h2>Latest photo</h2><a href="#review">View review</a></div>
      <div class="recent-photo-empty"><div><b>No reviewed photo yet</b><p>Upload a Canon JPEG and your latest result will stay here.</p></div><a class="button" href="#review">Upload</a></div>
    </section>`;

  const routeMap={
    home:{title:'T7 Studio',tab:'home'},shoot:{title:'Guided Shoot',tab:'shoot'},review:{title:'Photo Review',tab:'review'},learn:{title:'Learn',tab:'learn'},edit:{title:'Editor',tab:'edit'},conditions:{title:'Photo Conditions',tab:'shoot'},camera:{title:'Camera Controls',tab:'learn'},simulator:{title:'Exposure Simulator',tab:'learn'},visuals:{title:'Visual Guides',tab:'learn'},practice:{title:'Practice',tab:'learn'}
  };
  function route(){
    const key=(location.hash||'#home').slice(1)||'home';
    const cfg=routeMap[key]||routeMap.home;
    const sections=$$('main > section.section, main > section.dashboard-home');
    sections.forEach(el=>{el.classList.add('app-screen-hidden');el.classList.remove('app-screen-active')});
    $('.advanced-section')?.classList.add('app-screen-hidden');
    let target=key==='review'?$('#edit'):document.getElementById(key);
    if(!target)target=home;
    target.classList.remove('app-screen-hidden');target.classList.add('app-screen-active');
    document.body.dataset.route=key;

    const brandTitle=$('.brand b');if(brandTitle)brandTitle.textContent=cfg.title;
    const brandSub=$('.brand small');if(brandSub)brandSub.textContent=key==='home'?'Photography companion':'EOS Rebel T7';
    $$('.mobile-dock a,.desktop-nav a').forEach(a=>a.classList.remove('active'));
    $$('.mobile-dock a,.desktop-nav a').forEach(a=>{const k=(a.getAttribute('href')||'').replace('#','');if(k===cfg.tab)a.classList.add('active')});
    requestAnimationFrame(()=>{
      if(key==='review'){$('#review')?.scrollIntoView({block:'start'});}
      else window.scrollTo({top:0,left:0,behavior:'instant'});
    });
  }
  window.addEventListener('hashchange',route);
  const mo=new MutationObserver(()=>{const key=(location.hash||'#home').slice(1);if(['review','learn'].includes(key))route()});
  mo.observe($('main'),{childList:true,subtree:true});
  route();
})();