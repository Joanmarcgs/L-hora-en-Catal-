(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const phraseEl = $('#phrase');
  const digitalEl = $('#digital-time');
  const dateEl = $('#date-line');
  const statusDot = $('#status-dot');
  const statusText = $('#status-text');
  const themeBtn = $('#theme-toggle');
  const installBtn = $('#install-btn');
  const notifyBtn = $('#notify-toggle');
  const shareBtn = $('#share-btn');
  const copyBtn = $('#copy-btn');
  const nightstandBtn = $('#nightstand-btn');
  const toast = $('#toast');
  const toastMsg = $('#toast-msg');
  const toastAction = $('#toast-action');

  const hourHand = $('#hand-hour');
  const minuteHand = $('#hand-minute');
  const secondHand = $('#hand-second');

  const dateFormatter = new Intl.DateTimeFormat('ca', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // ---------- Clock face ticks ----------
  const ticksGroup = $('.clock-face .ticks');
  if (ticksGroup) {
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 * Math.PI) / 180;
      const major = i % 5 === 0;
      const outer = 90;
      const inner = major ? 78 : 84;
      const x1 = 100 + outer * Math.sin(angle);
      const y1 = 100 - outer * Math.cos(angle);
      const x2 = 100 + inner * Math.sin(angle);
      const y2 = 100 - inner * Math.cos(angle);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', major ? 'tick major' : 'tick');
      line.setAttribute('x1', x1.toFixed(2));
      line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2));
      line.setAttribute('y2', y2.toFixed(2));
      ticksGroup.appendChild(line);
    }
  }

  // ---------- Clock ----------
  let lastPhrase = '';

  function tick() {
    const now = new Date();
    const phrase = catalanTimePhrase(now);
    digitalEl.textContent = digitalTime(now) + ':' + String(now.getSeconds()).padStart(2, '0');
    const formattedDate = dateFormatter.format(now);
    dateEl.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    if (phrase !== lastPhrase) {
      lastPhrase = phrase;
      phraseEl.classList.add('swap');
      requestAnimationFrame(() => {
        phraseEl.textContent = phrase;
        requestAnimationFrame(() => phraseEl.classList.remove('swap'));
      });
      document.title = `${digitalTime(now)} · ${phrase}`;
    }

    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    hourHand.setAttribute('transform', `rotate(${h * 30 + m * 0.5})`);
    minuteHand.setAttribute('transform', `rotate(${m * 6 + s * 0.1})`);
    secondHand.setAttribute('transform', `rotate(${s * 6})`);
  }

  tick();
  setInterval(tick, 1000);

  // ---------- Theme ----------
  const THEME_KEY = 'hora-catalana-theme';

  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    themeBtn.textContent = theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '🌓';
  }

  applyTheme(localStorage.getItem(THEME_KEY));

  themeBtn.addEventListener('click', () => {
    const current = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveCurrent = current || (prefersDark ? 'dark' : 'light');
    const next = effectiveCurrent === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // ---------- Online / offline status ----------
  function updateOnlineStatus() {
    const online = navigator.onLine;
    statusDot.classList.toggle('offline', !online);
    statusText.textContent = online ? 'En línia' : 'Sense connexió · funciona igualment';
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(message, { actionLabel, onAction, sticky } = {}) {
    toastMsg.textContent = message;
    if (actionLabel && onAction) {
      toastAction.textContent = actionLabel;
      toastAction.hidden = false;
      toastAction.onclick = () => {
        onAction();
        hideToast();
      };
    } else {
      toastAction.hidden = true;
      toastAction.onclick = null;
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    if (!sticky) {
      toastTimer = setTimeout(hideToast, 5000);
    }
  }
  function hideToast() {
    toast.classList.remove('show');
  }

  // ---------- Install prompt ----------
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    installBtn.hidden = true;
    deferredInstallPrompt = null;
  });
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    installBtn.hidden = true;
  }
  installBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.hidden = true;
    } else {
      showToast('A iOS: prem Comparteix → "Afegeix a la pantalla d\'inici".');
    }
  });

  // ---------- Notifications: quarter-hour chime ----------
  const NOTIFY_KEY = 'hora-catalana-notify';
  let notifyTimer = null;

  function nextQuarterBoundary(now) {
    const next = new Date(now);
    next.setSeconds(0, 0);
    const minute = next.getMinutes();
    const add = 15 - (minute % 15);
    next.setMinutes(minute + add);
    return next;
  }

  async function fireQuarterNotification() {
    const phrase = catalanTimePhrase(new Date());
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      reg.showNotification("L'hora en català", {
        body: phrase,
        icon: 'icons/icon-192.png',
        badge: 'icons/icon-192.png',
        tag: 'quart-hora',
      });
    }
  }

  function scheduleNextChime() {
    clearTimeout(notifyTimer);
    const now = new Date();
    const next = nextQuarterBoundary(now);
    const delay = next.getTime() - now.getTime();
    notifyTimer = setTimeout(async () => {
      await fireQuarterNotification();
      scheduleNextChime();
    }, delay);
  }

  function setNotifyUI(enabled) {
    notifyBtn.setAttribute('aria-pressed', String(enabled));
    notifyBtn.textContent = enabled ? '🔔 Avisos actius' : '🔕 Avisa cada quart';
  }

  async function toggleNotify() {
    const enabled = localStorage.getItem(NOTIFY_KEY) === '1';
    if (enabled) {
      localStorage.setItem(NOTIFY_KEY, '0');
      clearTimeout(notifyTimer);
      setNotifyUI(false);
      return;
    }
    if (!('Notification' in window)) {
      showToast('Aquest navegador no admet notificacions.');
      return;
    }
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      showToast('Cal permetre les notificacions per activar els avisos.');
      return;
    }
    localStorage.setItem(NOTIFY_KEY, '1');
    setNotifyUI(true);
    scheduleNextChime();
    showToast('T\'avisarem cada quart d\'hora mentre l\'app estigui oberta.');
  }

  notifyBtn.addEventListener('click', toggleNotify);

  if (localStorage.getItem(NOTIFY_KEY) === '1' && 'Notification' in window && Notification.permission === 'granted') {
    setNotifyUI(true);
    scheduleNextChime();
  } else {
    setNotifyUI(false);
  }

  // ---------- Share / copy ----------
  shareBtn.addEventListener('click', async () => {
    const text = `${lastPhrase} (${digitalTime(new Date())})`;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: "L'hora en català" });
      } catch (_) { /* user cancelled */ }
    } else {
      await copyToClipboard(text);
      showToast('Copiat al porta-retalls (no hi ha suport per compartir).');
    }
  });

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  copyBtn.addEventListener('click', async () => {
    await copyToClipboard(`${lastPhrase} (${digitalTime(new Date())})`);
    showToast('Frase copiada!');
  });

  // ---------- Nightstand / kiosk mode ----------
  const NIGHTSTAND_KEY = 'hora-catalana-nightstand';

  function setNightstand(on) {
    document.body.classList.toggle('nightstand', on);
    localStorage.setItem(NIGHTSTAND_KEY, on ? '1' : '0');
  }
  nightstandBtn.addEventListener('click', () => setNightstand(true));
  document.body.addEventListener('click', (e) => {
    if (document.body.classList.contains('nightstand') && e.target === document.body) {
      setNightstand(false);
    }
  });
  document.body.addEventListener('dblclick', () => {
    if (document.body.classList.contains('nightstand')) setNightstand(false);
  });
  const urlWantsNightstand = new URLSearchParams(location.search).get('nightstand') === '1';
  if (urlWantsNightstand || localStorage.getItem(NIGHTSTAND_KEY) === '1') setNightstand(true);

  // ---------- Service worker: register + auto-update ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('sw.js');

        // If a new worker takes over, the app shell changed underneath us: reload once.
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        function handleWaiting(worker) {
          worker.postMessage({ type: 'SKIP_WAITING' });
        }

        if (reg.waiting) handleWaiting(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              handleWaiting(worker);
            }
          });
        });

        // Poll a tiny version file to prompt the SW to re-check itself.
        async function checkForUpdate() {
          try {
            const res = await fetch('version.json', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            const seen = localStorage.getItem('hora-catalana-version');
            if (seen && seen !== data.version) {
              reg.update();
            }
            localStorage.setItem('hora-catalana-version', data.version);
          } catch (_) { /* offline: ignore, cached app keeps working */ }
        }

        checkForUpdate();
        setInterval(checkForUpdate, 5 * 60 * 1000);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate();
        });
      } catch (err) {
        console.warn('No s\'ha pogut registrar el service worker', err);
      }
    });
  }
})();
