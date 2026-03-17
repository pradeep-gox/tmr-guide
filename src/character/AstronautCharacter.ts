import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";

const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];

export class AstronautCharacter implements CharacterRenderer {
  private container: HTMLElement | null = null;
  private inner: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mouthEl: SVGRectElement | null = null;
  // Eyes glow inside the dark visor — ry animated for blinking
  private eyeL: SVGEllipseElement | null = null;
  private eyeR: SVGEllipseElement | null = null;
  private eyeShineL: SVGCircleElement | null = null;
  private eyeShineR: SVGCircleElement | null = null;
  private blinkTimer: ReturnType<typeof setTimeout> | null = null;
  private mouthTimer: ReturnType<typeof setInterval> | null = null;
  private mouthOpen = false;

  constructor(
    private readonly size: number = 72,
    private readonly primaryColor: string = "#ff6700",
  ) {}

  mount(container: HTMLElement): void {
    this.container = container;
    const inner = document.createElement("div");
    inner.className = "tmrg-char-inner";
    inner.style.cssText = `display:inline-block;position:relative;`;
    inner.appendChild(this.buildSVG());
    container.appendChild(inner);
    this.inner = inner;
    this.scheduleBlink();
  }

  setState(state: CharacterState): void {
    if (!this.container) return;
    this.container.dataset.state = state;

    // "Looking up" through the visor when thinking
    if (state === "thinking") {
      this.eyeL?.setAttribute("cy", "24");
      this.eyeR?.setAttribute("cy", "24");
    } else {
      this.eyeL?.setAttribute("cy", "27");
      this.eyeR?.setAttribute("cy", "27");
    }

    if (state === "talking") {
      this.startMouthAnim();
    } else {
      this.stopMouthAnim();
    }

    if (state === "celebrating") this.spawnSparkles();
  }

  destroy(): void {
    this.stopMouthAnim();
    if (this.blinkTimer) { clearTimeout(this.blinkTimer); this.blinkTimer = null; }
    this.container = null;
    this.inner = null;
    this.svg = null;
    this.mouthEl = null;
    this.eyeL = null;
    this.eyeR = null;
  }

  // ─── private ───────────────────────────────────────────────────

  private scheduleBlink(): void {
    this.blinkTimer = setTimeout(() => {
      this.blink();
      this.scheduleBlink();
    }, 2500 + Math.random() * 3500);
  }

  private blink(): void {
    if (!this.eyeL || !this.eyeR) return;
    this.eyeL.setAttribute("ry", "0.6");
    this.eyeR.setAttribute("ry", "0.6");
    if (this.eyeShineL) this.eyeShineL.style.opacity = "0";
    if (this.eyeShineR) this.eyeShineR.style.opacity = "0";
    setTimeout(() => {
      if (this.eyeL) this.eyeL.setAttribute("ry", "3");
      if (this.eyeR) this.eyeR.setAttribute("ry", "3");
      if (this.eyeShineL) this.eyeShineL.style.opacity = "1";
      if (this.eyeShineR) this.eyeShineR.style.opacity = "1";
    }, 120);
  }

