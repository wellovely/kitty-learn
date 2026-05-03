# shadcn/ui monorepo template

This is a Next.js monorepo template with shadcn/ui.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Production deploy (Vercel)

CD is **native Git integration**: connect this repository in the [Vercel dashboard](https://vercel.com/new), import the GitHub repo, and set **Root Directory** to `apps/web` (Next.js). Vercel runs `bun install` from the monorepo root and builds the app from that directory.

In **Vercel → Project → Settings → Environment Variables** (at least **Production**; mirror for **Preview** if you want PR previews to work against real APIs), set:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **API URL only** — in Supabase: **Settings → API → Project URL** (shape `https://<ref>.supabase.co`). **Wrong:** pasting the browser link `https://supabase.com/dashboard/project/<ref>/...` — that is the admin UI, not Auth; the app will hit `/auth/v1/...` there and CORS will fail. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only; never `NEXT_PUBLIC_*` |
| `OPENROUTER_API_KEY` | AI routing |
| `DEEPGRAM_API_KEY` | Voice transcribe/speak |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://<project>.vercel.app` (used as OpenRouter referer) |

After the first production URL exists, open [Supabase](https://supabase.com/dashboard) → **Authentication → URL configuration** and add that URL to **Site URL** / **Redirect URLs** (and any custom domain).

**CI** stays in GitHub Actions (`.github/workflows/ci.yml`): no `vercel deploy` step. Optionally enable **branch protection** on `main` and require the `CI` / `check` status to pass before merge.
