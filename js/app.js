(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const phraseEl = $('#phrase');
  const digiH = $('#digi-h');
  const digiM = $('#digi-m');
  const digiS = $('#digi-s');
  const dateEl = $('#date-line');
  const statusDot = $('#status-dot');
  const statusText = $('#status-text');
  const themeBtn = $('#theme-toggle');
  const installBtn = $('#install-btn');
  const notifyBtn = $('#notify-toggle');
  const shareBtn = $('#share-btn');
  const copyBtn = $('#copy-btn');
  const resetTimeBtn = $('#reset-time-btn');
  const toast = $('#toast');
  const toastMsg = $('#toast-msg');
  const toastAction = $('#toast-action');
  const clockFace = $('.clock-face');

  const hourHand = $('#hand-hour');
  const minuteHand = $('#hand-minute');
  const secondHand = $('#hand-second');

  const dateFormatter = new Intl.DateTimeFormat('ca', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const pad2 = (n) => String(n).padStart(2, '0');

  // ---------- Clock face: ticks + hour numbers ----------
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ticksGroup = $('.clock-face .ticks');
  const numbersGroup = $('.clock-face .numbers');

  if (ticksGroup) {
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 * Math.PI) / 180;
      const major = i % 5 === 0;
      const outer = 90;
      const inner = major ? 80 : 85;
      const x1 = 100 + outer * Math.sin(angle);
      const y1 = 100 - outer * Math.cos(angle);
      const x2 = 100 + inner * Math.sin(angle);
      const y2 = 100 - inner * Math.cos(angle);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('class', major ? 'tick major' : 'tick');
      line.setAttribute('x1', x1.toFixed(2));
      line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2));
      line.setAttribute('y2', y2.toFixed(2));
      ticksGroup.appendChild(line);
    }
  }

  if (numbersGroup) {
    for (let n = 1; n <= 12; n++) {
      const angle = (n * 30 * Math.PI) / 180;
      const r = 68;
      const x = 100 + r * Math.sin(angle);
      const y = 100 - r * Math.cos(angle);
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('class', 'num');
      text.setAttribute('x', x.toFixed(2));
      text.setAttribute('y', y.toFixed(2));
      text.textContent = String(n);
      numbersGroup.appendChild(text);
    }
  }

  // ---------- Time state ----------
  // frozenTime holds a manually-set moment: while it's set, the clock (and
  // its seconds) stops advancing entirely and shows exactly that moment,
  // until "Hora real" clears it and live ticking resumes.
  let frozenTime = null;
  const displayNow = () => frozenTime || new Date();

  let lastPhrase = '';

  function render(date) {
    const phrase = catalanTimePhrase(date);
    digiH.textContent = pad2(date.getHours());
    digiM.textContent = pad2(date.getMinutes());
    digiS.textContent = pad2(date.getSeconds());

    const formattedDate = dateFormatter.format(date);
    dateEl.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    if (phrase !== lastPhrase) {
      lastPhrase = phrase;
      phraseEl.classList.add('swap');
      requestAnimationFrame(() => {
        phraseEl.textContent = phrase;
        requestAnimationFrame(() => phraseEl.classList.remove('swap'));
      });
      document.title = `${digitalTime(date)} · ${phrase}`;
    }

    const h = date.getHours() % 12;
    const m = date.getMinutes();
    const s = date.getSeconds();
    hourHand.setAttribute('transform', `rotate(${h * 30 + m * 0.5})`);
    minuteHand.setAttribute('transform', `rotate(${m * 6 + s * 0.1})`);
    secondHand.setAttribute('transform', `rotate(${s * 6})`);

    resetTimeBtn.hidden = frozenTime === null;
  }

  render(displayNow());
  setInterval(() => {
    if (!isDragging && !frozenTime) render(displayNow());
  }, 1000);

  resetTimeBtn.addEventListener('click', () => {
    frozenTime = null;
    render(displayNow());
    showToast("Tornant a l'hora real.");
  });

  // ---------- Drag-to-set-time: shared helpers ----------
  let isDragging = false;

  function applyDraft(baseline, unit, value) {
    const draft = new Date(baseline);
    if (unit === 'hour') draft.setHours(value);
    if (unit === 'minute') draft.setMinutes(value);
    // Zero the seconds so the minute hand lands exactly on the minute mark
    // being set, rather than sitting wherever it was when the drag started.
    draft.setSeconds(0);
    frozenTime = draft;
    render(draft);
  }

  // ---------- Drag the analog hands ----------
  // Only the hour and minute hands are draggable; the second hand just
  // sweeps for show. A zone-based detector on the whole face (rather than
  // per-hand hit targets) picks hour vs. minute by click radius, which
  // stays unambiguous even when the hands happen to overlap.
  const HAND_LENGTH = { hour: 42, minute: 68 };

  function svgPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    return pt.matrixTransform(ctm.inverse());
  }

  function zoneForRadius(radius) {
    if (radius < 15) return null; // too close to the pivot, likely accidental
    if (radius < (HAND_LENGTH.hour + HAND_LENGTH.minute) / 2) return 'hour';
    if (radius < 96) return 'minute';
    return null; // out past the minute hand / on the second hand: not draggable
  }

  function pointerAngle(e) {
    const pt = svgPoint(clockFace, e.clientX, e.clientY);
    const radius = Math.hypot(pt.x - 100, pt.y - 100);
    const angleDeg = (Math.atan2(pt.x - 100, -(pt.y - 100)) * 180) / Math.PI;
    return { angle: (angleDeg + 360) % 360, radius };
  }

  (() => {
    const hitArea = $('.clock-face .hit-area');
    let baseline = null;
    let unit = null;
    let startValue = 0;
    let lastAngle = 0;
    let totalRotation = 0; // unwrapped degrees turned since drag start, +/- across multiple laps

    hitArea.addEventListener('pointerdown', (e) => {
      const { angle, radius } = pointerAngle(e);
      unit = zoneForRadius(radius);
      if (!unit) return;
      e.preventDefault();
      isDragging = true;
      baseline = displayNow();
      startValue = unit === 'hour' ? baseline.getHours() : baseline.getMinutes();
      lastAngle = angle;
      totalRotation = 0;
      clockFace.classList.add('dragging');
      hitArea.setPointerCapture(e.pointerId);
    });

    hitArea.addEventListener('pointermove', (e) => {
      if (!baseline || !hitArea.hasPointerCapture(e.pointerId)) return;
      const { angle } = pointerAngle(e);
      // Unwrap: the shortest signed step from the last sample, so spinning
      // a hand past 12 repeatedly keeps advancing instead of snapping back
      // to a single lap's 0-59 (or 0-23) value.
      let step = angle - lastAngle;
      if (step > 180) step -= 360;
      if (step < -180) step += 360;
      totalRotation += step;
      lastAngle = angle;
      const degreesPerUnit = unit === 'hour' ? 30 : 6;
      const value = startValue + Math.round(totalRotation / degreesPerUnit);
      applyDraft(baseline, unit, value);
    });

    const endDrag = (e) => {
      if (!baseline) return;
      isDragging = false;
      baseline = null;
      unit = null;
      clockFace.classList.remove('dragging');
      if (hitArea.hasPointerCapture?.(e.pointerId)) hitArea.releasePointerCapture(e.pointerId);
    };
    hitArea.addEventListener('pointerup', endDrag);
    hitArea.addEventListener('pointercancel', endDrag);
  })();

  // ---------- Drag the digital hours / minutes ----------
  // Seconds are shown but not draggable, matching the analog second hand,
  // which just sweeps for show.
  function makeDigitDraggable(el, unit, getValue) {
    let baseline = null;
    let startY = 0;
    let startValue = 0;
    const PX_PER_STEP = 12;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      isDragging = true;
      baseline = displayNow();
      startY = e.clientY;
      startValue = getValue(baseline);
      el.classList.add('dragging');
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!baseline || !el.hasPointerCapture(e.pointerId)) return;
      const deltaY = startY - e.clientY; // up = positive = increase
      const steps = Math.trunc(deltaY / PX_PER_STEP);
      applyDraft(baseline, unit, startValue + steps);
    });

    const endDrag = (e) => {
      if (!baseline) return;
      isDragging = false;
      baseline = null;
      el.classList.remove('dragging');
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }

  makeDigitDraggable(digiH, 'hour', (d) => d.getHours());
  makeDigitDraggable(digiM, 'minute', (d) => d.getMinutes());

  // ---------- Theme ----------
  const THEME_KEY = 'hora-catalana-theme';

  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effective = theme === 'dark' || theme === 'light' ? theme : (prefersDark ? 'dark' : 'light');
    themeBtn.textContent = effective === 'dark' ? 'DIA' : 'NIT';
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
    statusText.textContent = online ? 'En línia' : 'Sense connexió';
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
      toastTimer = setTimeout(hideToast, 4000);
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

  // ---------- Notifications: quarter-hour chime (uses real time, not the draggable one) ----------
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
    notifyBtn.textContent = enabled ? 'Avisos: ON' : 'Avisa cada quart';
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
    const text = `${lastPhrase} (${digitalTime(displayNow())})`;
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
    await copyToClipboard(`${lastPhrase} (${digitalTime(displayNow())})`);
    showToast('Frase copiada!');
  });

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
