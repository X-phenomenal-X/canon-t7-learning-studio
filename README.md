# Canon T7 Studio

A mobile-first, free photography companion built specifically around the **Canon EOS Rebel T7 + 18–55mm kit lens**.

The product loop is simple:

**Learn → Guided Shoot → Review → Change one thing → Reshoot → Compare → Improve**

## Current features

- Mobile app-style Home, navigation and PWA shell
- **Guided Shoot** for Portrait, Product, Landscape, Action, Indoor and Night
- Central Canon T7 recommendation engine for mode, focal length, exposure, ISO, autofocus and drive mode
- **How to set it on your Rebel T7** instructions directly from recommended settings
- Visual Learn course for Aperture, Shutter Speed, ISO, 18–55mm focal length, Focus and Composition
- Interactive camera-control explorer and exposure simulator
- Photo Conditions powered by Open-Meteo
- Local technical Photo Review: exposure, detail, contrast and clipping
- Free on-device Smart Coach with one prioritized improvement
- Reshoot loop with Attempt 1 vs Attempt 2 comparison
- Local Photo History / improvement tracking using IndexedDB
- Browser photo editor with Auto Fix, Light, Color, Crop and Detail controls
- PWA/offline support with resilient asset caching

## Privacy and cost

T7 Studio is designed to work without paid AI APIs.

- Photo review and editing run in the browser.
- Photo history is stored locally on the device.
- Weather/light guidance uses Open-Meteo.
- No OpenAI API key is required by the live app.

## Architecture

The app remains a static GitHub Pages project, but the runtime has been stabilized around a few shared modules:

- `app.js` — ordered module loader
- `router.js` — single hash router
- `store.js` — centralized state facade while preserving existing local data
- `t7-engine.js` — Canon T7 shooting recommendations
- `native-ui.js` — Home presentation
- `shoot-flow.js` — Guided Shoot
- `review-flow.js` / `review-v2.js` — technical review workflow
- `smart-coach.js` — free rule-based coaching
- `reshoot.js` — controlled reshoot comparison
- `history.js` — IndexedDB photo history
- `editor.js` / `editor-v2.js` — local photo editing
- `conditions.js` / `conditions-v2.js` — free live conditions
- `camera-steps.js` — physical Rebel T7 setting instructions
- `sw.js` — PWA caching/offline behavior

## GitHub Pages

The project uses relative paths and is deployed from the repository root on the `main` branch.

Live site:

`https://x-phenomenal-x.github.io/canon-t7-learning-studio/`

## iPhone

Open the live site in Safari and use **Share → Add to Home Screen** for the standalone app experience.
