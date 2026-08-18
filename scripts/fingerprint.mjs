#!/usr/bin/env node
/* Computed-style fingerprint — a no-op oracle for CSS refactors.
 *
 * This codebase resolves its cascade through load order and roughly 1,900
 * !important declarations. That makes any cleanup risky by inspection: you
 * cannot tell by reading whether a flag is load-bearing. This tool answers the
 * question empirically. It renders every route at three widths, hashes the
 * computed styles of every rendered element, and reports whether a change moved
 * anything at all.
 *
 *   node scripts/fingerprint.mjs --save baseline.json    # before your edit
 *   node scripts/fingerprint.mjs --compare baseline.json # after it
 *
 * Exit code 1 means something rendered differently, and the failing views are
 * listed. Identical output means the edit was a genuine no-op.
 *
 * Determinism was not free. Each of these exists because it caused a false
 * positive during development:
 *   - the clock is frozen, so time-derived copy stays put
 *   - history is seeded with fixed ids and timestamps
 *   - reduced motion is emulated AND every Web Animation is finished, because
 *     motion-v1 animates through the WAAPI, which CSS animation:none ignores
 *   - icon-system is forced to decorate, since it injects through a
 *     MutationObserver and would otherwise finish at unpredictable moments
 *   - records are keyed by element identity and sorted, because two decorators
 *     inject siblings in a racing order
 *   - only rendered elements count; hidden sections hold elements whose async
 *     decoration races and which cannot be a visual regression anyway
 *   - each view is read repeatedly until two consecutive reads agree
 *   - the origin is stripped from computed url() values, because this server
 *     binds an ephemeral port and .brand-icon carries a background image
 *
 * Verified sensitive: a single 1px change to one desktop rule is detected, on
 * exactly the two desktop views it affects and no others.
 *
 * Not wired into CI: a full pass takes a couple of minutes.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { writeFileSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES = ['home','shoot','review','learn','library','edit','camera','simulator','conditions','practice','visuals'];
const VIEWPORTS = [[390,844],[1440,940],[1680,1000]];
const FROZEN = 1755500000000;
const TYPES = { '.html':'text/html','.js':'text/javascript','.css':'text/css',
  '.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml' };

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    const body = await readFile(join(root, rel === '/' ? 'index.html' : rel));
    res.writeHead(200, { 'content-type': TYPES[extname(rel)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const out = {};

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await ctx.addInitScript(([F]) => {
    try { localStorage.setItem('t7StudioOnboardedV1', '1'); } catch {}
    const RealDate = Date;
    class FrozenDate extends RealDate {
      constructor(...a) { super(...(a.length ? a : [F])); }
      static now() { return F; }
    }
    window.Date = FrozenDate;
    window.__lastMut = 0;
    new MutationObserver(() => { window.__lastMut = performance.now(); })
      .observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
  }, [FROZEN]);
  const page = await ctx.newPage();
  await page.goto(`${base}#home`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.T7History && !!document.querySelector('#library'), null, { timeout: 30000 });
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  await page.evaluate(async (F) => {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    c.getContext('2d').fillRect(0, 0, 600, 400);
    const thumb = c.toDataURL('image/jpeg', .6);
    for (let i = 0; i < 6; i++) await window.T7History.put({ id: F - i*8e7, time: F - i*8e7, goal: 'portrait',
      thumb, preview: thumb, settings: 'Av', score: 70, exposure: 70, detail: 60, contrast: 65, clipping: 80,
      status: 'Reviewed', diagnosis: 'fingerprint', labels: {}, exif: {} });
    window.dispatchEvent(new CustomEvent('t7-history-updated', { detail: { items: await window.T7History.all(), stats: {} } }));
  }, FROZEN);

  for (const route of ROUTES) {
    await page.evaluate(r => { location.hash = '#' + r; }, route);
    await page.evaluate(async () => {
      const H = document.body.scrollHeight, step = Math.max(400, innerHeight * .8);
      for (let y = 0; y < H; y += step) { scrollTo(0, y); await new Promise(q => setTimeout(q, 60)); }
      scrollTo(0, 0);
      for (let i = 0; i < 40 && (scrollY !== 0 || document.body.classList.contains('motion-scrolled')); i++) {
        scrollTo(0, 0); dispatchEvent(new Event('scroll')); await new Promise(q => setTimeout(q, 50));
      }
      document.activeElement?.blur?.();
      try { document.getAnimations().forEach(a => { try { a.finish(); } catch {} }); } catch {}
      try { window.T7Icons?.decorate?.(document.body); } catch {}
      try { window.T7Icons?.decorate?.(); } catch {}
      try { await document.fonts?.ready; } catch {}
      const start = performance.now();
      for (;;) {
        const quiet = performance.now() - (window.__lastMut || 0);
        if (quiet > 600 || performance.now() - start > 12000) break;
        await new Promise(q => setTimeout(q, 80));
      }
      try { document.getAnimations().forEach(a => { try { a.finish(); } catch {} }); } catch {}
      await new Promise(q => requestAnimationFrame(() => requestAnimationFrame(q)));
    });

    const hashOnce = () => page.evaluate(() => {
        const PROPS=['display','position','top','right','bottom','left','z-index','flex-direction','flex-wrap','flex-basis','grid-template-columns','grid-template-rows','grid-auto-rows','gap','align-items','align-self','justify-content','order','width','height','min-width','min-height','max-width','max-height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-right-width','border-bottom-width','border-left-width','border-top-style','border-top-color','border-radius','background-color','background-image','background-position','background-size','color','font-size','font-family','font-weight','font-style','line-height','letter-spacing','text-align','text-transform','text-decoration-line','white-space','overflow-x','overflow-y','opacity','visibility','box-shadow','text-shadow','transform','filter','backdrop-filter','object-fit','aspect-ratio','cursor','pointer-events','content','float','vertical-align','text-overflow','outline-width'];
        /* Two decorators (icon-system, shoot-subject) inject siblings in a racing
           order, so position-indexed hashing compares different elements between
           runs. Key each element by what it IS - its ancestry, classes and text -
           and sort the records, making the fingerprint order-independent. */
        /* Only rendered elements count. Off-screen sections still hold elements
           whose async decoration races (a hidden Shoot button's injected icon),
           and an element nobody can see cannot be a visual regression. A change
           that hides or reveals something still shows up, as a removed or added
           record. */
        const els=[...document.querySelectorAll('body *')].filter(el=>{
          if(el.closest('script,style'))return false;
          const r=el.getBoundingClientRect();
          return r.width>0&&r.height>0;
        });
        const ident=el=>{
          const parts=[];
          for(let n=el,d=0;n&&n!==document.body&&d<6;n=n.parentElement,d++){
            parts.push(n.tagName+'.'+String(n.className||'').trim().split(/\s+/).sort().join('.'));
          }
          const txt=(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,48);
          return parts.join('>')+'#'+txt;
        };
        const recs=els.map(el=>{
          let s=ident(el)+'||';
          for(const ps of [null,'::before','::after']){
            const cs=getComputedStyle(el,ps);
            if(ps&&cs.getPropertyValue('content')==='none')continue;
            for(const p of PROPS)s+=cs.getPropertyValue(p)+';';
          }
          /* url() in a computed style resolves to an absolute URL, and this
             server binds an ephemeral port, so the port digits would land in
             the hash and every run would disagree with the last. Drop the
             origin; which file is referenced still counts. */
          return s.split(location.origin).join('@');
        }).sort();
        let h1=0x811c9dc5;
        const mix=s=>{for(let i=0;i<s.length;i++){h1^=s.charCodeAt(i);h1=(h1*0x01000193)>>>0}};
        for(const r of recs)mix(r);
        return (h1>>>0).toString(16)+':'+els.length;
      });

    let prev = await hashOnce(), stable = null;
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(350);
      const next = await hashOnce();
      if (next === prev) { stable = next; break; }
      prev = next;
    }
    if (!stable) { console.error(`fingerprint never stabilised for ${w}x${h}/${route}`); process.exit(2); }
    out[`${w}x${h}/${route}`] = stable;
  }
  await ctx.close();
}

