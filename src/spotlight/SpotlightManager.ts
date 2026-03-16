import { injectCSS } from "../utils/dom";
import type { HighlightMode } from "../types";

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

const PAD = 8; // padding around target rect

export interface SpotlightOptions {
  mode?: HighlightMode;
  color?: string;
  ringWidth?: number;
  fadeDuration?: number;
}

export class SpotlightManager {
  private overlay: HTMLElement | null = null;
  private ring: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mask: SVGRectElement | null = null;
  private resizeObs: ResizeObserver | null = null;
  private scrollHandler: (() => void) | null = null;
  private currentTarget: string | null = null;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  init(root: HTMLElement): void {
    injectCSS("tmrg-spotlight-css", SPOTLIGHT_CSS);

    // Overlay SVG (darkens everything)
    const overlay = document.createElement("div");
    overlay.className = "tmrg-spotlight";
    overlay.style.opacity = "0";

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("class", "tmrg-spotlight-svg");

    const defs = document.createElementNS(svgNS, "defs");
    const maskEl = document.createElementNS(svgNS, "mask");
    maskEl.setAttribute("id", "tmrg-mask");

    const white = document.createElementNS(svgNS, "rect");
    white.setAttribute("x", "0"); white.setAttribute("y", "0");
    white.setAttribute("width", "100%"); white.setAttribute("height", "100%");
    white.setAttribute("fill", "white");
    maskEl.appendChild(white);

    const hole = document.createElementNS(svgNS, "rect");
    hole.setAttribute("fill", "black");
    hole.setAttribute("rx", "10");
    this.mask = hole as SVGRectElement;
    maskEl.appendChild(hole);

    defs.appendChild(maskEl);
    svg.appendChild(defs);

    const dark = document.createElementNS(svgNS, "rect");
    dark.setAttribute("x", "0"); dark.setAttribute("y", "0");
    dark.setAttribute("width", "100%"); dark.setAttribute("height", "100%");
    dark.setAttribute("fill", "rgba(0,0,0,0.45)");
    dark.setAttribute("mask", "url(#tmrg-mask)");
    svg.appendChild(dark);

    overlay.appendChild(svg);
    root.appendChild(overlay);
    this.overlay = overlay;
    this.svg = svg;

    // Highlight ring (separate element, gives the colored glow)
    const ring = document.createElement("div");
    ring.className = "tmrg-highlight-ring";
    root.appendChild(ring);
    this.ring = ring;
  }

  show(targetSelector: string, opts: SpotlightOptions = {}): void {
    this.clearFadeTimer();
    this.currentTarget = targetSelector;

    // Scroll the target element into view if it is off-screen
    const targetEl = document.querySelector(targetSelector);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    const mode: HighlightMode = opts.mode ?? "persistent";
    const color = opts.color ?? "#ff6700";
    const width = opts.ringWidth ?? 3;
    const fadeDuration = opts.fadeDuration ?? 4000;

    // Build box-shadow strings for normal + wide (pulse expanded) state
    const glowHex = Math.round(0.25 * 255).toString(16).padStart(2, "0");
    const shadow = `0 0 0 ${width}px ${color}, 0 0 0 ${width * 2}px ${color}${glowHex}`;
    const shadowWide = `0 0 0 ${width + 2}px ${color}, 0 0 0 ${(width + 2) * 2}px ${color}${glowHex}`;

    this.ring!.style.setProperty("--tmrg-ring-shadow", shadow);
    this.ring!.style.setProperty("--tmrg-ring-wide", shadowWide);
    this.ring!.style.boxShadow = shadow;

    // Reset pulse class (force reflow to restart animation if re-triggered)
    this.ring!.classList.remove("tmrg-pulse");
    void this.ring!.offsetWidth;

    this.updatePosition();

    switch (mode) {
      case "ring-only":
        // No overlay dim — ring only
        this.overlay!.style.opacity = "0";
        this.ring!.classList.add("visible");
        break;

      case "timed":
        this.overlay!.style.opacity = "1";
        this.ring!.classList.add("visible");
        this.fadeTimer = setTimeout(() => this.fadeOut(), fadeDuration);
        break;

      case "pulse":
        this.overlay!.style.opacity = "1";
        this.ring!.classList.add("visible", "tmrg-pulse");
        // After 2.1s animation + 0.35s fade delay = overlay hides ~same time
        this.fadeTimer = setTimeout(() => {
          if (this.overlay) this.overlay.style.opacity = "0";
        }, 2100);
        // Ring fades via animation fill-mode; stop tracking after it's done
        this.ring!.addEventListener("animationend", () => this.stopTracking(), { once: true });
        break;

      case "persistent":
      default:
        this.overlay!.style.opacity = "1";
        this.ring!.classList.add("visible");
        break;
    }

    if (mode !== "pulse") this.startTracking();
    else this.startTracking(); // track during pulse too (target may scroll)
  }

  hide(): void {
    this.clearFadeTimer();
    this.currentTarget = null;
    this.overlay!.style.opacity = "0";
    this.ring!.classList.remove("visible", "tmrg-pulse");
    this.stopTracking();
    this.setHoleRect(-999, -999, 0, 0);
  }

  destroy(): void {
    this.clearFadeTimer();
    this.stopTracking();
    this.overlay?.remove();
    this.ring?.remove();
    this.overlay = null;
    this.ring = null;
  }

  // ─── private ───────────────────────────────────────────────────

  private fadeOut(): void {
    if (this.overlay) this.overlay.style.opacity = "0";
    if (this.ring) this.ring.classList.remove("visible", "tmrg-pulse");
    this.stopTracking();
  }

  private clearFadeTimer(): void {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private updatePosition(): void {
    if (!this.currentTarget) return;
    const el = document.querySelector(this.currentTarget);
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.setHoleRect(r.left - PAD, r.top - PAD, r.width + PAD * 2, r.height + PAD * 2);
    this.ring!.style.left = `${r.left - PAD}px`;
    this.ring!.style.top = `${r.top - PAD}px`;
    this.ring!.style.width = `${r.width + PAD * 2}px`;
    this.ring!.style.height = `${r.height + PAD * 2}px`;
  }

  private setHoleRect(x: number, y: number, w: number, h: number): void {
    if (!this.mask) return;
    this.mask.setAttribute("x", String(x));
    this.mask.setAttribute("y", String(y));
    this.mask.setAttribute("width", String(Math.max(0, w)));
    this.mask.setAttribute("height", String(Math.max(0, h)));
  }

  private startTracking(): void {
    this.stopTracking();
    this.resizeObs = new ResizeObserver(() => this.updatePosition());
    const target = this.currentTarget ? document.querySelector(this.currentTarget) : null;
    if (target) this.resizeObs.observe(target);
    this.scrollHandler = () => this.updatePosition();
    window.addEventListener("scroll", this.scrollHandler, { passive: true, capture: true });
    window.addEventListener("resize", this.scrollHandler, { passive: true });
  }

  private stopTracking(): void {
    this.resizeObs?.disconnect();
    this.resizeObs = null;
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", this.scrollHandler);
      this.scrollHandler = null;
    }
  }
}
