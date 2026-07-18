# L'hora en català

A small installable web app that tells the time the way it's actually said in
Catalan — "Dos quarts de cinc", "Un quart i mig de dues" — instead of a plain
digital readout.

It's a Progressive Web App (PWA) with a retro pixel-art look: install it on
desktop or mobile and it keeps working offline, updating itself automatically
whenever a new version is published.

## Features

- **Correct Catalan time phrases** for every minute of the day, following the
  quarter-hour system (`un quart de X`, `dos quarts de X`, `tres quarts de
  X`), including the "gairebé" (almost) and "tocat/tocada" (just struck)
  nuances.
- **Interactive clock** — drag the hour or minute hand around the analog
  face, or drag the digital HH/MM digits up and down, to preview any time.
  Both views stay in sync and the Catalan phrase updates live. The second
  hand is display-only and keeps sweeping for show. A "Torna a l'hora
  actual" button snaps back to live time.
- **Alarms** — set any number of daily-repeating alarms from the Alarmes
  modal. Firing one shows a notification, plays a synthesized beep, vibrates
  on supported devices, and shows an in-app banner, all using the Catalan
  phrase for that moment.
- **Analog clock face** (SVG) with hour numbers and a color-coded legend,
  alongside the digital time and the Catalan date.
- **Installable** on desktop and mobile (manifest + icons); iOS gets
  instructions for "Add to Home Screen" since it doesn't support the install
  prompt.
- **Works offline** — a service worker precaches the whole app shell, so the
  installed app keeps working even if this site goes down.
- **Self-updating** — the app periodically checks `version.json`; when it
  changes, the service worker fetches the new files and reloads
  automatically, no manual update needed.
- Light/dark theme (retro/8-bit styling in both), and share/copy the current
  phrase.

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
index.html               App shell
css/style.css             Styling, light/dark theme
js/catalanTime.js         Pure Catalan time-phrase engine
js/app.js                 Clock rendering, drag-to-set-time, alarms,
                           theme, install prompt, service worker lifecycle
sw.js                     Offline cache + self-update logic
manifest.webmanifest      PWA metadata, icons
version.json              Bumped on every deploy to trigger auto-update
icons/                    Generated app icons (regular + maskable)
```

## Deploying a new version

Update `VERSION` in `sw.js` and the `version` field in `version.json` to the
same value before publishing. That's what tells installed apps a new version
exists so they can update themselves.
