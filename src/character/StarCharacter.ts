import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";

const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];

// 5-point star polygon (center 36,38, outer R=24, inner R=10)
// Points alternate outer → inner going clockwise from top
const STAR_POINTS =
  "36,14 42,30 59,31 46,41 50,57 36,48 22,57 26,41 13,31 30,30";

export class StarCharacter implements CharacterRenderer {
  private container: HTMLElement | null = null;
  private inner: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mouthEl: SVGRectElement | null = null;
  // Dark iris ellipses (white sclera behind them) — ry animated for blinking
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

    // Eyes drift up when thinking
    if (state === "thinking") {
      this.eyeL?.setAttribute("cy", "32");
      this.eyeR?.setAttribute("cy", "32");
    } else {
      this.eyeL?.setAttribute("cy", "36");
      this.eyeR?.setAttribute("cy", "36");
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
      if (this.eyeL) this.eyeL.setAttribute("ry", "4");
      if (this.eyeR) this.eyeR.setAttribute("ry", "4");
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
    svg.appendChild(el("ellipse", { cx:"36", cy:"66", rx:"13", ry:"2.5", fill:"rgba(0,0,0,0.12)" }));

    // Star body (primary color)
    svg.appendChild(el("polygon", { points: STAR_POINTS, fill: c }));

    // Inner face circle (slightly lighter overlay so the face pops)
    svg.appendChild(el("circle", { cx:"36", cy:"38", r:"14", fill:"rgba(255,255,255,0.15)" }));

    // Eye scleras (white — not animated, sit behind irises)
    svg.appendChild(el("circle", { cx:"29", cy:"36", r:"5", fill:"white" }));
    svg.appendChild(el("circle", { cx:"43", cy:"36", r:"5", fill:"white" }));

    // Irises (dark — ry animated for blinking)
    const eyeL = el("ellipse", { cx:"29", cy:"36", rx:"4", ry:"4", fill:"#1f2937" }) as SVGEllipseElement;
    svg.appendChild(eyeL);
    this.eyeL = eyeL;

    const eyeR = el("ellipse", { cx:"43", cy:"36", rx:"4", ry:"4", fill:"#1f2937" }) as SVGEllipseElement;
    svg.appendChild(eyeR);
    this.eyeR = eyeR;

    // Eye shines
    const shineL = el("circle", { cx:"31", cy:"34", r:"1.5", fill:"white" }) as SVGCircleElement;
    svg.appendChild(shineL);
    this.eyeShineL = shineL;

    const shineR = el("circle", { cx:"45", cy:"34", r:"1.5", fill:"white" }) as SVGCircleElement;
    svg.appendChild(shineR);
    this.eyeShineR = shineR;

    // Blush dots (cute cheek marks on the bright star body)
    svg.appendChild(el("circle", { cx:"21", cy:"41", r:"3.5", fill:"rgba(255,150,80,0.35)" }));
    svg.appendChild(el("circle", { cx:"51", cy:"41", r:"3.5", fill:"rgba(255,150,80,0.35)" }));

    // Mouth (mouthEl — dark rect on the bright star body)
    const mouth = el("rect", { x:"30", y:"43", width:"12", height:"4", rx:"2", fill:"#1f2937" }) as SVGRectElement;
    svg.appendChild(mouth);
    this.mouthEl = mouth;

    return svg;
  }

  private startMouthAnim(): void {
    if (this.mouthTimer) return;
    this.mouthTimer = setInterval(() => {
      if (!this.mouthEl) return;
      this.mouthOpen = !this.mouthOpen;
      this.mouthEl.setAttribute("height", this.mouthOpen ? "7" : "4");
      this.mouthEl.setAttribute("y", this.mouthOpen ? "41" : "43");
    }, 180);
  }

  private stopMouthAnim(): void {
    if (this.mouthTimer) { clearInterval(this.mouthTimer); this.mouthTimer = null; }
    if (this.mouthEl) { this.mouthEl.setAttribute("height", "4"); this.mouthEl.setAttribute("y", "43"); }
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
        dot.style.top = "24px";
        dot.style.left = "30px";
        this.inner!.appendChild(dot);
        setTimeout(() => dot.remove(), 750);
      }, i * 60);
    }
  }
}
