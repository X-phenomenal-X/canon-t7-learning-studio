(()=>{
  const home=document.querySelector('#home');
  if(!home)return;
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  home.className='dashboard-home v2';
  home.innerHTML=`
    <div class="v2-welcome">
      <div><small>${greeting}</small><b>Ready to shoot?</b></div>
      <span class="v2-camera-badge">EOS Rebel T7 • 18–55mm</span>
    </div>

    <section class="v2-hero">
      <div class="v2-hero-copy">
        <span class="v2-kicker">GUIDED PHOTOGRAPHY</span>
        <h1>Make the next photo better.</h1>
        <p>Choose what you're shooting. Get one clear T7 setup. Review the result and improve.</p>
        <div class="v2-hero-actions">
          <a class="v2-primary" href="#shoot">Start a shoot <span>→</span></a>
          <a class="v2-secondary" id="homeContinue" href="#learn">Continue learning</a>
        </div>
      </div>
    </section>

    <a class="v2-progress" id="homeContinueSecondary" href="#learn">
      <div class="v2-progress-ring" id="homeRing" style="--pct:0"><b id="homePct">0%</b></div>
      <div class="v2-progress-copy">
        <small>Next step</small>
        <b id="homeNextTitle">Explore the camera</b>
        <span id="homeNextDesc" style="display:none">Start with the controls you use most.</span>
        <span style="display:none" id="homeControls">0 / 8 explored</span>
        <span style="display:none" id="homeSimulator">0 / 3 tried</span>
        <span style="display:none" id="homePractice">0 / 7 complete</span>
      </div>
      <span class="v2-progress-next">›</span>
    </a>

    <div class="v2-section-title"><h2>What do you want to do?</h2></div>
    <div class="v2-actions">
      <a class="v2-action shoot" href="#shoot"><span class="icon">◎</span><div><b>Shoot</b><small>Get the right T7 setup.</small></div></a>
      <a class="v2-action review" href="#review"><span class="icon">✓</span><div><b>Review</b><small>Check a photo and improve it.</small></div></a>
      <a class="v2-action learn" href="#learn"><span class="icon">◫</span><div><b>Learn</b><small>Short visual lessons.</small></div></a>
      <a class="v2-action conditions" href="#conditions"><span class="icon">☼</span><div><b>Conditions</b><small>Light, weather, golden hour.</small></div></a>
    </div>

    <section class="v2-recent">
      <div class="v2-recent-head"><h2>Latest photo</h2><a href="#review">Open review →</a></div>
      <div class="recent-photo-empty">
        <div><b>No photo reviewed yet</b><p>Your latest T7 shot and score will appear here.</p></div>
        <a class="button" href="#edit">Upload</a>
      </div>
    </section>`;

  function route(){
    const route=(location.hash||'#home').slice(1)||'home';
    const top=[...document.querySelectorAll('main > section.section, main > section.dashboard-home')];
    top.forEach(el=>{el.classList.add('app-screen-hidden');el.classList.remove('app-screen-active')});
    document.querySelector('.advanced-section')?.classList.add('app-screen-hidden');
    let target=route==='review'?document.querySelector('#edit'):document.getElementById(route);
    if(!target)target=document.querySelector('#home');
    target.classList.remove('app-screen-hidden');target.classList.add('app-screen-active');
    document.body.dataset.route=route;
    requestAnimationFrame(()=>{
      if(route==='review')document.querySelector('#review')?.scrollIntoView({block:'start'});
      else window.scrollTo({top:0,behavior:'instant'});
    });
  }
  window.addEventListener('hashchange',route);
  const observer=new MutationObserver(()=>{const hash=(location.hash||'#home').slice(1);if(hash==='review'||hash==='learn')route()});
  observer.observe(document.querySelector('main'),{childList:true,subtree:true});
  route();
})();