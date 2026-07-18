# L'hora en català

A small installable web app that tells the time the way it's actually said in
Catalan — "Dos quarts de cinc", "Un quart i mig de dues" — instead of a plain
digital readout.

It's a Progressive Web App (PWA): install it on desktop or mobile and it
keeps working offline, updating itself automatically whenever a new version
is published.

## Features

- **Correct Catalan time phrases** for every minute of the day, following the
  quarter-hour system (`un quart de X`, `dos quarts de X`, `tres quarts de
  X`), including the "gairebé" (almost) and "tocat/tocada" (just struck)
  nuances.
- **Analog clock face** (SVG) alongside the digital time and the Catalan date.
- **Installable** on desktop and mobile (manifest + icons); iOS gets
  instructions for "Add to Home Screen" since it doesn't support the install
  prompt.
- **Works offline** — a service worker precaches the whole app shell, so the
  installed app keeps working even if this site goes down.
- **Self-updating** — the app periodically checks `version.json`; when it
  changes, the service worker fetches the new files and reloads
  automatically, no manual update needed.
- **Local notifications** — optionally get notified every quarter hour with
  the current phrase (best-effort, browser-permission based; no backend/push
  server).
- Light/dark theme, share/copy the current phrase, and a distraction-free
  "nightstand" full-screen mode (also available as an install shortcut).

## Running locally

No build step — it's static HTML/CSS/JS. Serve the folder with anything that
speaks HTTP (service workers require `http://localhost` or `https://`, not
`file://`):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Project structure

```
index.html              App shell
css/style.css            Styling, light/dark theme
js/catalanTime.js        Pure Catalan time-phrase engine
js/app.js                Clock rendering, theme, install prompt,
                          notifications, service worker lifecycle
sw.js                    Offline cache + self-update logic
manifest.webmanifest     PWA metadata, icons, install shortcuts
version.json             Bumped on every deploy to trigger auto-update
icons/                   Generated app icons (regular + maskable)
```

## Deploying a new version

Update `VERSION` in `sw.js` and the `version` field in `version.json` to the
same value before publishing. That's what tells installed apps a new version
exists so they can update themselves.
