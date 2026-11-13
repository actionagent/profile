# sabari@agents — portfolio

Static site. No build step. ~50 KB of own code + vendored three.js (r160, MIT).

## Files
| file | purpose |
|---|---|
| `data.js` | **all content** (profile, agents, loop, timeline, skills). Edit only this. |
| `index.html` / `style.css` | layout + styling |
| `app.js` | rendering, terminal, in-browser TF-IDF retrieval, scroll logic |
| `scene.js` | Three.js particle field; one shape per section, morphs on scroll |
| `vendor/three.module.min.js` | three.js, vendored (no CDN dependency) |

## Before publishing
1. `data.js` → set `linkedin`, `github` (empty = hidden).
2. Optional résumé: put a PDF in `assets/resume.pdf`, set `resume: "assets/resume.pdf"`. Strip your phone number first: it's public.
3. Preview locally: `python3 -m http.server 8000` → http://localhost:8000 (ES modules don't load from `file://`).

## Deploy (free)
**Netlify (default)**
- Fastest: app.netlify.com/drop → drag this folder. Live in ~10 s at `*.netlify.app`.
- With Git (auto-deploy on push): push folder to a GitHub repo → Netlify → Add new site → Import from Git → publish directory `.` , no build command.
- Rename: Site settings → Change site name → `sabari.netlify.app` (if free).

**Alternatives**
| host | tradeoff |
|---|---|
| Cloudflare Pages | Unlimited bandwidth, fastest CDN; dashboard slightly more involved. |
| Vercel | Great DX + previews per PR; free tier is for non-commercial use. |
| GitHub Pages | Zero extra account; `username.github.io` URL; no custom headers. |

Custom domain (~₹800/yr for `.dev`/`.in`): add it in any host above; HTTPS is automatic.

## Interactions
- `` ` `` key → terminal (`help`, `whoami`, `agents`, `ask <q>`, `goto <section>`).
- Ask section: client-side retrieval over `data.js` content. No LLM/API key. To upgrade to a real LLM later, use a serverless function (Netlify Functions) holding the key; never put keys in this static code.
- Respects `prefers-reduced-motion`; 3D degrades gracefully if WebGL is unavailable.
