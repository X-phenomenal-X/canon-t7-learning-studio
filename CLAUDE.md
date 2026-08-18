# T7 Studio

A static, local-first PWA that teaches photography on a Canon EOS Rebel T7 with the
18–55mm kit lens. No build step, no framework, no paid APIs. GitHub Pages serves the
repository root from `main`.

## Before you change anything

Run the checks. They encode failures this codebase has actually shipped:

```
node scripts/check-assets.mjs     # no browser needed, instant
npm ci && npx playwright install chromium && node scripts/smoke.mjs
```

## How the app loads

`index.html` is a shell. `app.js` is the loader: it injects every stylesheet, then
runs the module chain in a fixed order because each module depends on globals the
previous one defines. `warm()` preloads the whole chain in parallel first — without
it, the browser discovers module N+1 only after N finishes, which cost roughly
3.4 seconds of serial round trips on an 80ms connection.

If you add a module, it must be in three places or the checks fail:
`app.js` (the chain), `app.js` (the `warm()` list), and `sw.js` (the CORE cache).

## Proving a CSS change is safe

`scripts/fingerprint.mjs` renders every route at three widths and hashes the
computed styles of every rendered element, so you can prove an edit changed
nothing:

```
node scripts/fingerprint.mjs --save /tmp/base.json    # before
node scripts/fingerprint.mjs --compare /tmp/base.json # after; exit 1 = something moved
```

It is deterministic (frozen clock, seeded history, finished animations, forced
icon decoration, order-independent hashing, stable re-reads) and sensitive: a
single 1px change to one desktop rule is reported on exactly the two desktop
views it affects. Use it before touching the cascade. It takes a couple of
minutes, so it is not in CI.

Early evidence says most `!important` here is load-bearing — removing the four
in `router.css` changes 30 of 33 views, because load order plus `!important` *is*
how screens are shown and hidden. Do not strip flags in bulk; measure each file.

## The cascade

42 stylesheets layer on top of each other, resolved by load order in `app.js` and by
roughly 1900 `!important` declarations. Load order is the design: later files
intentionally override earlier ones. `desktop-workspace.css` loads last and owns
everything above 1000px.

Two consequences worth knowing before editing:

- **An id-level rule beats your class rule.** `#library{max-width:1040px!important}`
  in `premium-shell.css` silently outranked `.library-screen{...!important}` in the
  desktop layer. Fix the conflict at its source rather than escalating.
- **`[hidden]` does not win by default.** A component's `display` rule overrides it,
  which is why a global `[hidden]{display:none!important}` lives in `qa-polish.css`.
  Do not add per-component `[hidden]` patches; the global rule covers them.

Prefer replacing a conflicting rule over stacking another override. Two files that
both claim to be "the desktop layer" will fight, and the loser is whoever reads the
code next.

## Design direction

Premium, photographic, editorial, cinematic, dark. Deep near-black background, warm
coral capture accent, green/blue/amber reserved for semantic state only.

- Photographs dominate; analytics support them and never lead.
- Desktop: centred floating nav, 1180–1320px measure, 1–2 columns, generous
  whitespace, few borders, no permanent sidebar, no dashboard density.
- Mobile is heavily optimised and is the reference implementation. Desktop rules
  belong inside `@media (min-width:1000px)` so mobile cannot regress.
- No emoji. Icons come from the `icon-system.js` SVG set, one icon per element.

## Product loop

Shoot → Review → Diagnose → Learn → Practice → Reshoot → Compare.

`smart-coach.js` is the single diagnosis engine. Do not add a second one.
`t7-engine.js` owns camera recommendations. Review is technical, not artistic.

## Data

Everything is local: IndexedDB (`canonT7Studio` / `photoHistory`) for review history,
localStorage for progress and preferences. Original photos are never stored — only a
preview of about 1100px. Weather comes from Open-Meteo, on request only.

## Deploying

Bump `CACHE` in `sw.js` when shipping asset changes, or clients serve stale files.
Never roll the version backwards. Commit to `main`; Pages builds automatically.
Confirm the run succeeded before calling it live.
