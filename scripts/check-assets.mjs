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
/* Modules are declared in named lists (SHELL, ROUTES_A, ...) and executed via
 * chain(); stylesheets are still injected one call at a time. */
const declaredLists = [...appJs.matchAll(/const\s+([A-Z_0-9]+)\s*=\s*\[([^\]]*)\]/g)];
const moduleLists = Object.fromEntries(
  declaredLists
    .map(([, name, body]) => [name, [...body.matchAll(/'\.\/([^']+\.js)'/g)].map(m => m[1])])
    .filter(([, mods]) => mods.length)
);
/* Stylesheets are declared in lists too, so Home can paint without waiting for
 * the sheets only other routes use. */
const styleLists = Object.fromEntries(
  declaredLists
    .map(([, name, body]) => [name, [...body.matchAll(/'\.\/([^']+\.css)'/g)].map(m => m[1])])
    .filter(([, sheets]) => sheets.length)
);
const appRefs = new Set([
  ...refsIn(appJs, /style\('\.\/([^']+)'\)/g),
  ...refsIn(appJs, /script\('\.\/([^']+)'\)/g),
  ...Object.values(moduleLists).flat(),
  ...Object.values(styleLists).flat(),
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

/* 5. Every module list must be preloaded, or its modules each cost a serial round
 *    trip - the exact cost the two-phase warm-up exists to remove. */
const warmedLists = new Set(
  [...appJs.matchAll(/warm\(([^)]*)\)/g)].flatMap(([, args]) => args.match(/[A-Z_0-9]{2,}/g) ?? [])
);
for (const [name, mods] of Object.entries(moduleLists)) {
  if (!warmedLists.has(name)) {
    fail('not-preloaded', `module list ${name} (${mods.length} modules) is never passed to warm()`);
  }
}
/* Any module still loaded by a bare script() call outside a list is invisible to
 * the warm-up. */
for (const mod of refsIn(appJs, /script\('\.\/([^']+\.js)'\)/g)) {
  fail('unlisted-module', `${mod} is loaded by a direct script() call, so it is never preloaded - put it in a module list`);
}
/* A stylesheet list that is never applied means those sheets silently stop
 * loading - the exact failure this checker exists to catch. */
for (const [name, sheets] of Object.entries(styleLists)) {
  /* Applied directly, or consulted while another ordered list is applied. */
  const used = new RegExp(`${name}\\.forEach\\(|new Set\\(${name}\\)|\\.\\.\\.${name}\\b|${name}\\.includes\\(|${name}\\.has\\(`).test(appJs);
  if (!used) {
    fail('unused-style-list', `stylesheet list ${name} (${sheets.length} sheets) is declared but never applied`);
  }
}

/* Lists must be executed, not just declared. */
for (const name of Object.keys(moduleLists)) {
  if (!new RegExp(`chain\\(\\s*(\\.\\.\\.)?${name}\\b|\\.\\.\\.${name}\\b`).test(appJs)) {
    fail('unused-module-list', `module list ${name} is declared but never chained`);
  }
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
