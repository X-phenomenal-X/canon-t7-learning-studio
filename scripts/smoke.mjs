#!/usr/bin/env node
/* Headless smoke test for T7 Studio.
 *
 * Serves the repository, walks every route at phone, laptop and wide widths, and
 * fails on the failure modes this app has actually shipped:
 *   - a script throwing during boot
 *   - a component rendering unstyled because its stylesheet is not linked
 *   - an element with [hidden] still painting because a display rule outranks it
 *   - a layout wide enough to scroll the page sideways
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
const base = `http://127.0.0.1:${server.address().port}/index.html`;

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
      };
    });

    if (!state.screenPainted) note(`${vp.name}/${route}`, `no visible screen for the route (active section: ${state.screen})`);
    if (state.paintedHidden.length) note(`${vp.name}/${route}`, `element(s) with [hidden] still painting: ${state.paintedHidden.join(', ')}`);
    if (state.overflowPx > 1) note(`${vp.name}/${route}`, `page scrolls sideways by ${state.overflowPx}px`);
    if (route === 'library') {
      if (state.galleryDisplay !== vp.gallery)
        note(`${vp.name}/library`, `contact sheet is display:${state.galleryDisplay}, expected ${vp.gallery} — its stylesheet is probably not linked`);
      if (state.galleryShotDisplay === 'inline')
        note(`${vp.name}/library`, 'gallery frames are display:inline — unstyled');
    }
  }
  await ctx.close();
}

await browser.close();
server.close();

if (problems.length) {
  console.error(`\nSmoke test FAILED (${problems.length} problem${problems.length > 1 ? 's' : ''})\n`);
  for (const p of [...new Set(problems)]) console.error('  ' + p);
  console.error('');
  process.exit(1);
}
console.log(`Smoke test OK — ${ROUTES.length} routes x ${VIEWPORTS.length} viewports, no errors.`);
