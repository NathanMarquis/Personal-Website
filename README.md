# nathan.andmar.dev — static showcase site (multi-page, Bootstrap 5.3.3)

A five-page personal site: **Home · About · Projects · Experience · Contact**.
Styling is Bootstrap + a custom design layer (`styles.css`); motion comes from
Bootstrap transitions/collapses plus a tiny IntersectionObserver scroll-reveal.

## Security posture (important — read this)

- **No third-party requests.** Bootstrap CSS/JS are **self-hosted** in `assets/`
  (pinned to 5.3.3, downloaded once). The page never talks to any CDN or tracker.
- **Only two scripts on the whole site**, both served from this domain:
  - `assets/js/bootstrap.bundle.min.js` — upstream Bootstrap, unmodified
    (sha256 `0833b2e9c3a26c258476c46266e6877fc75218625162e0460be9a3a098a61c6c`)
  - `site.js` — ~60 lines: footer year, theme toggle (localStorage), scroll-reveal, copy button
- The self-hosted stylesheet is pinned too: `assets/css/bootstrap.min.css`
  (sha256 `3c8f27e6009ccfd710a905e6dcf12d0ee3c6f2ac7da05b0572d3e0d12e736fc8`)
- **CSP** (`_headers`): `script-src 'self'`, `connect-src 'none'`,
  `frame-ancestors 'none'`. No analytics, no forms (contact is `mailto:` — a static
  site has no backend, so there are no fake "message sent" states).
- Home server not in the request path; Cloudflare's edge serves everything.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Home: hero, what-I-do cards, featured project, CTA |
| `about.html` | Story, "how I work" values, skills chips, certifications |
| `projects.html` | Card grid (replace placeholders, delete unused cards) |
| `experience.html` | Timeline + Bootstrap accordion details, education entry |
| `contact.html` | Email card with copy-to-clipboard, profile links, availability |
| `styles.css` | Custom design layer on top of Bootstrap (dark default + light theme) |
| `site.js` | Theme toggle, scroll-reveal, footer year, copy button |
| `_partials/` | Source-of-truth nav/header/footer — **when you edit these, re-sync the 5 pages** |
| `assets/css/bootstrap.min.css`, `assets/js/bootstrap.bundle.min.js` | Pinned Bootstrap 5.3.3 (self-hosted) |
| `_headers` | Security headers (CSP etc.). **Format gotcha:** it's `path-glob → indented header lines`, e.g. `/*` then 2-space-indented `Name: value` pairs. No comments allowed — every non-blank line must parse as a glob or a header pair. This exact mistake broke the first deploy (error code 100324). |
| `wrangler.jsonc` | Wrangler config for `npx wrangler deploy`. **`assets.exclude` keeps `.git/`, `_partials/`, README, and this file out of the public assets** — do not remove it; without it the whole repo (including git objects) gets published. (Wrangler reads no ignore *file*; exclusions live in this config.) |

### Keeping partials in sync

The five pages are fully assembled HTML (no build step, no SSI — Cloudflare Pages
won't expand `<!--#include-->`). If you change the nav or footer, edit it in
`_partials/header.html` / `_partials/footer.html`, then copy the changed block into
all five pages. A quick check:

```sh
for f in index about projects experience contact; do
  diff <(sed -n '/<header class="site-header/,/<\/header>/p' _partials/header.html) \
       <(sed -n '/<header class="site-header/,/<\/header>/p' $f.html) >/dev/null \
    && echo "$f: nav OK" || echo "$f: NAV DRIFT"
done
```

## Deploy (Cloudflare Pages, free)

1. Push this folder to a GitHub repo.
2. Cloudflare → **Workers & Pages** → **Create application** → **Pages** → connect repo.
   Build command: *none*. Build output directory: `.`
3. Pages project → **Custom domains** → `nathan.andmar.dev`.
   The CNAME Cloudflare creates overrides the wildcard A record for this hostname only;
   all tailnet services keep working untouched. Cert is automatic.

## Content checklist (grep for TODO)

- [ ] About: real story + "at a glance" facts
- [ ] Projects: replace placeholder cards, delete unused ones
- [ ] Experience: real roles (accordion bullets), education coursework
- [ ] Contact: GitHub/LinkedIn handles, availability line
- [ ] Footer: GitHub/LinkedIn URLs on every page
- [ ] Optional: host `resume.pdf` at repo root, link from Contact

## Design notes

- Dark by default with a light theme toggle (persisted in localStorage).
- Editorial serif display type (system Palatino stack) against system sans body — no web fonts.
- Scroll-reveal via IntersectionObserver; fully disabled under `prefers-reduced-motion`.
- Responsive: Bootstrap grid, hamburger nav on mobile.
