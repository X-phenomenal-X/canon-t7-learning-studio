# AI Photo Coach backend setup

The GitHub Pages frontend is wired to `ai-coach.js`. The secure backend is implemented in `supabase/functions/photo-coach/index.ts` and is currently deployed as the isolated `photo-coach` Edge Function inside the existing **Wealthpilot** Supabase project.

This function does not use or modify Wealthpilot database tables, auth data, storage, or application records. Wealthpilot is only providing the Edge Function runtime.

## Live endpoint

`https://yzqwjwscraayxyynlfre.supabase.co/functions/v1/photo-coach`

`coach-config.json` already points to this endpoint.

## Why server secrets are required
The OpenAI API key must never be stored in public GitHub Pages JavaScript. The Edge Function keeps the OpenAI key and private coach PIN server-side.

## Required Supabase Edge Function secrets
Configure these on the Wealthpilot Supabase project:

- `OPENAI_API_KEY` — OpenAI project API key
- `COACH_PIN` — a private PIN used by the Canon app before it calls the coach
- `ALLOWED_ORIGIN` — `https://x-phenomenal-x.github.io`
- `OPENAI_MODEL` — optional; the function has a default model value

Until `OPENAI_API_KEY` and `COACH_PIN` exist, the function intentionally responds that the AI Coach backend is not configured.

## Security model

- Function name: `photo-coach`
- JWT verification: disabled because the function performs its own private PIN check and origin validation
- The browser sends a compressed image only after the user explicitly taps **Analyze with AI**
- Ordinary technical Review and EXIF parsing remain on-device
- OpenAI requests are configured not to store the response input/output through the function request setting

## AI response
The coach is designed to return:

- composition feedback
- lighting feedback
- likely focus/detail feedback with confidence
- background feedback
- strengths
- watch-outs
- one priority fix
- exact Canon T7 next-shot settings
