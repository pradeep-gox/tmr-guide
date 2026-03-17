import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";

const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];

export class WizardCharacter implements CharacterRenderer {
  private container: HTMLElement | null = null;
  private inner: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mouthEl: SVGRectElement | null = null;
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

    if (state === "thinking") {
      this.eyeL?.setAttribute("cy", "23");
      this.eyeR?.setAttribute("cy", "23");
    } else {
      this.eyeL?.setAttribute("cy", "26");
      this.eyeR?.setAttribute("cy", "26");
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
      if (this.eyeL) this.eyeL.setAttribute("ry", "3.5");
      if (this.eyeR) this.eyeR.setAttribute("ry", "3.5");
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
    svg.appendChild(el("ellipse", { cx:"36", cy:"70", rx:"14", ry:"3", fill:"rgba(0,0,0,0.12)" }));

    // Staff (left side)
    svg.appendChild(el("rect", { x:"6", y:"22", width:"4", height:"46", rx:"2", fill:"#4b5563" }));

    // Staff orb
    svg.appendChild(el("circle", { cx:"8", cy:"19", r:"7", fill:c }));
    svg.appendChild(el("circle", { cx:"6", cy:"17", r:"2", fill:"rgba(255,255,255,0.45)" }));

    // Sleeves (behind robe)
    svg.appendChild(el("ellipse", { cx:"13", cy:"46", rx:"8", ry:"10", fill:"#374151" }));
    svg.appendChild(el("ellipse", { cx:"59", cy:"46", rx:"8", ry:"10", fill:"#374151" }));

    // Robe
    svg.appendChild(el("rect", { x:"16", y:"34", width:"40", height:"36", rx:"10", fill:"#1f2937" }));

    // Robe hem accent
    svg.appendChild(el("rect", { x:"16", y:"34", width:"40", height:"5", rx:"4", fill:c, opacity:"0.25" }));

    // Hat cone
    svg.appendChild(el("polygon", { points:"36,1 52,14 20,14", fill:c }));

    // Hat brim
    svg.appendChild(el("ellipse", { cx:"36", cy:"14", rx:"20", ry:"4", fill:c }));

    // Stars on hat
    svg.appendChild(el("circle", { cx:"36", cy:"2", r:"2.5", fill:"white" }));
    svg.appendChild(el("circle", { cx:"42", cy:"7", r:"1.5", fill:"rgba(255,255,255,0.65)" }));
    svg.appendChild(el("circle", { cx:"30", cy:"7", r:"1", fill:"rgba(255,255,255,0.45)" }));

    // Head
    svg.appendChild(el("circle", { cx:"36", cy:"27", r:"14", fill:"#1f2937" }));

    // Bushy eyebrows
    const browL = el("rect", { x:"26", y:"20", width:"9", height:"2.5", rx:"1.2", fill:"#e5e7eb" });
    browL.setAttribute("transform", "rotate(-8 30 21)");
    svg.appendChild(browL);

    const browR = el("rect", { x:"37", y:"20", width:"9", height:"2.5", rx:"1.2", fill:"#e5e7eb" });
    browR.setAttribute("transform", "rotate(8 42 21)");
    svg.appendChild(browR);

    // Eyes (primary color, blink-animated)
    const eyeL = el("ellipse", { cx:"30", cy:"26", rx:"3.5", ry:"3.5", fill:c }) as SVGEllipseElement;
    svg.appendChild(eyeL);
    this.eyeL = eyeL;

    const eyeR = el("ellipse", { cx:"42", cy:"26", rx:"3.5", ry:"3.5", fill:c }) as SVGEllipseElement;
    svg.appendChild(eyeR);
    this.eyeR = eyeR;

    // Eye shines
    const shineL = el("circle", { cx:"31.5", cy:"24.5", r:"1.2", fill:"white" }) as SVGCircleElement;
    svg.appendChild(shineL);
    this.eyeShineL = shineL;

    const shineR = el("circle", { cx:"43.5", cy:"24.5", r:"1.2", fill:"white" }) as SVGCircleElement;
    svg.appendChild(shineR);
    this.eyeShineR = shineR;

    // Beard (white/light, covers lower face + flows over robe collar)
    svg.appendChild(el("ellipse", { cx:"36", cy:"37", rx:"10", ry:"8", fill:"#e5e7eb" }));

    // Mouth (inside beard area, mouthEl)
    const mouth = el("rect", { x:"31", y:"36", width:"10", height:"3", rx:"1.5", fill:"#9ca3af" }) as SVGRectElement;
    svg.appendChild(mouth);
    this.mouthEl = mouth;

    return svg;
  }

  private startMouthAnim(): void {
    if (this.mouthTimer) return;
    this.mouthTimer = setInterval(() => {
      if (!this.mouthEl) return;
      this.mouthOpen = !this.mouthOpen;
      this.mouthEl.setAttribute("height", this.mouthOpen ? "6" : "3");
      this.mouthEl.setAttribute("y", this.mouthOpen ? "35" : "36");
    }, 190);
  }

  private stopMouthAnim(): void {
    if (this.mouthTimer) { clearInterval(this.mouthTimer); this.mouthTimer = null; }
    if (this.mouthEl) { this.mouthEl.setAttribute("height", "3"); this.mouthEl.setAttribute("y", "36"); }
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
        dot.style.top = "22px";
        dot.style.left = "30px";
        this.inner!.appendChild(dot);
        setTimeout(() => dot.remove(), 750);
      }, i * 60);
    }
  }
}
