# Canon T7 Learning Studio

Interactive, mobile-first learning site for the Canon EOS Rebel T7 + 18–55mm kit lens.

## V5 features
- Interactive camera control explorer
- Aperture / shutter / ISO simulator
- 18–55mm focal-length visualizer
- Camera-angle trainer
- **Live Photo Conditions** powered by Open-Meteo
  - city search or browser location
  - temperature, cloud cover, wind, rain chance
  - sunrise and sunset
  - approximate morning/evening golden-hour windows
  - shooting advice and starter settings
- Shooting recipe finder
- 7-day practice tracker and learning progress
- Browser photo editor with before/after comparison
- Mobile bottom navigation
- Offline-ready service worker
- GitHub Pages-compatible static structure

## API architecture
The current live weather/light feature uses Open-Meteo and does not require a client-side secret for normal non-commercial usage.

APIs that require private credentials (for example AI photo critique) should **not** have secrets placed in this GitHub Pages frontend. Add those later through a secure serverless backend such as a Vercel/Cloudflare function.

## GitHub Pages deployment
1. Open this repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Save.

The site uses relative paths, so it works from the repository sub-path used by GitHub Pages.

## iPhone
After the site is live, open it in Safari and use **Share → Add to Home Screen** for an app-like shortcut.