  private buildSVG(): SVGSVGElement {
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

    const el = (tag: string, attrs: Record<string, string>) => {
      const e = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      return e;
    };

    // Shadow
    svg.appendChild(el("ellipse", { cx:"36", cy:"70", rx:"16", ry:"3", fill:"rgba(0,0,0,0.12)" }));

    // Arms (behind suit body)
    svg.appendChild(el("rect", { x:"7", y:"36", width:"12", height:"22", rx:"6", fill:"#d1d5db" }));
    svg.appendChild(el("rect", { x:"53", y:"36", width:"12", height:"22", rx:"6", fill:"#d1d5db" }));

    // Suit body
    svg.appendChild(el("rect", { x:"18", y:"38", width:"36", height:"30", rx:"10", fill:"#e5e7eb" }));

    // Chest badge (primary color ring)
    svg.appendChild(el("circle", { cx:"36", cy:"48", r:"5.5", fill:"none", stroke:c, "stroke-width":"1.5" }));
    svg.appendChild(el("circle", { cx:"36", cy:"48", r:"2.5", fill:c, opacity:"0.6" }));

    // Legs (just peeking below suit body)
    svg.appendChild(el("rect", { x:"22", y:"65", width:"11", height:"7", rx:"4", fill:"#d1d5db" }));
    svg.appendChild(el("rect", { x:"39", y:"65", width:"11", height:"7", rx:"4", fill:"#d1d5db" }));

    // Helmet shell
    svg.appendChild(el("circle", { cx:"36", cy:"26", r:"18", fill:"#e5e7eb" }));

    // Helmet ring detail
    svg.appendChild(el("circle", { cx:"36", cy:"26", r:"17", fill:"none", stroke:"#d1d5db", "stroke-width":"1.5" }));

    // Antenna
    svg.appendChild(el("rect", { x:"34", y:"8", width:"4", height:"8", rx:"2", fill:"#9ca3af" }));
    svg.appendChild(el("circle", { cx:"36", cy:"8", r:"3", fill:c }));

    // Visor (dark)
    svg.appendChild(el("ellipse", { cx:"36", cy:"28", rx:"13", ry:"11", fill:"#1f2937" }));

    // Visor glare
    svg.appendChild(el("ellipse", { cx:"27", cy:"21", rx:"4", ry:"2.5", fill:"rgba(255,255,255,0.18)", transform:"rotate(-15 27 21)" }));

    // Eyes (primary color glow inside visor)
    const eyeL = el("ellipse", { cx:"29", cy:"27", rx:"3", ry:"3", fill:c }) as SVGEllipseElement;
    svg.appendChild(eyeL);
    this.eyeL = eyeL;

    const eyeR = el("ellipse", { cx:"43", cy:"27", rx:"3", ry:"3", fill:c }) as SVGEllipseElement;
    svg.appendChild(eyeR);
    this.eyeR = eyeR;

    // Eye shines
    const shineL = el("circle", { cx:"30.5", cy:"25.5", r:"1.2", fill:"white" }) as SVGCircleElement;
    svg.appendChild(shineL);
    this.eyeShineL = shineL;

    const shineR = el("circle", { cx:"44.5", cy:"25.5", r:"1.2", fill:"white" }) as SVGCircleElement;
    svg.appendChild(shineR);
    this.eyeShineR = shineR;

    // Mouth indicator inside visor (mouthEl)
    const mouth = el("rect", { x:"31", y:"33", width:"10", height:"3", rx:"1.5", fill:c, opacity:"0.6" }) as SVGRectElement;
    svg.appendChild(mouth);
    this.mouthEl = mouth;

    return svg;
  }

  private startMouthAnim(): void {
    if (this.mouthTimer) return;
    this.mouthTimer = setInterval(() => {
      if (!this.mouthEl) return;
      this.mouthOpen = !this.mouthOpen;
      this.mouthEl.setAttribute("height", this.mouthOpen ? "5" : "3");
      this.mouthEl.setAttribute("y", this.mouthOpen ? "32" : "33");
    }, 180);
  }

  private stopMouthAnim(): void {
    if (this.mouthTimer) { clearInterval(this.mouthTimer); this.mouthTimer = null; }
    if (this.mouthEl) { this.mouthEl.setAttribute("height", "3"); this.mouthEl.setAttribute("y", "33"); }
    this.mouthOpen = false;
  }

  private spawnSparkles(): void {
    if (!this.inner) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const dot = document.createElement("div");
        dot.className = "tmrg-sparkle";
        const rad = ((i / 6) * 360 * Math.PI) / 180;
        const dist = 28 + Math.random() * 16;
        dot.style.setProperty("--sx", `${Math.cos(rad) * dist}px`);
        dot.style.setProperty("--sy", `${Math.sin(rad) * dist}px`);
        dot.style.backgroundColor = SPARKLE_COLORS[i % SPARKLE_COLORS.length];
        dot.style.top = "20px";
        dot.style.left = "30px";
        this.inner!.appendChild(dot);
        setTimeout(() => dot.remove(), 750);
      }, i * 60);
    }
  }
}
