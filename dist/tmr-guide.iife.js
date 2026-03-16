var TMRGuide = function(exports) {
  "use strict";
  const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];
  class BotCharacter {
    constructor(size = 72, primaryColor = "#ff6700") {
      this.size = size;
      this.primaryColor = primaryColor;
      this.container = null;
      this.inner = null;
      this.svg = null;
      this.mouthEl = null;
      this.eyeL = null;
      this.eyeR = null;
      this.eyeShineL = null;
      this.eyeShineR = null;
      this.blinkTimer = null;
      this.mouthTimer = null;
      this.mouthOpen = false;
    }
    mount(container) {
      this.container = container;
      const inner = document.createElement("div");
      inner.className = "tmrg-char-inner";
      inner.style.cssText = `display:inline-block;position:relative;`;
      const svg = this.buildSVG();
      inner.appendChild(svg);
      container.appendChild(inner);
      this.inner = inner;
      this.scheduleBlink();
    }
    setState(state) {
      if (!this.container) return;
      this.container.dataset.state = state;
      if (state === "thinking") {
        this.eyeL.setAttribute("cy", "19");
        this.eyeR.setAttribute("cy", "19");
      } else {
        this.eyeL.setAttribute("cy", "22");
        this.eyeR.setAttribute("cy", "22");
      }
      if (state === "talking") {
        this.startMouthAnim();
      } else {
        this.stopMouthAnim();
      }
      if (state === "celebrating") {
        this.spawnSparkles();
      }
    }
    destroy() {
      this.stopMouthAnim();
      if (this.blinkTimer) {
        clearTimeout(this.blinkTimer);
        this.blinkTimer = null;
      }
      this.container = null;
      this.inner = null;
      this.svg = null;
      this.mouthEl = null;
      this.eyeL = null;
      this.eyeR = null;
    }
    // ─── private ───────────────────────────────────────────────────
    /** Schedule the next blink at a random interval (2.5s – 6s). */
    scheduleBlink() {
      const delay = 2500 + Math.random() * 3500;
      this.blinkTimer = setTimeout(() => {
        this.blink();
        this.scheduleBlink();
      }, delay);
    }
    /**
     * Quick blink: squish ry to near-zero for 120ms then restore.
     * Also hide the shine dot so it doesn't float in mid-air.
     */
    blink() {
      if (!this.eyeL || !this.eyeR) return;
      const BLINK_DUR = 120;
      this.eyeL.setAttribute("ry", "0.6");
      this.eyeR.setAttribute("ry", "0.6");
      if (this.eyeShineL) this.eyeShineL.style.opacity = "0";
      if (this.eyeShineR) this.eyeShineR.style.opacity = "0";
      setTimeout(() => {
        if (this.eyeL) this.eyeL.setAttribute("ry", "4");
        if (this.eyeR) this.eyeR.setAttribute("ry", "4");
        if (this.eyeShineL) this.eyeShineL.style.opacity = "1";
        if (this.eyeShineR) this.eyeShineR.style.opacity = "1";
      }, BLINK_DUR);
    }
    buildSVG() {
      const s = this.size;
      const c = this.primaryColor;
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("width", String(s));
      svg.setAttribute("height", String(s));
      svg.setAttribute("viewBox", "0 0 72 72");
      svg.setAttribute("fill", "none");
      svg.setAttribute("xmlns", ns);
      this.svg = svg;
      const shadow = document.createElementNS(ns, "ellipse");
      shadow.setAttribute("cx", "36");
      shadow.setAttribute("cy", "70");
      shadow.setAttribute("rx", "18");
      shadow.setAttribute("ry", "3");
      shadow.setAttribute("fill", "rgba(0,0,0,0.12)");
      svg.appendChild(shadow);
      const body = document.createElementNS(ns, "rect");
      body.setAttribute("x", "18");
      body.setAttribute("y", "30");
      body.setAttribute("width", "36");
      body.setAttribute("height", "26");
      body.setAttribute("rx", "6");
      body.setAttribute("fill", c);
      svg.appendChild(body);
      const head = document.createElementNS(ns, "rect");
      head.setAttribute("x", "16");
      head.setAttribute("y", "8");
      head.setAttribute("width", "40");
      head.setAttribute("height", "30");
      head.setAttribute("rx", "10");
      head.setAttribute("fill", "#1f2937");
      svg.appendChild(head);
      const screen = document.createElementNS(ns, "rect");
      screen.setAttribute("x", "20");
      screen.setAttribute("y", "12");
      screen.setAttribute("width", "32");
      screen.setAttribute("height", "22");
      screen.setAttribute("rx", "6");
      screen.setAttribute("fill", "#111827");
      svg.appendChild(screen);
      const antennaBase = document.createElementNS(ns, "rect");
      antennaBase.setAttribute("x", "34");
      antennaBase.setAttribute("y", "2");
      antennaBase.setAttribute("width", "4");
      antennaBase.setAttribute("height", "8");
      antennaBase.setAttribute("rx", "2");
      antennaBase.setAttribute("fill", "#374151");
      svg.appendChild(antennaBase);
      const antennaBall = document.createElementNS(ns, "circle");
      antennaBall.setAttribute("cx", "36");
      antennaBall.setAttribute("cy", "2");
      antennaBall.setAttribute("r", "3");
      antennaBall.setAttribute("fill", c);
      svg.appendChild(antennaBall);
      const eyeL = document.createElementNS(ns, "ellipse");
      eyeL.setAttribute("cx", "29");
      eyeL.setAttribute("cy", "22");
      eyeL.setAttribute("rx", "4");
      eyeL.setAttribute("ry", "4");
      eyeL.setAttribute("fill", c);
      svg.appendChild(eyeL);
      this.eyeL = eyeL;
      const eyeR = document.createElementNS(ns, "ellipse");
      eyeR.setAttribute("cx", "43");
      eyeR.setAttribute("cy", "22");
      eyeR.setAttribute("rx", "4");
      eyeR.setAttribute("ry", "4");
      eyeR.setAttribute("fill", c);
      svg.appendChild(eyeR);
      this.eyeR = eyeR;
      const shineL = document.createElementNS(ns, "circle");
      shineL.setAttribute("cx", "31");
      shineL.setAttribute("cy", "20");
      shineL.setAttribute("r", "1.5");
      shineL.setAttribute("fill", "white");
      svg.appendChild(shineL);
      this.eyeShineL = shineL;
      const shineR = document.createElementNS(ns, "circle");
      shineR.setAttribute("cx", "45");
      shineR.setAttribute("cy", "20");
      shineR.setAttribute("r", "1.5");
      shineR.setAttribute("fill", "white");
      svg.appendChild(shineR);
      this.eyeShineR = shineR;
      const mouth = document.createElementNS(ns, "rect");
      mouth.setAttribute("x", "28");
      mouth.setAttribute("y", "28");
      mouth.setAttribute("width", "16");
      mouth.setAttribute("height", "4");
      mouth.setAttribute("rx", "2");
      mouth.setAttribute("fill", "#374151");
      svg.appendChild(mouth);
      this.mouthEl = mouth;
      const chest = document.createElementNS(ns, "circle");
      chest.setAttribute("cx", "36");
      chest.setAttribute("cy", "40");
      chest.setAttribute("r", "4");
      chest.setAttribute("fill", "rgba(255,255,255,0.25)");
      svg.appendChild(chest);
      const armL = document.createElementNS(ns, "rect");
      armL.setAttribute("x", "10");
      armL.setAttribute("y", "32");
      armL.setAttribute("width", "10");
      armL.setAttribute("height", "16");
      armL.setAttribute("rx", "5");
      armL.setAttribute("fill", "#374151");
      svg.appendChild(armL);
      const armR = document.createElementNS(ns, "rect");
      armR.setAttribute("x", "52");
      armR.setAttribute("y", "32");
      armR.setAttribute("width", "10");
      armR.setAttribute("height", "16");
      armR.setAttribute("rx", "5");
      armR.setAttribute("fill", "#374151");
      svg.appendChild(armR);
      const legL = document.createElementNS(ns, "rect");
      legL.setAttribute("x", "22");
      legL.setAttribute("y", "54");
      legL.setAttribute("width", "10");
      legL.setAttribute("height", "14");
      legL.setAttribute("rx", "5");
      legL.setAttribute("fill", "#374151");
      svg.appendChild(legL);
      const legR = document.createElementNS(ns, "rect");
      legR.setAttribute("x", "40");
      legR.setAttribute("y", "54");
      legR.setAttribute("width", "10");
      legR.setAttribute("height", "14");
      legR.setAttribute("rx", "5");
      legR.setAttribute("fill", "#374151");
      svg.appendChild(legR);
      return svg;
    }
    startMouthAnim() {
      if (this.mouthTimer) return;
      this.mouthTimer = setInterval(() => {
        if (!this.mouthEl) return;
        this.mouthOpen = !this.mouthOpen;
        this.mouthEl.setAttribute("height", this.mouthOpen ? "7" : "4");
        this.mouthEl.setAttribute("y", this.mouthOpen ? "26" : "28");
      }, 180);
    }
    stopMouthAnim() {
      if (this.mouthTimer) {
        clearInterval(this.mouthTimer);
        this.mouthTimer = null;
      }
      if (this.mouthEl) {
        this.mouthEl.setAttribute("height", "4");
        this.mouthEl.setAttribute("y", "28");
      }
      this.mouthOpen = false;
    }
    spawnSparkles() {
      if (!this.inner) return;
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const dot = document.createElement("div");
          dot.className = "tmrg-sparkle";
          const angle = i / 6 * 360;
          const rad = angle * Math.PI / 180;
          const dist = 28 + Math.random() * 16;
          dot.style.setProperty("--sx", `${Math.cos(rad) * dist}px`);
          dot.style.setProperty("--sy", `${Math.sin(rad) * dist}px`);
          dot.style.backgroundColor = SPARKLE_COLORS[i % SPARKLE_COLORS.length];
          dot.style.top = "30px";
          dot.style.left = "33px";
          this.inner.appendChild(dot);
          setTimeout(() => dot.remove(), 750);
        }, i * 60);
      }
    }
  }
  const CHARACTER_CSS = `
/* ── tmr-guide character ─────────────────────────────────────── */
#tmr-guide-root {
  position: fixed;
  top: 0; left: 0;
  width: 0; height: 0;
  z-index: 2147483640;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.tmrg-char {
  position: fixed;
  /* Above the spotlight overlay (2147483638) and ring (2147483639) so the
     character is always fully visible even when the overlay is active */
  z-index: 2147483640;
  pointer-events: auto;
  cursor: pointer;
  transition: left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
              top  0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, left, top;
}

/* States */
.tmrg-char[data-state="idle"] .tmrg-char-inner {
  animation: tmrg-float 2.4s ease-in-out infinite;
}
.tmrg-char[data-state="walking"] .tmrg-char-inner {
  animation: tmrg-walk 0.45s ease-in-out infinite;
}
.tmrg-char[data-state="talking"] .tmrg-char-inner {
  animation: tmrg-talk 0.35s ease-in-out infinite;
}
.tmrg-char[data-state="thinking"] .tmrg-char-inner {
  animation: tmrg-think 1.2s ease-in-out infinite;
}
.tmrg-char[data-state="celebrating"] .tmrg-char-inner {
  animation: tmrg-celebrate 0.5s ease-in-out 3;
}

@media (prefers-reduced-motion: reduce) {
  .tmrg-char[data-state] .tmrg-char-inner { animation: none !important; }
  .tmrg-char { transition: none !important; }
}

@keyframes tmrg-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
@keyframes tmrg-walk {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%       { transform: translateY(-3px) rotate(2deg); }
}
@keyframes tmrg-talk {
  0%, 100% { transform: scaleY(1); }
  50%       { transform: scaleY(0.96); }
}
@keyframes tmrg-think {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25%       { transform: translateY(-2px) rotate(-3deg); }
  75%       { transform: translateY(-2px) rotate(3deg); }
}
@keyframes tmrg-celebrate {
  0%   { transform: translateY(0) scale(1); }
  30%  { transform: translateY(-18px) scale(1.08); }
  60%  { transform: translateY(-4px) scale(0.97); }
  100% { transform: translateY(0) scale(1); }
}

/* ── Toggle button — shared base ──────────────────────────────── */
.tmrg-toggle-btn {
  position: absolute;
  bottom: -26px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px 3px 7px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.13);
  background: #fff;
  color: #888;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
  transition: opacity 0.18s, background 0.12s, color 0.12s, border-color 0.12s;
  line-height: 1;
  font-family: inherit;
}
.tmrg-toggle-btn:hover { background: #f4f4f4; color: #444; }
.tmrg-toggle-btn[data-enabled="false"] {
  color: #ff6700;
  border-color: rgba(255,103,0,0.35);
  background: rgba(255,103,0,0.05);
}
.tmrg-toggle-btn[data-enabled="false"]:hover { background: rgba(255,103,0,0.10); }

/* hover variant — hidden by default; JS controls show/hide with a grace-period delay */
.tmrg-toggle-btn[data-style="hover"] {
  opacity: 0;
  pointer-events: none;
}

/* badge variant — icon-only circle on character top-right corner */
.tmrg-toggle-btn[data-style="badge"] {
  bottom: auto;
  top: -5px;
  right: -5px;
  left: auto;
  transform: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  font-size: 0;
}

/* ── Corner chip — detached fixed pill ────────────────────────── */
.tmrg-corner-chip {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px 4px 8px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.13);
  background: #fff;
  color: #888;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  line-height: 1;
  font-family: inherit;
  z-index: 2147483641;
}
.tmrg-corner-chip:hover { background: #f4f4f4; color: #444; }
.tmrg-corner-chip[data-enabled="false"] {
  color: #ff6700;
  border-color: rgba(255,103,0,0.35);
  background: rgba(255,103,0,0.05);
}
.tmrg-corner-chip[data-enabled="false"]:hover { background: rgba(255,103,0,0.10); }

/* ── Context menu ─────────────────────────────────────────────── */
.tmrg-ctx-menu {
  position: fixed;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.13);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.14);
  padding: 4px;
  z-index: 2147483641;
  pointer-events: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.tmrg-ctx-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  border-radius: 5px;
  white-space: nowrap;
  transition: background 0.1s;
}
.tmrg-ctx-item:hover { background: #f4f4f4; }

/* Sparkles on celebrate */
.tmrg-sparkle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  pointer-events: none;
  animation: tmrg-sparkle-pop 0.7s ease-out forwards;
  opacity: 0;
}
@keyframes tmrg-sparkle-pop {
  0%   { transform: translate(0,0) scale(0); opacity: 1; }
  100% { transform: translate(var(--sx), var(--sy)) scale(1); opacity: 0; }
}
`;
  function injectCSS(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
  function createElement(tag, attrs = {}, styles = {}) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v !== void 0) el.setAttribute(k, v);
    }
    Object.assign(el.style, styles);
    return el;
  }
  function getRect(selector) {
    const el = document.querySelector(selector);
    if (!el) return null;
    return el.getBoundingClientRect();
  }
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  const SPOTLIGHT_CSS = `
.tmrg-spotlight {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483638;
  transition: opacity 0.35s ease;
}
.tmrg-spotlight-svg {
  width: 100%; height: 100%;
}

/* ── Highlight ring ──────────────────────────────────────────────── */
.tmrg-highlight-ring {
  position: fixed;
  border-radius: 10px;
  pointer-events: none;
  z-index: 2147483639;
  transition: left   0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              top    0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              width  0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.35s ease;
  opacity: 0;
}
.tmrg-highlight-ring.visible { opacity: 1; }

/* pulse mode — 3 pulses then fades */
@keyframes tmrg-ring-pulse {
  0%   { box-shadow: var(--tmrg-ring-shadow); transform: scale(1);    opacity: 1; }
  15%  { box-shadow: var(--tmrg-ring-wide);   transform: scale(1.04); opacity: 1; }
  30%  { box-shadow: var(--tmrg-ring-shadow); transform: scale(1);    opacity: 1; }
  45%  { box-shadow: var(--tmrg-ring-wide);   transform: scale(1.04); opacity: 1; }
  60%  { box-shadow: var(--tmrg-ring-shadow); transform: scale(1);    opacity: 1; }
  75%  { box-shadow: var(--tmrg-ring-wide);   transform: scale(1.04); opacity: 1; }
  90%  { box-shadow: var(--tmrg-ring-shadow); transform: scale(1);    opacity: 1; }
  100% { box-shadow: var(--tmrg-ring-shadow); transform: scale(1);    opacity: 0; }
}
.tmrg-highlight-ring.tmrg-pulse {
  animation: tmrg-ring-pulse 2.1s ease-in-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .tmrg-highlight-ring { transition: opacity 0.15s ease !important; }
  .tmrg-highlight-ring.tmrg-pulse { animation: none !important; opacity: 1; }
}
`;
  const PAD = 8;
  class SpotlightManager {
    constructor() {
      this.overlay = null;
      this.ring = null;
      this.svg = null;
      this.mask = null;
      this.resizeObs = null;
      this.scrollHandler = null;
      this.currentTarget = null;
      this.fadeTimer = null;
    }
    init(root) {
      injectCSS("tmrg-spotlight-css", SPOTLIGHT_CSS);
      const overlay = document.createElement("div");
      overlay.className = "tmrg-spotlight";
      overlay.style.opacity = "0";
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("xmlns", svgNS);
      svg.setAttribute("class", "tmrg-spotlight-svg");
      const defs = document.createElementNS(svgNS, "defs");
      const maskEl = document.createElementNS(svgNS, "mask");
      maskEl.setAttribute("id", "tmrg-mask");
      const white = document.createElementNS(svgNS, "rect");
      white.setAttribute("x", "0");
      white.setAttribute("y", "0");
      white.setAttribute("width", "100%");
      white.setAttribute("height", "100%");
      white.setAttribute("fill", "white");
      maskEl.appendChild(white);
      const hole = document.createElementNS(svgNS, "rect");
      hole.setAttribute("fill", "black");
      hole.setAttribute("rx", "10");
      this.mask = hole;
      maskEl.appendChild(hole);
      defs.appendChild(maskEl);
      svg.appendChild(defs);
      const dark = document.createElementNS(svgNS, "rect");
      dark.setAttribute("x", "0");
      dark.setAttribute("y", "0");
      dark.setAttribute("width", "100%");
      dark.setAttribute("height", "100%");
      dark.setAttribute("fill", "rgba(0,0,0,0.45)");
      dark.setAttribute("mask", "url(#tmrg-mask)");
      svg.appendChild(dark);
      overlay.appendChild(svg);
      root.appendChild(overlay);
      this.overlay = overlay;
      this.svg = svg;
      const ring = document.createElement("div");
      ring.className = "tmrg-highlight-ring";
      root.appendChild(ring);
      this.ring = ring;
    }
    show(targetSelector, opts = {}) {
      this.clearFadeTimer();
      this.currentTarget = targetSelector;
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
      const mode = opts.mode ?? "persistent";
      const color = opts.color ?? "#ff6700";
      const width = opts.ringWidth ?? 3;
      const fadeDuration = opts.fadeDuration ?? 4e3;
      const glowHex = Math.round(0.25 * 255).toString(16).padStart(2, "0");
      const shadow = `0 0 0 ${width}px ${color}, 0 0 0 ${width * 2}px ${color}${glowHex}`;
      const shadowWide = `0 0 0 ${width + 2}px ${color}, 0 0 0 ${(width + 2) * 2}px ${color}${glowHex}`;
      this.ring.style.setProperty("--tmrg-ring-shadow", shadow);
      this.ring.style.setProperty("--tmrg-ring-wide", shadowWide);
      this.ring.style.boxShadow = shadow;
      this.ring.classList.remove("tmrg-pulse");
      void this.ring.offsetWidth;
      this.updatePosition();
      switch (mode) {
        case "ring-only":
          this.overlay.style.opacity = "0";
          this.ring.classList.add("visible");
          break;
        case "timed":
          this.overlay.style.opacity = "1";
          this.ring.classList.add("visible");
          this.fadeTimer = setTimeout(() => this.fadeOut(), fadeDuration);
          break;
        case "pulse":
          this.overlay.style.opacity = "1";
          this.ring.classList.add("visible", "tmrg-pulse");
          this.fadeTimer = setTimeout(() => {
            if (this.overlay) this.overlay.style.opacity = "0";
          }, 2100);
          this.ring.addEventListener("animationend", () => this.stopTracking(), { once: true });
          break;
        case "persistent":
        default:
          this.overlay.style.opacity = "1";
          this.ring.classList.add("visible");
          break;
      }
      if (mode !== "pulse") this.startTracking();
      else this.startTracking();
    }
    hide() {
      this.clearFadeTimer();
      this.currentTarget = null;
      this.overlay.style.opacity = "0";
      this.ring.classList.remove("visible", "tmrg-pulse");
      this.stopTracking();
      this.setHoleRect(-999, -999, 0, 0);
    }
    destroy() {
      var _a, _b;
      this.clearFadeTimer();
      this.stopTracking();
      (_a = this.overlay) == null ? void 0 : _a.remove();
      (_b = this.ring) == null ? void 0 : _b.remove();
      this.overlay = null;
      this.ring = null;
    }
    // ─── private ───────────────────────────────────────────────────
    fadeOut() {
      if (this.overlay) this.overlay.style.opacity = "0";
      if (this.ring) this.ring.classList.remove("visible", "tmrg-pulse");
      this.stopTracking();
    }
    clearFadeTimer() {
      if (this.fadeTimer) {
        clearTimeout(this.fadeTimer);
        this.fadeTimer = null;
      }
    }
    updatePosition() {
      if (!this.currentTarget) return;
      const el = document.querySelector(this.currentTarget);
      if (!el) return;
      const r = el.getBoundingClientRect();
      this.setHoleRect(r.left - PAD, r.top - PAD, r.width + PAD * 2, r.height + PAD * 2);
      this.ring.style.left = `${r.left - PAD}px`;
      this.ring.style.top = `${r.top - PAD}px`;
      this.ring.style.width = `${r.width + PAD * 2}px`;
      this.ring.style.height = `${r.height + PAD * 2}px`;
    }
    setHoleRect(x, y, w, h) {
      if (!this.mask) return;
      this.mask.setAttribute("x", String(x));
      this.mask.setAttribute("y", String(y));
      this.mask.setAttribute("width", String(Math.max(0, w)));
      this.mask.setAttribute("height", String(Math.max(0, h)));
    }
    startTracking() {
      this.stopTracking();
      this.resizeObs = new ResizeObserver(() => this.updatePosition());
      const target = this.currentTarget ? document.querySelector(this.currentTarget) : null;
      if (target) this.resizeObs.observe(target);
      this.scrollHandler = () => this.updatePosition();
      window.addEventListener("scroll", this.scrollHandler, { passive: true, capture: true });
      window.addEventListener("resize", this.scrollHandler, { passive: true });
    }
    stopTracking() {
      var _a;
      (_a = this.resizeObs) == null ? void 0 : _a.disconnect();
      this.resizeObs = null;
      if (this.scrollHandler) {
        window.removeEventListener("scroll", this.scrollHandler, { capture: true });
        window.removeEventListener("resize", this.scrollHandler);
        this.scrollHandler = null;
      }
    }
  }
  const BUBBLE_CSS = `
.tmrg-bubble {
  position: fixed;
  z-index: 2147483641;
  width: 260px;
  max-height: min(380px, calc(100vh - 120px));
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
  padding: 14px 16px 12px;
  pointer-events: auto;
  transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              top  0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.2s ease,
              transform 0.2s ease;
  transform-origin: bottom left;
  opacity: 0;
  transform: scale(0.85) translateY(8px);
  /* Force light mode — prevents Arc/Chrome dark-mode inversion */
  color-scheme: light;
}
.tmrg-bubble.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Tail */
.tmrg-bubble::before {
  content: '';
  position: absolute;
  bottom: 18px;
  width: 0; height: 0;
  border-style: solid;
}
.tmrg-bubble[data-side="right"]::before {
  left: -9px;
  border-width: 7px 9px 7px 0;
  border-color: transparent #e5e7eb transparent transparent;
}
.tmrg-bubble[data-side="right"]::after {
  content: '';
  position: absolute;
  bottom: 19.5px;
  left: -7px;
  width: 0; height: 0;
  border-style: solid;
  border-width: 5.5px 7px 5.5px 0;
  border-color: transparent #ffffff transparent transparent;
}
.tmrg-bubble[data-side="left"]::before {
  right: -9px;
  border-width: 7px 0 7px 9px;
  border-color: transparent transparent transparent #e5e7eb;
}
.tmrg-bubble[data-side="left"]::after {
  content: '';
  position: absolute;
  bottom: 19.5px;
  right: -7px;
  width: 0; height: 0;
  border-style: solid;
  border-width: 5.5px 0 5.5px 7px;
  border-color: transparent transparent transparent #ffffff;
}

/* Dismiss button */
.tmrg-bubble-dismiss {
  position: absolute;
  top: 8px; right: 10px;
  background: none; border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 16px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  pointer-events: auto;
  flex-shrink: 0;
}
.tmrg-bubble-dismiss:hover { color: #374151; background: #f3f4f6; }

/* Scrollable text area */
.tmrg-bubble-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.tmrg-bubble-scroll::-webkit-scrollbar { width: 4px; }
.tmrg-bubble-scroll::-webkit-scrollbar-track { background: transparent; }
.tmrg-bubble-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

/* Text */
.tmrg-bubble-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: #1f2937;
  margin: 0;
  padding-right: 12px;
  min-height: 20px;
}
.tmrg-bubble-text b  { font-weight: 600; color: #111827; }
.tmrg-bubble-text em { font-style: italic; }
.tmrg-bubble-text a  { color: #ff6700; text-decoration: underline; }

/* Inline code */
.tmrg-bubble-text .tmrg-code {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
  padding: 1px 4px;
  border-radius: 4px;
}

/* Unordered list inside bubble text */
.tmrg-bubble-text ul {
  margin: 4px 0;
  padding-left: 16px;
  list-style: disc;
}
.tmrg-bubble-text li {
  margin: 2px 0;
  line-height: 1.5;
}

/* Typing dots */
.tmrg-typing {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 22px;
}
.tmrg-typing span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  animation: tmrg-dot 1.1s ease-in-out infinite;
}
.tmrg-typing span:nth-child(2) { animation-delay: 0.18s; }
.tmrg-typing span:nth-child(3) { animation-delay: 0.36s; }
@keyframes tmrg-dot {
  0%, 80%, 100% { transform: translateY(0); background: #d1d5db; }
  40%            { transform: translateY(-5px); background: #ff6700; }
}
@media (prefers-reduced-motion: reduce) {
  .tmrg-typing span { animation: none; }
  .tmrg-bubble { transition: opacity 0.15s ease !important; }
}

/* Source citations */
.tmrg-sources {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.tmrg-sources-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
}
.tmrg-source-link {
  display: block;
  font-size: 11.5px;
  color: #ff6700;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}
.tmrg-source-link:hover { text-decoration: underline; }

/* Feedback row */
.tmrg-feedback {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  flex-shrink: 0;
}
.tmrg-feedback-label {
  font-size: 10.5px;
  color: #9ca3af;
  margin-right: 2px;
}
.tmrg-feedback-btn {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 13px;
  cursor: pointer;
  line-height: 1.4;
  transition: background 0.12s, border-color 0.12s;
}
.tmrg-feedback-btn:hover { background: #f9fafb; border-color: #d1d5db; }
.tmrg-feedback-done {
  font-size: 11px;
  color: #6b7280;
}

/* Q&A input area */
.tmrg-bubble-input-row {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}
.tmrg-bubble-input {
  flex: 1;
  resize: none;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 12.5px;
  line-height: 1.4;
  font-family: inherit;
  color: #1f2937;
  background: #f9fafb;
  outline: none;
  max-height: 80px;
  overflow-y: auto;
}
.tmrg-bubble-input:focus { border-color: #ff6700; background: #fff; }
.tmrg-bubble-send {
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 8px;
  border: none;
  background: #ff6700;
  color: white;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  padding: 0;
}
.tmrg-bubble-send:disabled { background: #d1d5db; cursor: not-allowed; }
.tmrg-bubble-send:hover:not(:disabled) { background: #e85d00; }

/* Follow-up chips */
.tmrg-followups {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
  flex-shrink: 0;
}
.tmrg-chip {
  font-size: 11.5px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 20px;
  padding: 3px 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.tmrg-chip:hover { background: #ffedd5; }

/* Tour navigation — "Next →" button shown during guided tours */
.tmrg-tour-nav {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  flex-shrink: 0;
}
.tmrg-tour-next {
  background: #ff6700;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.15s;
  font-family: inherit;
}
.tmrg-tour-next:hover { opacity: 0.85; }
`;
  const CHAR_SIZE$1 = 72;
  const MARGIN = 16;
  function computeCharacterPosition(rect, side = "right", charSize = CHAR_SIZE$1) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!rect) {
      return { x: vw - charSize - MARGIN, y: vh - charSize - MARGIN };
    }
    let x;
    let y;
    switch (side) {
      case "right":
        x = rect.right + MARGIN;
        y = rect.top + rect.height / 2 - charSize / 2;
        break;
      case "left":
        x = rect.left - charSize - MARGIN;
        y = rect.top + rect.height / 2 - charSize / 2;
        break;
      case "top":
        x = rect.left + rect.width / 2 - charSize / 2;
        y = rect.top - charSize - MARGIN;
        break;
      case "bottom":
        x = rect.left + rect.width / 2 - charSize / 2;
        y = rect.bottom + MARGIN;
        break;
    }
    x = Math.max(MARGIN, Math.min(vw - charSize - MARGIN, x));
    y = Math.max(MARGIN, Math.min(vh - charSize - MARGIN, y));
    return { x, y };
  }
  function computeBubbleSide(charX, charSize, bubbleWidth) {
    const vw = window.innerWidth;
    if (charX + charSize + bubbleWidth + MARGIN > vw) return "left";
    return "right";
  }
  const BUBBLE_WIDTH = 260;
  const TYPEWRITER_INTERVAL = 18;
  const CHAR_SIZE = 72;
  class BubbleManager {
    constructor() {
      this.bubble = null;
      this.scrollEl = null;
      this.textEl = null;
      this.followupsEl = null;
      this.feedbackEl = null;
      this.sourcesEl = null;
      this.inputRow = null;
      this.inputEl = null;
      this.typingEl = null;
      this.typeTimer = null;
      this.onAsk = null;
      this.onDismiss = null;
      this.onFeedback = null;
      this.onNext = null;
      this.navEl = null;
      this.repositionFn = null;
      this.lastQuestion = "";
    }
    init(root, onAsk, onDismiss, onFeedback) {
      injectCSS("tmrg-bubble-css", BUBBLE_CSS);
      this.onAsk = onAsk;
      this.onDismiss = onDismiss;
      this.onFeedback = onFeedback ?? null;
      const bubble = document.createElement("div");
      bubble.className = "tmrg-bubble";
      bubble.setAttribute("data-side", "right");
      const dismiss = document.createElement("button");
      dismiss.className = "tmrg-bubble-dismiss";
      dismiss.innerHTML = "×";
      dismiss.title = "Dismiss";
      dismiss.addEventListener("click", () => onDismiss());
      bubble.appendChild(dismiss);
      const scrollEl = document.createElement("div");
      scrollEl.className = "tmrg-bubble-scroll";
      bubble.appendChild(scrollEl);
      this.scrollEl = scrollEl;
      const textEl = document.createElement("p");
      textEl.className = "tmrg-bubble-text";
      scrollEl.appendChild(textEl);
      this.textEl = textEl;
      const typingEl = document.createElement("div");
      typingEl.className = "tmrg-typing";
      typingEl.innerHTML = "<span></span><span></span><span></span>";
      typingEl.style.display = "none";
      scrollEl.appendChild(typingEl);
      this.typingEl = typingEl;
      const sourcesEl = document.createElement("div");
      sourcesEl.className = "tmrg-sources";
      sourcesEl.style.display = "none";
      bubble.appendChild(sourcesEl);
      this.sourcesEl = sourcesEl;
      const feedbackEl = document.createElement("div");
      feedbackEl.className = "tmrg-feedback";
      feedbackEl.style.display = "none";
      bubble.appendChild(feedbackEl);
      this.feedbackEl = feedbackEl;
      const followupsEl = document.createElement("div");
      followupsEl.className = "tmrg-followups";
      bubble.appendChild(followupsEl);
      this.followupsEl = followupsEl;
      const navEl = document.createElement("div");
      navEl.className = "tmrg-tour-nav";
      navEl.style.display = "none";
      const navBtn = document.createElement("button");
      navBtn.className = "tmrg-tour-next";
      navBtn.innerHTML = `Next <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
      navBtn.addEventListener("click", () => {
        var _a;
        return (_a = this.onNext) == null ? void 0 : _a.call(this);
      });
      navEl.appendChild(navBtn);
      bubble.appendChild(navEl);
      this.navEl = navEl;
      const inputRow = document.createElement("div");
      inputRow.className = "tmrg-bubble-input-row";
      inputRow.style.display = "none";
      const input = document.createElement("textarea");
      input.className = "tmrg-bubble-input";
      input.rows = 1;
      input.placeholder = "Ask me anything…";
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.submitInput();
        }
      });
      input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 80)}px`;
        sendBtn.disabled = input.value.trim().length === 0;
      });
      this.inputEl = input;
      const sendBtn = document.createElement("button");
      sendBtn.className = "tmrg-bubble-send";
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
      sendBtn.addEventListener("click", () => this.submitInput());
      inputRow.appendChild(input);
      inputRow.appendChild(sendBtn);
      bubble.appendChild(inputRow);
      this.inputRow = inputRow;
      root.appendChild(bubble);
      this.bubble = bubble;
    }
    setRepositionFn(fn) {
      this.repositionFn = fn;
    }
    /**
     * Set (or clear) the tour "Next →" button callback.
     * Pass a function to show the button; pass null to hide it.
     */
    setOnNext(fn) {
      this.onNext = fn;
      if (this.navEl) this.navEl.style.display = fn ? "flex" : "none";
    }
    /**
     * Position the bubble so its tail aligns near the character's mouth.
     */
    positionNear(charX, charY, mouthOffsetY = CHAR_SIZE * 0.42) {
      if (!this.bubble) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const side = computeBubbleSide(charX, CHAR_SIZE, BUBBLE_WIDTH);
      this.bubble.setAttribute("data-side", side);
      const bh = this.bubble.offsetHeight;
      const mouthY = charY + mouthOffsetY;
      let left;
      if (side === "right") {
        left = charX + CHAR_SIZE + 12;
      } else {
        left = charX - BUBBLE_WIDTH - 12;
      }
      left = Math.max(8, Math.min(vw - BUBBLE_WIDTH - 8, left));
      const TAIL_BOTTOM_OFFSET = 18 + 7;
      let top = mouthY - (bh - TAIL_BOTTOM_OFFSET);
      top = Math.max(12, Math.min(vh - bh - 12, top));
      this.bubble.style.left = `${left}px`;
      this.bubble.style.top = `${top}px`;
    }
    show(message, showInput = false, followUps = []) {
      if (!this.bubble) return;
      this.clearTypewriter();
      this.typingEl.style.display = "none";
      this.followupsEl.innerHTML = "";
      this.clearFeedback();
      this.clearSources();
      this.inputRow.style.display = showInput ? "flex" : "none";
      this.typeText(message, () => {
        var _a;
        this.renderFollowUps(followUps);
        (_a = this.repositionFn) == null ? void 0 : _a.call(this);
        if (this.scrollEl) this.scrollEl.scrollTop = 0;
      });
      this.bubble.classList.add("visible");
    }
    showLoading() {
      if (!this.bubble) return;
      this.clearTypewriter();
      this.textEl.innerHTML = "";
      this.followupsEl.innerHTML = "";
      this.clearFeedback();
      this.clearSources();
      this.typingEl.style.display = "flex";
      this.bubble.classList.add("visible");
    }
    showResponse(message, followUps = [], sources = []) {
      if (!this.bubble) return;
      this.typingEl.style.display = "none";
      this.clearFeedback();
      this.clearSources();
      this.typeText(message, () => {
        var _a;
        this.renderFollowUps(followUps);
        this.renderSources(sources);
        this.renderFeedback();
        (_a = this.repositionFn) == null ? void 0 : _a.call(this);
        if (this.scrollEl) this.scrollEl.scrollTop = 0;
      });
    }
    hide() {
      var _a;
      this.clearTypewriter();
      (_a = this.bubble) == null ? void 0 : _a.classList.remove("visible");
    }
    destroy() {
      var _a;
      this.clearTypewriter();
      (_a = this.bubble) == null ? void 0 : _a.remove();
      this.bubble = null;
      this.scrollEl = null;
      this.textEl = null;
      this.typingEl = null;
      this.followupsEl = null;
      this.feedbackEl = null;
      this.sourcesEl = null;
      this.navEl = null;
      this.inputRow = null;
      this.inputEl = null;
      this.repositionFn = null;
      this.onNext = null;
    }
    // ─── private ───────────────────────────────────────────────────
    typeText(text, onDone) {
      if (!this.textEl) return;
      const html = this.markdownToHtml(text);
      if (prefersReducedMotion()) {
        this.textEl.innerHTML = html;
        onDone == null ? void 0 : onDone();
        return;
      }
      const plain = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^[-*]\s+/gm, "• ");
      let i = 0;
      this.textEl.textContent = "";
      const tick = () => {
        if (i < plain.length) {
          this.textEl.textContent += plain[i++];
          this.typeTimer = setTimeout(tick, TYPEWRITER_INTERVAL);
        } else {
          this.textEl.innerHTML = html;
          onDone == null ? void 0 : onDone();
        }
      };
      tick();
    }
    clearTypewriter() {
      if (this.typeTimer) {
        clearTimeout(this.typeTimer);
        this.typeTimer = null;
      }
    }
    /**
     * Lightweight Markdown → HTML converter.
     * Supports: **bold**, *italic*, `code`, [links](url), - lists, line breaks.
     */
    markdownToHtml(text) {
      const lines = text.split("\n");
      const out = [];
      let inList = false;
      for (const line of lines) {
        const listMatch = line.match(/^[-*]\s+(.+)/);
        if (listMatch) {
          if (!inList) {
            out.push("<ul>");
            inList = true;
          }
          out.push(`<li>${this.inlineMarkdown(listMatch[1])}</li>`);
        } else {
          if (inList) {
            out.push("</ul>");
            inList = false;
          }
          out.push(this.inlineMarkdown(line));
        }
      }
      if (inList) out.push("</ul>");
      return out.join("\n").replace(/<\/ul>\n/g, "</ul>").replace(/\n<ul>/g, "<ul>").replace(/\n/g, "<br>");
    }
    inlineMarkdown(text) {
      return text.replace(/`([^`]+)`/g, '<code class="tmrg-code">$1</code>').replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );
    }
    renderFollowUps(followUps) {
      if (!this.followupsEl || followUps.length === 0) return;
      for (const fu of followUps) {
        const chip = document.createElement("button");
        chip.className = "tmrg-chip";
        chip.textContent = fu;
        chip.addEventListener("click", () => {
          var _a;
          if (this.inputEl) {
            this.inputEl.value = fu;
            this.inputRow.style.display = "flex";
          }
          (_a = this.onAsk) == null ? void 0 : _a.call(this, fu);
          this.followupsEl.innerHTML = "";
        });
        this.followupsEl.appendChild(chip);
      }
    }
    renderSources(sources) {
      if (!this.sourcesEl || sources.length === 0) return;
      this.sourcesEl.style.display = "block";
      this.sourcesEl.innerHTML = "";
      const label = document.createElement("p");
      label.className = "tmrg-sources-label";
      label.textContent = "Sources";
      this.sourcesEl.appendChild(label);
      for (const src of sources) {
        const link = document.createElement("a");
        link.className = "tmrg-source-link";
        link.href = src.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = src.title;
        this.sourcesEl.appendChild(link);
      }
    }
    clearSources() {
      if (!this.sourcesEl) return;
      this.sourcesEl.style.display = "none";
      this.sourcesEl.innerHTML = "";
    }
    renderFeedback() {
      if (!this.feedbackEl) return;
      this.feedbackEl.style.display = "flex";
      this.feedbackEl.innerHTML = "";
      const label = document.createElement("span");
      label.className = "tmrg-feedback-label";
      label.textContent = "Helpful?";
      this.feedbackEl.appendChild(label);
      const thumbUp = document.createElement("button");
      thumbUp.className = "tmrg-feedback-btn";
      thumbUp.title = "Yes, helpful";
      thumbUp.textContent = "👍";
      thumbUp.addEventListener("click", () => {
        var _a;
        (_a = this.onFeedback) == null ? void 0 : _a.call(this, "up", this.lastQuestion);
        if (this.feedbackEl) {
          this.feedbackEl.innerHTML = '<span class="tmrg-feedback-done">Thanks! 👍</span>';
        }
      });
      const thumbDown = document.createElement("button");
      thumbDown.className = "tmrg-feedback-btn";
      thumbDown.title = "Not helpful";
      thumbDown.textContent = "👎";
      thumbDown.addEventListener("click", () => {
        var _a;
        (_a = this.onFeedback) == null ? void 0 : _a.call(this, "down", this.lastQuestion);
        if (this.feedbackEl) {
          this.feedbackEl.innerHTML = `<span class="tmrg-feedback-done">Got it — I'll do better.</span>`;
        }
      });
      this.feedbackEl.appendChild(thumbUp);
      this.feedbackEl.appendChild(thumbDown);
    }
    clearFeedback() {
      if (!this.feedbackEl) return;
      this.feedbackEl.style.display = "none";
      this.feedbackEl.innerHTML = "";
    }
    submitInput() {
      var _a, _b;
      const text = (_a = this.inputEl) == null ? void 0 : _a.value.trim();
      if (!text) return;
      this.lastQuestion = text;
      (_b = this.onAsk) == null ? void 0 : _b.call(this, text);
      this.inputEl.value = "";
      this.inputEl.style.height = "auto";
      this.bubble.querySelector(".tmrg-bubble-send").disabled = true;
    }
  }
  const FALLBACK_MSG = "I'm having trouble connecting right now. You can reach our support team via the chat bubble in the corner.";
  const TIMEOUT_MS = 2e4;
  class AIManager {
    constructor(apiEndpoint, userId, emailId) {
      this.apiEndpoint = apiEndpoint;
      this.userId = userId;
      this.emailId = emailId;
      this.history = [];
      this.sessionId = crypto.randomUUID();
    }
    /**
     * Ask TMR AI Assistant a question.
     * Automatically times out after 20 seconds and returns a friendly fallback.
     */
    async ask(message, context) {
      const history = this.history.slice(-12);
      const body = {
        sessionId: this.sessionId,
        userId: this.userId ?? null,
        emailId: this.emailId ?? null,
        message,
        history,
        subscriptionContext: typeof context.subscriptionContext === "string" ? context.subscriptionContext : void 0
      };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(this.apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const replyText = data.response ?? data.message ?? "";
        const followUps = Array.isArray(data.followUps) ? data.followUps : [];
        const sources = Array.isArray(
          data.sources
        ) ? data.sources : [];
        this.history.push({ role: "user", content: message });
        this.history.push({ role: "assistant", content: replyText });
        return { message: replyText, followUps, sources };
      } catch (err) {
        clearTimeout(timeoutId);
        const isTimeout = err instanceof DOMException && err.name === "AbortError";
        return {
          message: isTimeout ? "That took too long — please try again in a moment." : FALLBACK_MSG
        };
      }
    }
    resetSession() {
      this.sessionId = crypto.randomUUID();
      this.history = [];
    }
  }
  class TourManager {
    constructor() {
      this.steps = [];
      this.index = 0;
      this.advanceFn = null;
      this.waitListeners = [];
    }
    load(steps, advanceFn) {
      this.steps = steps;
      this.index = 0;
      this.advanceFn = advanceFn;
    }
    start() {
      this.goTo(0);
    }
    next() {
      this.removeWaitListeners();
      if (this.index < this.steps.length - 1) {
        this.goTo(this.index + 1);
      }
    }
    prev() {
      this.removeWaitListeners();
      if (this.index > 0) {
        this.goTo(this.index - 1);
      }
    }
    isActive() {
      return this.steps.length > 0;
    }
    current() {
      return this.steps[this.index] ?? null;
    }
    destroy() {
      this.removeWaitListeners();
      this.steps = [];
      this.index = 0;
      this.advanceFn = null;
    }
    // ─── private ───────────────────────────────────────────────────
    goTo(i) {
      this.index = i;
      const step = this.steps[i];
      if (!step || !this.advanceFn) return;
      this.advanceFn(step);
      if (step.waitFor) {
        const el = document.querySelector(step.waitFor);
        if (el) {
          const fn = () => {
            setTimeout(() => this.next(), 350);
          };
          el.addEventListener("click", fn, { once: true });
          el.addEventListener("change", fn, { once: true });
          this.waitListeners.push({ el, fn });
        }
      }
    }
    removeWaitListeners() {
      for (const { el, fn } of this.waitListeners) {
        el.removeEventListener("click", fn);
        el.removeEventListener("change", fn);
      }
      this.waitListeners = [];
    }
  }
  class TMRGuideSDK {
    constructor() {
      this.config = null;
      this.root = null;
      this.charContainer = null;
      this.character = null;
      this.spotlight = null;
      this.bubble = null;
      this.ai = null;
      this.tourMgr = null;
      this.currentOptions = null;
      this.charX = 0;
      this.charY = 0;
      this.charSize = 72;
      this.isVisible = false;
      this.enabled = true;
      this.toggleBtn = null;
      this.contextMenu = null;
      this.resizeHandler = null;
      this.resizeDebounce = null;
      this.clickOutsideHandler = null;
      this.STORAGE_KEY = "tmr-guide-enabled";
    }
    // ─── Public API ─────────────────────────────────────────────────
    init(config) {
      var _a, _b;
      if (this.root) this.destroy();
      this.config = config;
      this.charSize = ((_a = config.theme) == null ? void 0 : _a.characterSize) ?? 72;
      const primaryColor = ((_b = config.theme) == null ? void 0 : _b.primaryColor) ?? "#ff6700";
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.enabled = stored !== "false";
      injectCSS("tmrg-char-css", CHARACTER_CSS);
      const root = createElement("div", { id: "tmr-guide-root" });
      document.body.appendChild(root);
      this.root = root;
      const charContainer = createElement("div", { class: "tmrg-char" }, {});
      charContainer.dataset.state = "idle";
      charContainer.style.width = `${this.charSize}px`;
      charContainer.style.height = `${this.charSize}px`;
      root.appendChild(charContainer);
      this.charContainer = charContainer;
      const char = new BotCharacter(this.charSize, primaryColor);
      char.mount(charContainer);
      this.character = char;
      const { x: cx, y: cy } = this.cornerPosition();
      this.charX = cx;
      this.charY = cy;
      this.applyCharPosition();
      this.spotlight = new SpotlightManager();
      this.spotlight.init(root);
      this.bubble = new BubbleManager();
      this.bubble.init(
        root,
        (text) => this.ask(text),
        () => this.hide(),
        (rating, question) => {
          var _a2, _b2;
          return (_b2 = (_a2 = this.config) == null ? void 0 : _a2.onFeedback) == null ? void 0 : _b2.call(_a2, rating, question);
        }
      );
      this.bubble.setRepositionFn(() => this.bubble.positionNear(this.charX, this.charY));
      this.ai = new AIManager(config.apiEndpoint, config.userId, config.emailId);
      this.tourMgr = new TourManager();
      this.renderToggleBtn();
      charContainer.addEventListener("click", () => {
        if (!this.enabled) return;
        if (this.isVisible) {
          this.hide();
        } else if (this.currentOptions) {
          this.show(this.currentOptions);
        }
      });
      this.resizeHandler = () => {
        if (this.resizeDebounce) clearTimeout(this.resizeDebounce);
        this.resizeDebounce = setTimeout(() => this.handleResize(), 100);
      };
      window.addEventListener("resize", this.resizeHandler, { passive: true });
    }
    show(options) {
      var _a, _b, _c, _d, _e;
      this.assertInit();
      this.currentOptions = options;
      (_b = (_a = this.config).onStepChange) == null ? void 0 : _b.call(_a, options.stepId);
      if (!((_c = this.tourMgr) == null ? void 0 : _c.isActive())) (_d = this.bubble) == null ? void 0 : _d.setOnNext(null);
      if (!this.enabled) return;
      this.isVisible = true;
      const primaryColor = ((_e = this.config.theme) == null ? void 0 : _e.primaryColor) ?? "#ff6700";
      if (options.target && !document.querySelector(options.target)) {
        console.warn(`[tmr-guide] target "${options.target}" not found for step "${options.stepId}"`);
      }
      const rect = options.target ? getRect(options.target) : null;
      const targetPos = rect ? computeCharacterPosition(rect, options.position ?? "right", this.charSize) : this.cornerPosition();
      const isAlreadyNear = Math.abs(this.charX - targetPos.x) < 4 && Math.abs(this.charY - targetPos.y) < 4;
      if (!isAlreadyNear) {
        this.character.setState("walking");
      }
      this.charX = targetPos.x;
      this.charY = targetPos.y;
      this.applyCharPosition();
      const delay = isAlreadyNear ? 0 : 500;
      setTimeout(() => {
        this.character.setState("talking");
        if (options.target) {
          const hl = this.config.highlight ?? {};
          this.spotlight.show(options.target, {
            mode: hl.mode ?? "persistent",
            color: hl.color ?? primaryColor,
            ringWidth: hl.ringWidth ?? 3,
            fadeDuration: hl.fadeDuration ?? 4e3
          });
        }
        this.bubble.show(options.message, options.showInput ?? false);
        requestAnimationFrame(() => {
          this.bubble.positionNear(this.charX, this.charY);
          setTimeout(() => this.character.setState("idle"), 1800);
        });
        this.attachClickOutside();
      }, delay);
    }
    hide() {
      var _a, _b;
      this.assertInit();
      this.isVisible = false;
      this.spotlight.hide();
      this.bubble.hide();
      this.bubble.setOnNext(null);
      this.character.setState("idle");
      this.detachClickOutside();
      (_b = (_a = this.config) == null ? void 0 : _a.onDismiss) == null ? void 0 : _b.call(_a);
    }
    /** Run a multi-step guided tour */
    tour(steps) {
      this.assertInit();
      this.tourMgr.load(steps, (step) => {
        this.show(step);
        const isLast = this.tourMgr.current() === steps[steps.length - 1];
        this.bubble.setOnNext(isLast ? null : () => this.tourMgr.next());
      });
      this.tourMgr.start();
    }
    next() {
      this.assertInit();
      this.tourMgr.next();
    }
    prev() {
      this.assertInit();
      this.tourMgr.prev();
    }
    /** Send a user question to AI and show the response in the bubble */
    async ask(text) {
      var _a, _b, _c, _d;
      this.assertInit();
      (_b = (_a = this.config) == null ? void 0 : _a.onAskQuestion) == null ? void 0 : _b.call(_a, text);
      const context = {
        ...((_c = this.currentOptions) == null ? void 0 : _c.context) ?? {},
        stepId: ((_d = this.currentOptions) == null ? void 0 : _d.stepId) ?? "unknown"
      };
      this.character.setState("thinking");
      this.bubble.showLoading();
      const response = await this.ai.ask(text, context);
      this.character.setState("talking");
      this.bubble.showResponse(response.message, response.followUps ?? [], response.sources ?? []);
      setTimeout(() => this.character.setState("idle"), 1800);
    }
    /** Celebrate a milestone (character jumps, optional message in bubble) */
    celebrate(message) {
      this.assertInit();
      this.character.setState("celebrating");
      if (message) {
        this.bubble.show(message);
        requestAnimationFrame(() => this.bubble.positionNear(this.charX, this.charY));
        this.isVisible = true;
      }
      setTimeout(() => this.character.setState("idle"), 1800);
    }
    /** Enable the guide — resumes guidance from the current step */
    enable() {
      this.assertInit();
      if (this.enabled) return;
      this.enabled = true;
      localStorage.setItem(this.STORAGE_KEY, "true");
      this.updateToggleBtn();
      if (this.currentOptions) {
        this.show(this.currentOptions);
      }
    }
    /** Disable the guide — character idles in the corner; progress is still tracked */
    disable() {
      this.assertInit();
      if (!this.enabled) return;
      this.enabled = false;
      localStorage.setItem(this.STORAGE_KEY, "false");
      this.updateToggleBtn();
      this.isVisible = false;
      this.spotlight.hide();
      this.bubble.hide();
      this.character.setState("idle");
      this.detachClickOutside();
      this.moveToCorner();
    }
    /** Replace the default bot character with a custom renderer */
    setCharacter(renderer) {
      this.assertInit();
      if (this.character) this.character.destroy();
      renderer.mount(this.charContainer);
      this.character = renderer;
    }
    destroy() {
      var _a, _b, _c, _d, _e;
      if (this.resizeDebounce) {
        clearTimeout(this.resizeDebounce);
        this.resizeDebounce = null;
      }
      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler);
        this.resizeHandler = null;
      }
      this.detachClickOutside();
      (_a = this.spotlight) == null ? void 0 : _a.destroy();
      (_b = this.bubble) == null ? void 0 : _b.destroy();
      (_c = this.tourMgr) == null ? void 0 : _c.destroy();
      (_d = this.root) == null ? void 0 : _d.remove();
      this.root = null;
      this.charContainer = null;
      this.character = null;
      this.spotlight = null;
      this.bubble = null;
      this.ai = null;
      this.tourMgr = null;
      this.toggleBtn = null;
      (_e = this.contextMenu) == null ? void 0 : _e.remove();
      this.contextMenu = null;
      this.currentOptions = null;
      this.config = null;
      this.isVisible = false;
    }
    // ─── Private ────────────────────────────────────────────────────
    handleResize() {
      var _a;
      const opts = this.currentOptions;
      const rect = (opts == null ? void 0 : opts.target) ? getRect(opts.target) : null;
      const newPos = rect ? computeCharacterPosition(rect, (opts == null ? void 0 : opts.position) ?? "right", this.charSize) : this.cornerPosition();
      this.charX = newPos.x;
      this.charY = newPos.y;
      this.applyCharPosition();
      if (this.isVisible) {
        (_a = this.bubble) == null ? void 0 : _a.positionNear(this.charX, this.charY);
      }
      this.positionCornerChip();
    }
    applyCharPosition() {
      if (!this.charContainer) return;
      this.charContainer.style.left = `${this.charX}px`;
      this.charContainer.style.top = `${this.charY}px`;
    }
    cornerPosition() {
      var _a, _b, _c;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pos = ((_a = this.config) == null ? void 0 : _a.idlePosition) ?? "bottom-right";
      const ox = ((_b = this.config) == null ? void 0 : _b.idlePositionOffsetX) ?? 24;
      const oy = ((_c = this.config) == null ? void 0 : _c.idlePositionOffsetY) ?? 50;
      const right = vw - this.charSize - ox;
      const bottom = vh - this.charSize - oy;
      switch (pos) {
        case "top-left":
          return { x: ox, y: oy };
        case "top-right":
          return { x: right, y: oy };
        case "bottom-left":
          return { x: ox, y: bottom };
        case "bottom-right":
          return { x: right, y: bottom };
      }
    }
    moveToCorner() {
      const { x, y } = this.cornerPosition();
      this.charX = x;
      this.charY = y;
      this.applyCharPosition();
    }
    renderToggleBtn() {
      var _a;
      const style = ((_a = this.config) == null ? void 0 : _a.toggleStyle) ?? "hover";
      if (style === "context-menu") {
        this.setupContextMenu();
        return;
      }
      if (style === "corner-chip") {
        const chip = document.createElement("button");
        chip.className = "tmrg-corner-chip";
        chip.addEventListener("click", () => {
          if (this.enabled) this.disable();
          else this.enable();
        });
        this.root.appendChild(chip);
        this.toggleBtn = chip;
        this.positionCornerChip();
      } else {
        const btn = document.createElement("button");
        btn.className = "tmrg-toggle-btn";
        btn.dataset.style = style;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.enabled) this.disable();
          else this.enable();
        });
        this.charContainer.appendChild(btn);
        this.toggleBtn = btn;
        if (style === "hover") {
          let hideTimer = null;
          const showBtn = () => {
            if (hideTimer) {
              clearTimeout(hideTimer);
              hideTimer = null;
            }
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
          };
          const hideBtn = () => {
            hideTimer = setTimeout(() => {
              btn.style.opacity = "0";
              btn.style.pointerEvents = "none";
            }, 200);
          };
          this.charContainer.addEventListener("mouseenter", showBtn);
          this.charContainer.addEventListener("mouseleave", hideBtn);
          btn.addEventListener("mouseenter", showBtn);
          btn.addEventListener("mouseleave", hideBtn);
        }
      }
      this.updateToggleBtn();
    }
    updateToggleBtn() {
      var _a;
      if (!this.toggleBtn) return;
      const style = ((_a = this.config) == null ? void 0 : _a.toggleStyle) ?? "hover";
      const disableIcon = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><rect x="0.5" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/><rect x="6" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/></svg>`;
      const enableIcon = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><polygon points="0.5,0.5 8.5,4.5 0.5,8.5" fill="currentColor"/></svg>`;
      const icon = this.enabled ? disableIcon : enableIcon;
      const label = this.enabled ? "Disable Guide" : "Enable Guide";
      this.toggleBtn.innerHTML = style === "badge" ? icon : `${icon} ${label}`;
      this.toggleBtn.dataset.enabled = this.enabled ? "true" : "false";
      this.toggleBtn.title = label;
    }
    positionCornerChip() {
      var _a;
      if (!this.toggleBtn) return;
      const pos = ((_a = this.config) == null ? void 0 : _a.idlePosition) ?? "bottom-right";
      const chip = this.toggleBtn;
      chip.style.top = chip.style.bottom = chip.style.left = chip.style.right = "auto";
      const m = "12px";
      switch (pos) {
        case "top-left":
          chip.style.top = m;
          chip.style.left = m;
          break;
        case "top-right":
          chip.style.top = m;
          chip.style.right = m;
          break;
        case "bottom-left":
          chip.style.bottom = m;
          chip.style.left = m;
          break;
        case "bottom-right":
          chip.style.bottom = m;
          chip.style.right = m;
          break;
      }
    }
    setupContextMenu() {
      if (!this.charContainer) return;
      this.charContainer.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showContextMenu(e.clientX, e.clientY);
      });
    }
    showContextMenu(x, y) {
      var _a;
      (_a = this.contextMenu) == null ? void 0 : _a.remove();
      const disableIcon = `<svg width="10" height="10" viewBox="0 0 9 9" fill="none"><rect x="0.5" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/><rect x="6" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/></svg>`;
      const enableIcon = `<svg width="10" height="10" viewBox="0 0 9 9" fill="none"><polygon points="0.5,0.5 8.5,4.5 0.5,8.5" fill="currentColor"/></svg>`;
      const icon = this.enabled ? disableIcon : enableIcon;
      const label = this.enabled ? "Disable Guide" : "Enable Guide";
      const menu = document.createElement("div");
      menu.className = "tmrg-ctx-menu";
      const item = document.createElement("div");
      item.className = "tmrg-ctx-item";
      item.innerHTML = `${icon} ${label}`;
      item.addEventListener("click", () => {
        if (this.enabled) this.disable();
        else this.enable();
        menu.remove();
        this.contextMenu = null;
      });
      menu.appendChild(item);
      document.body.appendChild(menu);
      this.contextMenu = menu;
      const vw = window.innerWidth, vh = window.innerHeight;
      menu.style.left = `${Math.min(x, vw - 180)}px`;
      menu.style.top = `${Math.min(y, vh - 48)}px`;
      const onOutside = (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
          this.contextMenu = null;
          document.removeEventListener("click", onOutside);
        }
      };
      setTimeout(() => document.addEventListener("click", onOutside), 0);
      const onEsc = (e) => {
        if (e.key === "Escape") {
          menu.remove();
          this.contextMenu = null;
          document.removeEventListener("keydown", onEsc);
        }
      };
      document.addEventListener("keydown", onEsc);
    }
    /** Attach a document click listener that hides the bubble when clicking outside the guide root. */
    attachClickOutside() {
      this.detachClickOutside();
      setTimeout(() => {
        this.clickOutsideHandler = (e) => {
          if (!this.isVisible) return;
          if (this.root && this.root.contains(e.target)) return;
          this.hide();
        };
        document.addEventListener("click", this.clickOutsideHandler, { passive: true });
      }, 0);
    }
    detachClickOutside() {
      if (this.clickOutsideHandler) {
        document.removeEventListener("click", this.clickOutsideHandler);
        this.clickOutsideHandler = null;
      }
    }
    assertInit() {
      if (!this.root) throw new Error("TMRGuide: call init() first");
    }
  }
  const TMRGuide2 = new TMRGuideSDK();
  exports.TMRGuide = TMRGuide2;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({});
//# sourceMappingURL=tmr-guide.iife.js.map
