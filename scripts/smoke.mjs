#!/usr/bin/env node
/* Headless smoke test for T7 Studio.
 *
 * Serves the repository, walks every route at phone, laptop and wide widths, and
 * fails on the failure modes this app has actually shipped:
 *   - a script throwing during boot
 *   - a component rendering unstyled because its stylesheet is not linked
 *   - an element with [hidden] still painting because a display rule outranks it
 *   - a layout wide enough to scroll the page sideways
 * It then installs the service worker and reloads with the network cut, because
 * "works offline" is the product's core promise and the CORE list only proves
 * itself when the network is actually gone.
 *
 * Run: node scripts/smoke.mjs
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml' };

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = join(root, rel === '/' ? 'index.html' : rel);
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
/* The route sweep runs against 127.0.0.1, which the app's service-worker gate
 * rejects, so those sections stay SW-free. The offline section uses localhost,
 * which resolves to the same server but passes the gate. */
const base = `http://127.0.0.1:${server.address().port}/index.html`;
const swBase = `http://localhost:${server.address().port}/index.html`;

const ROUTES = ['home','shoot','review','learn','library','edit','camera','simulator','conditions','practice','visuals'];
const VIEWPORTS = [
  { name: 'phone',  width: 390,  height: 844,  gallery: 'flex' },
  { name: 'laptop', width: 1440, height: 940,  gallery: 'grid' },
  { name: 'wide',   width: 1680, height: 1000, gallery: 'grid' },
];

const problems = [];
const note = (where, msg) => problems.push(`[${where}] ${msg}`);

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await ctx.addInitScript(() => { try { localStorage.setItem('t7StudioOnboardedV1', '1'); } catch {} });
  const page = await ctx.newPage();
  page.on('pageerror', e => note(vp.name, `uncaught error: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') note(vp.name, `console error: ${m.text().slice(0, 200)}`); });
  page.on('requestfailed', r => note(vp.name, `request failed: ${r.url().split('/').pop()} ${r.failure()?.errorText}`));

  await page.goto(`${base}#home`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.T7History && !!document.querySelector('#library'), null, { timeout: 30000 })
    .catch(() => note(vp.name, 'app never finished booting (T7History or #library missing)'));

  // A Library with photographs in it is the only way to test the contact sheet.
  await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    c.getContext('2d').fillRect(0, 0, 600, 400);
    const thumb = c.toDataURL('image/jpeg', .6);
    for (let i = 0; i < 6; i++) await window.T7History.put({
      id: Date.now() - i * 8e7, time: Date.now() - i * 8e7, goal: 'portrait', thumb, preview: thumb,
      settings: 'Av', score: 70, exposure: 70, detail: 60, contrast: 65, clipping: 80,
      status: 'Reviewed', diagnosis: 'smoke', labels: {}, exif: {} });
    window.dispatchEvent(new CustomEvent('t7-history-updated',
      { detail: { items: await window.T7History.all(), stats: {} } }));
  });

  for (const route of ROUTES) {
    await page.evaluate(h => { location.hash = '#' + h; }, route);
    await page.waitForTimeout(400);

    const state = await page.evaluate(() => {
      const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const screen = document.querySelector('main > .app-screen-active');
      const gallery = document.querySelector('.library-gallery');
      return {
        screen: screen?.id ?? null,
        screenPainted: screen ? visible(screen) : false,
        galleryDisplay: gallery ? getComputedStyle(gallery).display : null,
        galleryShotDisplay: document.querySelector('.library-gallery-shot')
          ? getComputedStyle(document.querySelector('.library-gallery-shot')).display : null,
        paintedHidden: [...document.querySelectorAll('[hidden]')].filter(visible)
          .map(el => el.id || el.className.toString().slice(0, 40)).slice(0, 5),
        overflowPx: Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth),
        home: Object.fromEntries(['.home-v2-hero', '#homeRing', '.home-v2-strip']
          .map(sel => [sel, !!document.querySelector(sel) && visible(document.querySelector(sel))])),
      };
    });

    if (!state.screenPainted) note(`${vp.name}/${route}`, `no visible screen for the route (active section: ${state.screen})`);
    if (route === 'home') {
      /* Home is composed by native-ui and then touched by several later modules.
       * One of them used to write textContent onto the learning tile, erasing its
       * progress ring and labels. Assert the composition survives a full load. */
      for (const [sel, what] of [['.home-v2-hero', 'hero'], ['#homeRing', 'learning progress ring'],
                                 ['.home-v2-strip', 'context strip']]) {
        if (!state.home[sel]) note(`${vp.name}/home`, `${what} (${sel}) is missing or not painted`);
      }
    }
    if (state.paintedHidden.length) note(`${vp.name}/${route}`, `element(s) with [hidden] still painting: ${state.paintedHidden.join(', ')}`);
    if (state.overflowPx > 1) note(`${vp.name}/${route}`, `page scrolls sideways by ${state.overflowPx}px`);
    if (route === 'library') {
      if (state.galleryDisplay !== vp.gallery)
        note(`${vp.name}/library`, `contact sheet is display:${state.galleryDisplay}, expected ${vp.gallery} — its stylesheet is probably not linked`);
      if (state.galleryShotDisplay === 'inline')
        note(`${vp.name}/library`, 'gallery frames are display:inline — unstyled');
    }
  }
  /* The core product loop - bring a JPEG into Review and get a diagnosis - is the
   * one flow a route sweep cannot cover. Drive it once per viewport with a real
   * generated photo and assert the pipeline all the way into Library. */
  await page.evaluate(h => { location.hash = '#' + h; }, 'review');
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => window.T7History.all().then(x => x.length));
  await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 800;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#6d5540'); grad.addColorStop(1, '#241c17');
    g.fillStyle = grad; g.fillRect(0, 0, 1200, 800);
    g.fillStyle = '#e6c4a4'; g.beginPath(); g.ellipse(600, 430, 180, 220, 0, 0, 7); g.fill();
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .9));
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'IMG_0001.JPG', { type: 'image/jpeg' }));
    const input = document.getElementById('fileInput');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => {
    const res = document.getElementById('rv2Result');
    return res && !res.hidden && document.getElementById('rv2Photo')?.currentSrc;
  }, null, { timeout: 20000 }).catch(() => note(`${vp.name}/review-flow`, 'result panel never appeared after choosing a photo'));
  await page.waitForTimeout(800);
  const flow = await page.evaluate(async () => ({
    verdict: document.getElementById('rv2Verdict')?.textContent.trim() ?? '',
    metricsFilled: [...document.querySelectorAll('.rv2-diagnostics b')]
      .filter(b => b.textContent.trim() && b.textContent.trim() !== '\u2014').length,
    historyCount: await window.T7History.all().then(x => x.length),
  }));
  if (!flow.verdict || /reviewed$/i.test(flow.verdict) === false && flow.verdict.length < 4)
    note(`${vp.name}/review-flow`, `verdict text looks empty: "${flow.verdict}"`);
  if (flow.metricsFilled < 3) note(`${vp.name}/review-flow`, `only ${flow.metricsFilled} diagnostic metrics filled`);
  if (flow.historyCount <= before) note(`${vp.name}/review-flow`, 'review did not add a history record');
  await page.evaluate(h => { location.hash = '#' + h; }, 'library');
  await page.waitForTimeout(700);
  const shot = await page.evaluate(() => !!document.querySelector('.library-gallery-shot img'));
  if (!shot) note(`${vp.name}/review-flow`, 'reviewed photo never reached the Library contact sheet');

  await ctx.close();
}

