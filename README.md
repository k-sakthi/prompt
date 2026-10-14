# NEXUS-89 — Retro Terminal Portfolio

Static site: HTML, CSS and vanilla JS. No build step, no dependencies.

## Files
- `index.html` — all content (about, projects, skills, achievements)
- `css/styles.css` — design tokens, layout, CRT atmosphere
- `js/config.js` — **edit this**: email, GitHub, LinkedIn, project repo/demo URLs
- `js/main.js` — mobile menu, scroll-spy, boot sequence, link and copy-email logic
- `netlify.toml`, `vercel.json` — deploy config

## Edit your details
Open `js/config.js` and fill in real values. Empty values show a clear
"not configured / link not supplied" state. Skills, achievements and the
About text live in `index.html`; replace the PLACEHOLDER achievement slots.

## Run locally
    python3 -m http.server 8000   # then open http://localhost:8000

## Deploy
**Netlify (drag and drop):** go to app.netlify.com/drop and drop this folder.
**Netlify (CLI):** `npx netlify-cli deploy --prod --dir .`
**Vercel:** `npx vercel --prod` (framework: Other, no build command, output `.`).
