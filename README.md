# OpenBox for Agentforce — landing page

An [EmDash](https://emdashcms.com) (Astro + Node + SQLite) site. Every section of the page is editable in the admin.

## Run locally

Two configs share the same code:

| Command | Runtime | Data |
| --- | --- | --- |
| `npm run dev:node` | Node + local SQLite (`data.db`) | Quickest local preview |
| `npm run dev` | Cloudflare Workers runtime (workerd) | Local D1 state in `.wrangler/` — matches production |

```bash
npm install
npm run dev:node     # http://localhost:4321 (runs in the background; `npx astro dev stop` to stop)
```

- Admin: http://localhost:4321/_emdash/admin/ (first visit starts the setup wizard where you register your own passkey)
- Load the starter content into the local SQLite database (Node mode):

```bash
npx emdash seed seed/seed.json
```

## How content is modelled

- `pages` collection → the home page is the entry with slug `home`.
- Its **Page sections** field is a list of typed blocks (defined in `seed/seed.json` → `blockTypes`):
  Hero + simulator, Trust strip, Design partner logos, Demo video, Statement band, How it works (steps),
  Verdict ladder + example, Live demo carousel, Why it holds, FAQ, Repo + README, Design partner form.
  Add, remove and reorder sections in the admin.
- Header button, Launchpad badge and footer note are fields on the page.
- Navigation: **Menus** → `primary` (header), `footer`, `legal`.
- Site title and tagline: **Settings**.

## Where things live

| Path | Purpose |
| --- | --- |
| `seed/seed.json` | Schema (block types, collections), menus, settings and starter content |
| `src/components/blocks/*.astro` | One renderer per block type; `index.ts` maps type → component |
| `src/styles/landing.css` | Design tokens (from the Openbox DS) and all section styles |
| `src/scripts/landing.ts` | Simulator, demo carousel, nav, copy buttons, partner form |
| `src/pages/index.astro` | Renders the `home` entry |

Design source: Figma file “OpenBox for Agentforce — Landing Page”.

## Deployment (Cloudflare Workers + D1 + R2)

`astro.config.mjs` and `wrangler.jsonc` target Cloudflare Workers. Build `npm run build`, deploy `npx wrangler deploy`.

1. `npx wrangler login`
2. Generate and set the encryption key (back it up separately — it is not stored in the database):
   ```bash
   npx emdash secrets generate
   npx wrangler secret put EMDASH_ENCRYPTION_KEY
   ```
3. Set `EMDASH_SITE_URL` to the production origin **before** first setup (passkeys are bound to it).
4. Connect the repo in Cloudflare (Workers Builds): build command `npm run build`, deploy command `npx wrangler deploy`.
   The D1 database (`DB`) and session KV are created on the first deploy. The R2 bucket (`MEDIA`) is **not** —
   create `openbox-agentforce-media` in the same Cloudflare account first (R2 → Create bucket), otherwise the deploy fails with `R2 bucket not found [code: 10085]`.
5. Open `/_emdash/admin`, register a passkey, and **tick “Include sample content”** in the setup wizard —
   the schema applies automatically, the home page content only loads if you choose it.
6. New sites start in staging (hidden from search engines) until taken live in the admin.

Notes: the Worker bundle is ~19 MB (≈5 MB gzipped), which needs a Workers **Paid** plan. Edits made in production live in D1, not in git.
The Node config (`astro.config.node.mjs`, `npm run build:node` / `start:node`) is kept for local preview and self-hosting.
