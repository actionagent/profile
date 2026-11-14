# Sabarinathan Balakrishnan · portfolio

Static site. No build step, no dependencies to install. three.js (r160, MIT) is vendored.

## Files
| file | purpose |
|---|---|
| `data.js` | **All content**: profile, impact, projects (incl. diagram nodes/edges), approach, career, skills. Edit only this for content changes. |
| `index.html` | Semantic structure, SEO metadata, JSON-LD |
| `style.css` | Design tokens (top of file) + components |
| `app.js` | Rendering, architecture diagrams, terminal, in-browser retrieval, scroll logic |
| `scene.js` | Particle field; one shape per section (`data-scene` on each `<section>`) |
| `assets/` | Resume PDF (phone number removed), social preview image |

## Content rules
- Every claim in `data.js` traces to the resume. Add metrics only when verified.
- Project diagrams: `n(id, label, sub, col, row, kind, note)` places a node on a grid; `edges` are `[from, to]`. Kinds: `source | step | store | human | guard`.
- Empty `linkedin`, `github` or `resume` in `PROFILE` hides those links everywhere.
- If the site moves to another domain, update the URLs in `index.html` (canonical, og:*, JSON-LD), `robots.txt` and `sitemap.xml`.

## Preview locally
`python3 -m http.server 8000` then open http://localhost:8000 (ES modules do not load from `file://`).

## Deploy
Netlify is connected to this repo: every push to `main` redeploys. Publish directory `.`, no build command (`netlify.toml`).

## Accessibility and performance notes
- Keyboard: skip link, focusable project headers and diagram nodes, Esc closes menu and terminal.
- `prefers-reduced-motion` turns off all animation; the 3D scene degrades to a static cloud, and the page works without WebGL.
- The 3D scene loads after first paint and never blocks content.