await browser.close();
server.close();

const joined = Object.entries(out).map(([k, v]) => k + '=' + v).join('|');
let t = 0x811c9dc5;
for (let i = 0; i < joined.length; i++) { t ^= joined.charCodeAt(i); t = (t * 0x01000193) >>> 0; }
out.TOTAL = (t >>> 0).toString(16);

const saveAt = process.argv.indexOf('--save');
const cmpAt = process.argv.indexOf('--compare');
if (saveAt > -1 && process.argv[saveAt + 1]) {
  writeFileSync(process.argv[saveAt + 1], JSON.stringify(out, null, 1));
  console.log(`Fingerprint saved (${Object.keys(out).length - 1} views). TOTAL ${out.TOTAL}`);
} else if (cmpAt > -1 && process.argv[cmpAt + 1]) {
  const baseFp = JSON.parse(readFileSync(process.argv[cmpAt + 1], 'utf8'));
  const moved = Object.keys(baseFp).filter(k => k !== 'TOTAL' && baseFp[k] !== out[k]);
  if (!moved.length) { console.log(`No visual change across ${Object.keys(out).length - 1} views. TOTAL ${out.TOTAL}`); }
  else {
    console.error(`\nVisual change in ${moved.length} view(s):\n`);
    for (const k of moved) console.error(`  ${k}\n    baseline ${baseFp[k]}\n    now      ${out[k]}`);
    console.error('');
    process.exit(1);
  }
} else {
  console.log(JSON.stringify(out));
}
