import { injectCSS } from "../utils/dom";

const SPOTLIGHT_CSS = `
.tmrg-spotlight {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483638;
  transition: opacity 0.25s ease;
}
.tmrg-spotlight-svg {
  width: 100%; height: 100%;
}
/* The highlight ring around the target */
.tmrg-highlight-ring {
  position: fixed;
  border-radius: 10px;
  box-shadow: 0 0 0 3px #ff6700, 0 0 0 6px rgba(255,103,0,0.25);
  pointer-events: none;
  z-index: 2147483639;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
}
.tmrg-highlight-ring.visible { opacity: 1; }
`;

const PAD = 8; // padding around target rect

export class SpotlightManager {
  private overlay: HTMLElement | null = null;
  private ring: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mask: SVGRectElement | null = null; // the cutout rect
  private resizeObs: ResizeObserver | null = null;
  private scrollHandler: (() => void) | null = null;
  private currentTarget: string | null = null;

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

    // defs with mask
    const defs = document.createElementNS(svgNS, "defs");
    const maskEl = document.createElementNS(svgNS, "mask");
    maskEl.setAttribute("id", "tmrg-mask");

    // White rect = visible dark overlay everywhere
    const white = document.createElementNS(svgNS, "rect");
    white.setAttribute("x", "0"); white.setAttribute("y", "0");
    white.setAttribute("width", "100%"); white.setAttribute("height", "100%");
    white.setAttribute("fill", "white");
    maskEl.appendChild(white);

    // Black rect = the "hole" (transparent area)
    const hole = document.createElementNS(svgNS, "rect");
    hole.setAttribute("fill", "black");
    hole.setAttribute("rx", "10");
    this.mask = hole as SVGRectElement;
    maskEl.appendChild(hole);

    defs.appendChild(maskEl);
    svg.appendChild(defs);

    // The dark rectangle that uses the mask
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

    // Highlight ring (separate element, gives the orange glow)
    const ring = document.createElement("div");
    ring.className = "tmrg-highlight-ring";
    root.appendChild(ring);
    this.ring = ring;
  }

  show(targetSelector: string, primaryColor = "#ff6700"): void {
    this.currentTarget = targetSelector;
    this.ring!.style.boxShadow = `0 0 0 3px ${primaryColor}, 0 0 0 6px ${primaryColor}40`;
    this.updatePosition();
    this.overlay!.style.opacity = "1";
    this.ring!.classList.add("visible");
    this.startTracking();
  }

  hide(): void {
    this.currentTarget = null;
    this.overlay!.style.opacity = "0";
    this.ring!.classList.remove("visible");
    this.stopTracking();
    // Move hole off screen
    this.setHoleRect(-999, -999, 0, 0);
  }

  destroy(): void {
    this.stopTracking();
    this.overlay?.remove();
    this.ring?.remove();
    this.overlay = null;
    this.ring = null;
  }

  // ─── private ───────────────────────────────────────────────────

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
