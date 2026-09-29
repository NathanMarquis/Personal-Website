# AGENTS.md

Static multi-page site (index/about/projects/experience/contact). No build step, no package.json, no tests or lint. Deployed to Cloudflare Pages (build command: none, output dir `.`) or locally via `npx wrangler deploy`.

## Partials workflow (most common mistake source)

- `_partials/header.html` and `_partials/footer.html` are the source of truth for nav/footer. Pages are fully assembled HTML — Cloudflare Pages does NOT expand SSI (`<!--#include-->` won't work).
- To change nav or footer: edit the partial, then copy the changed block into all five pages. Verify with the sed-diff sync check in the README (all five pages must print "nav OK").

## Deploy gotchas (both broke real deploys)

- `_headers` format: `path-glob` line followed by 2-space-indented `Name: value` pairs. No comments allowed — every non-blank line must parse as a glob or header pair, or deploy fails with error 100324.
- `wrangler.jsonc` `assets.exclude` is load-bearing: it keeps `.git/`, `_partials/`, README, and wrangler.jsonc out of published assets. Wrangler reads no ignore file; remove the exclude list and the whole repo (including git objects) gets published.

## Constraints that are enforced by CSP, not just style

- No third-party requests anywhere: Bootstrap 5.3.3 is self-hosted in `assets/` (both CSS and JS pinned, sha256s recorded in README), and `site.js` is the only other script. Never add CDNs, analytics, or web fonts — CSP is `script-src 'self'`, `connect-src 'none'`.
- No backend: contact is `mailto:` only. Don't add forms or fake "message sent" states.

## Misc

- Theme: dark default, light persisted in localStorage key `site-theme` via `data-bs-theme` on `<html>` (see site.js).
- Commit style: short imperative sentences ("Fix contact page link targets"), no conventional-commit prefixes.
