#!/usr/bin/env node
/* Static consistency checks for the T7 Studio asset graph. No dependencies.
 *
 * These exist because three stylesheets (photo-content.css, photo-visual.css,
 * home-coach.css) once shipped in the service-worker cache while being linked
 * from nowhere, so the components they styled rendered unstyled for months —
 * and shoot-flow.js was loaded by app.js while missing from the offline cache.
 * Both classes of drift are silent at runtime. They are not silent here. */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(root, f), 'utf8');
const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });

const onDisk = new Set(readdirSync(root).filter(f => /\.(css|js)$/.test(f)));

/* Entry points the browser reaches without going through app.js. */
const ENTRIES = new Set(['app.js', 'sw.js']);
/* Files a tool or the platform loads, never the page. */
const NOT_SHIPPED = new Set(['scripts/check-assets.mjs', 'scripts/smoke.mjs']);

const indexHtml = read('index.html');
const appJs = read('app.js');
const swJs = read('sw.js');

const refsIn = (src, re) => new Set([...src.matchAll(re)].map(m => m[1]));

const htmlRefs = refsIn(indexHtml, /(?:src|href)="\.\/([A-Za-z0-9._-]+\.(?:css|js))"/g);
const appRefs = new Set([
  ...refsIn(appJs, /style\('\.\/([^']+)'\)/g),
  ...refsIn(appJs, /script\('\.\/([^']+)'\)/g),
]);
const coreRefs = refsIn(swJs, /'\.\/([A-Za-z0-9._-]+\.(?:css|js))'/g);
const loaded = new Set([...htmlRefs, ...appRefs, ...ENTRIES]);

/* 1. Everything the page asks for must exist. */
for (const ref of [...htmlRefs, ...appRefs]) {
  if (!onDisk.has(ref)) fail('missing-file', `${ref} is referenced but not in the repository`);
}

/* 2. Everything on disk must be reachable. A stylesheet nobody links is dead weight
 *    that looks alive in the cache list. */
for (const file of onDisk) {
  if (!loaded.has(file) && !NOT_SHIPPED.has(file)) {
    fail('orphaned-file', `${file} exists but is never linked from index.html or app.js`);
  }
}

/* 3. Everything the page loads must be cached, or the PWA breaks offline. */
for (const file of loaded) {
  if (file === 'sw.js') continue;
  if (!coreRefs.has(file)) fail('uncached', `${file} is loaded at runtime but missing from the sw.js CORE list`);
}

/* 4. The cache must not promise files that are gone. */
for (const file of coreRefs) {
  if (/\.(css|js)$/.test(file) && !onDisk.has(file)) {
    fail('stale-cache-entry', `sw.js CORE lists ${file}, which is not in the repository`);
  }
}

/* 5. The preload list must cover the module chain, or the parallel warm-up silently
 *    stops covering new modules. */
const chain = [...appJs.matchAll(/script\('(\.\/[^']+\.js)'\)/g)].map(m => m[1]);
const warmed = new Set([...(appJs.match(/warm\(\[([^\]]*)\]\)/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map(m => m[1]));
for (const mod of new Set(chain)) {
  if (!warmed.has(mod)) fail('not-preloaded', `${mod} is in the module chain but not in warm(), so it costs a serial round trip`);
}

/* 6. A shipped asset change with no cache version bump serves stale files forever. */
const cacheName = swJs.match(/const CACHE='([^']+)'/)?.[1];
if (!cacheName) fail('no-cache-version', 'sw.js does not declare a CACHE constant');

const counts = failures.reduce((acc, f) => ({ ...acc, [f.rule]: (acc[f.rule] ?? 0) + 1 }), {});
if (failures.length) {
  console.error(`\nAsset graph check FAILED (${failures.length} problem${failures.length > 1 ? 's' : ''})\n`);
  for (const { rule, detail } of failures) console.error(`  [${rule}] ${detail}`);
  console.error('');
  process.exit(1);
}
console.log(`Asset graph OK — ${loaded.size} loaded files, ${coreRefs.size} cached, cache "${cacheName}".`);
