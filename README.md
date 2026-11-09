# OpenBox for Agentforce — landing page

An [EmDash](https://emdashcms.com) (Astro + Node + SQLite) site. Every section of the page is editable in the admin.

## Run locally

```bash
npm install
npm run dev          # http://localhost:4321  (runs in the background; `npx astro dev stop` to stop)
```

- Site: http://localhost:4321/
- Admin: http://localhost:4321/_emdash/admin/ (first visit starts the setup wizard where you register your own passkey)
- Re-apply the starter content (does not touch your edits unless you pass `--on-conflict=update`):

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

## Deployment

Not deployed. Review locally first. See the EmDash docs for Node.js / Cloudflare deployment, and back up
`EMDASH_ENCRYPTION_KEY` (in `.env`, never committed) before deploying.
