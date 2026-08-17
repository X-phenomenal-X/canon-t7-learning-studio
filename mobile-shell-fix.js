(()=>{
  if(window.T7MobileShellFix)return;
  const routes={home:['home','Home'],shoot:['shoot','Shoot'],review:['review','Review'],learn:['learn','Learn'],library:['library','Library']};

  function normalizeDock(){
    const dock=document.querySelector('.mobile-dock');
    if(!dock)return;
    [...dock.querySelectorAll('a')].forEach(a=>{
      const route=(a.getAttribute('href')||'').replace(/^#/,'');
      const def=routes[route];if(!def)return;
      const [iconName,label]=def;
      const active=a.classList.contains('active')||a.getAttribute('aria-current')==='page';
      const svg=window.T7Icons?.icon?.(iconName);
      const span=document.createElement('span');span.className='t7-tab-label';span.textContent=label;
      a.replaceChildren();
      if(svg)a.appendChild(svg);
      a.appendChild(span);
      a.classList.add('t7-mobile-tab','t7-has-icon');
      if(route==='shoot')a.classList.add('shoot-dock');
      a.setAttribute('aria-label',label);
      if(active)a.setAttribute('aria-current','page');
    });
  }

  let timer=0;
  function schedule(){clearTimeout(timer);timer=setTimeout(normalizeDock,20)}
  window.addEventListener('t7-route-changed',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  setTimeout(normalizeDock,40);
  setTimeout(normalizeDock,300);
  window.T7MobileShellFix={normalizeDock,version:'1.0.0'};
})();