/* ---- Offline: install the service worker, cut the network, boot again ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('t7StudioOnboardedV1', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.goto(`${swBase}#home`, { waitUntil: 'load' });
  /* On first activation the app reloads itself (controllerchange handler in
   * app.js), which destroys any in-page waiter mid-poll. Poll from outside the
   * page instead, tolerating the reload, until the worker is active and the
   * CORE cache is populated. */
  let cached = 0;
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    cached = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return -1;
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg?.active) return 0;
      /* Active is not enough: the page must be *controlled* before the cache
       * path can serve it. */
      if (!navigator.serviceWorker.controller) return 0;
      const name = (await caches.keys()).find(n => n.startsWith('canon-t7-studio-'));
      if (!name) return 0;
      return (await (await caches.open(name)).keys()).length;
    }).catch(() => 0); // evaluate throws while the self-reload is in flight
    if (cached === -1) break;
    if (cached >= 80) break;
    await page.waitForTimeout(500);
  }
  if (cached < 80) note('offline', `service worker never activated with a populated cache (last count: ${cached})`);
  if (cached >= 80) {
    /* Playwright's setOffline does not apply to service-worker-initiated fetches
     * in Chromium, so the SW would keep reaching the server and the cache path
     * would never run. Stopping the server itself cuts the network for real.
     * This section is last, so nothing after it needs the server. */
    /* app.js reloads itself on controllerchange. That reload can still be in
     * flight here, and it aborts the reload issued below — the page ends up
     * loaded but page.reload() rejects with ERR_ABORTED. Mark the document,
     * wait, and if the marker is gone the self-reload happened: let it land. */
    await page.evaluate(() => { window.__preCut = 1; }).catch(() => {});
    await page.waitForTimeout(1200);
    const survived = await page.evaluate(() => window.__preCut === 1).catch(() => false);
    if (!survived) await page.waitForLoadState('load').catch(() => {});

    server.close();
    server.closeAllConnections?.();
    const offErrs = [];
    page.on('pageerror', e => offErrs.push(e.message));
    await page.reload({ waitUntil: 'load' }).catch(e => note('offline', `reload failed with network cut: ${e.message}`));
    const booted = await page.waitForFunction(
      () => !!window.T7History && !!document.querySelector('#library'),
      null, { timeout: 30000 }).then(() => true).catch(() => false);
    if (!booted) note('offline', 'app did not boot from the service-worker cache');
    if (offErrs.length) note('offline', `errors while offline: ${[...new Set(offErrs)].slice(0, 3).join(' | ')}`);
    const offline = await page.evaluate(() => {
      const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      location.hash = '#library';
      return new Promise(res => setTimeout(() => res({
        hero: !!document.querySelector('.home-v2-hero'),
        libraryPainted: (() => { const el = document.querySelector('#library'); return !!el && visible(el); })(),
      }), 600));
    });
    if (!offline.libraryPainted) note('offline', 'Library route did not paint offline');
  }
  await ctx.close();
}

await browser.close();
try { server.close(); } catch {}

if (problems.length) {
  console.error(`\nSmoke test FAILED (${problems.length} problem${problems.length > 1 ? 's' : ''})\n`);
  for (const p of [...new Set(problems)]) console.error('  ' + p);
  console.error('');
  process.exit(1);
}
console.log(`Smoke test OK — ${ROUTES.length} routes x ${VIEWPORTS.length} viewports, no errors.`);
