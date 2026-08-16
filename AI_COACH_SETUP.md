# AI Photo Coach backend setup

The GitHub Pages frontend is already wired to `ai-coach.js`. The secure backend is implemented in `supabase/functions/photo-coach/index.ts`.

## Why a backend is required
The OpenAI API key must never be stored in the public GitHub Pages JavaScript. The Edge Function keeps the OpenAI key and private coach PIN server-side.

## Required Supabase secrets
Configure these environment variables on the dedicated photography Supabase project:

- `OPENAI_API_KEY` — OpenAI project API key
- `COACH_PIN` — a private PIN used by the app before it will call the coach
- `ALLOWED_ORIGIN` — `https://x-phenomenal-x.github.io`
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6`

## Deploy
Deploy `supabase/functions/photo-coach/index.ts` as the Edge Function `photo-coach` with JWT verification disabled only because the function performs its own PIN authentication and strict origin check.

After deployment, set `coach-config.json` to:

```json
{
  "endpoint": "https://YOUR_PROJECT_REF.supabase.co/functions/v1/photo-coach"
}
```

The browser sends only a compressed image after the user explicitly taps **Analyze with AI**. The ordinary technical Review remains on-device.

## AI response
The backend uses the OpenAI Responses API with image input and strict structured output. It returns:

- composition feedback
- lighting feedback
- likely focus/detail feedback with confidence
- background feedback
- strengths
- watch-outs
- one priority fix
- exact Canon T7 next-shot settings

The backend request sets `store: false`.
