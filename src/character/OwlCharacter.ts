import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";

const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];

export class OwlCharacter implements CharacterRenderer {
  private container: HTMLElement | null = null;
  private inner: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mouthEl: SVGRectElement | null = null;
  // Iris ellipses — ry animated to 0.6 for blinking
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

    const svg = this.buildSVG();
    inner.appendChild(svg);
    container.appendChild(inner);
    this.inner = inner;

    this.scheduleBlink();
  }

  setState(state: CharacterState): void {
    if (!this.container) return;
    this.container.dataset.state = state;

    // In "thinking" state the irises shift up, giving an inquisitive look
    if (state === "thinking") {
      this.eyeL?.setAttribute("cy", "22");
      this.eyeR?.setAttribute("cy", "22");
    } else {
      this.eyeL?.setAttribute("cy", "25");
      this.eyeR?.setAttribute("cy", "25");
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

  destroy(): void {
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

  private scheduleBlink(): void {
    const delay = 2500 + Math.random() * 3500;
    this.blinkTimer = setTimeout(() => {
      this.blink();
      this.scheduleBlink();
    }, delay);
  }

  private blink(): void {
    if (!this.eyeL || !this.eyeR) return;
    const BLINK_DUR = 120;
    this.eyeL.setAttribute("ry", "0.6");
    this.eyeR.setAttribute("ry", "0.6");
    if (this.eyeShineL) this.eyeShineL.style.opacity = "0";
    if (this.eyeShineR) this.eyeShineR.style.opacity = "0";

    setTimeout(() => {
      if (this.eyeL) this.eyeL.setAttribute("ry", "6.5");
      if (this.eyeR) this.eyeR.setAttribute("ry", "6.5");
      if (this.eyeShineL) this.eyeShineL.style.opacity = "1";
      if (this.eyeShineR) this.eyeShineR.style.opacity = "1";
    }, BLINK_DUR);
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

    // Shadow
    const shadow = document.createElementNS(ns, "ellipse");
    shadow.setAttribute("cx", "36"); shadow.setAttribute("cy", "70");
    shadow.setAttribute("rx", "18"); shadow.setAttribute("ry", "3");
    shadow.setAttribute("fill", "rgba(0,0,0,0.12)");
    svg.appendChild(shadow);

    // Wings — behind body so they peek out on the sides
    const wingL = document.createElementNS(ns, "ellipse");
    wingL.setAttribute("cx", "15"); wingL.setAttribute("cy", "50");
    wingL.setAttribute("rx", "9"); wingL.setAttribute("ry", "14");
    wingL.setAttribute("fill", "#374151");
    svg.appendChild(wingL);

    const wingR = document.createElementNS(ns, "ellipse");
    wingR.setAttribute("cx", "57"); wingR.setAttribute("cy", "50");
    wingR.setAttribute("rx", "9"); wingR.setAttribute("ry", "14");
    wingR.setAttribute("fill", "#374151");
    svg.appendChild(wingR);

    // Body
    const body = document.createElementNS(ns, "ellipse");
    body.setAttribute("cx", "36"); body.setAttribute("cy", "54");
    body.setAttribute("rx", "18"); body.setAttribute("ry", "16");
    body.setAttribute("fill", "#1f2937");
    svg.appendChild(body);

    // Belly (lighter feathered area)
    const belly = document.createElementNS(ns, "ellipse");
    belly.setAttribute("cx", "36"); belly.setAttribute("cy", "57");
    belly.setAttribute("rx", "11"); belly.setAttribute("ry", "12");
    belly.setAttribute("fill", "#374151");
    svg.appendChild(belly);

    // Head (large circle)
    const head = document.createElementNS(ns, "circle");
    head.setAttribute("cx", "36"); head.setAttribute("cy", "26");
    head.setAttribute("r", "18");
    head.setAttribute("fill", "#1f2937");
    svg.appendChild(head);

    // Ear tufts (primary-color triangles at top of head)
    const tuftL = document.createElementNS(ns, "polygon");
    tuftL.setAttribute("points", "18,14 22,4 27,14");
    tuftL.setAttribute("fill", c);
    svg.appendChild(tuftL);

    const tuftR = document.createElementNS(ns, "polygon");
    tuftR.setAttribute("points", "45,14 50,4 54,14");
    tuftR.setAttribute("fill", c);
    svg.appendChild(tuftR);

    // Eye scleras (white background circles — not animated)
    const scleraL = document.createElementNS(ns, "circle");
    scleraL.setAttribute("cx", "27"); scleraL.setAttribute("cy", "25");
    scleraL.setAttribute("r", "8.5"); scleraL.setAttribute("fill", "white");
    svg.appendChild(scleraL);

    const scleraR = document.createElementNS(ns, "circle");
    scleraR.setAttribute("cx", "45"); scleraR.setAttribute("cy", "25");
    scleraR.setAttribute("r", "8.5"); scleraR.setAttribute("fill", "white");
    svg.appendChild(scleraR);

    // Irises (primary color ellipses — ry animated for blinking)
    const eyeL = document.createElementNS(ns, "ellipse");
    eyeL.setAttribute("cx", "27"); eyeL.setAttribute("cy", "25");
    eyeL.setAttribute("rx", "6.5"); eyeL.setAttribute("ry", "6.5");
    eyeL.setAttribute("fill", c);
    svg.appendChild(eyeL);
    this.eyeL = eyeL;

    const eyeR = document.createElementNS(ns, "ellipse");
    eyeR.setAttribute("cx", "45"); eyeR.setAttribute("cy", "25");
    eyeR.setAttribute("rx", "6.5"); eyeR.setAttribute("ry", "6.5");
    eyeR.setAttribute("fill", c);
    svg.appendChild(eyeR);
    this.eyeR = eyeR;

    // Pupils (dark, drawn on top of irises)
    const pupilL = document.createElementNS(ns, "circle");
    pupilL.setAttribute("cx", "27"); pupilL.setAttribute("cy", "25");
    pupilL.setAttribute("r", "3"); pupilL.setAttribute("fill", "#111827");
    svg.appendChild(pupilL);

    const pupilR = document.createElementNS(ns, "circle");
    pupilR.setAttribute("cx", "45"); pupilR.setAttribute("cy", "25");
    pupilR.setAttribute("r", "3"); pupilR.setAttribute("fill", "#111827");
    svg.appendChild(pupilR);

    // Eye shines
    const shineL = document.createElementNS(ns, "circle");
    shineL.setAttribute("cx", "29"); shineL.setAttribute("cy", "23");
    shineL.setAttribute("r", "1.5"); shineL.setAttribute("fill", "white");
    svg.appendChild(shineL);
    this.eyeShineL = shineL;

    const shineR = document.createElementNS(ns, "circle");
    shineR.setAttribute("cx", "47"); shineR.setAttribute("cy", "23");
    shineR.setAttribute("r", "1.5"); shineR.setAttribute("fill", "white");
    svg.appendChild(shineR);
    this.eyeShineR = shineR;

    // Beak (amber rect — animated height for talking)
    const mouth = document.createElementNS(ns, "rect");
    mouth.setAttribute("x", "32"); mouth.setAttribute("y", "32");
    mouth.setAttribute("width", "8"); mouth.setAttribute("height", "5");
    mouth.setAttribute("rx", "2.5");
    mouth.setAttribute("fill", "#f59e0b");
    svg.appendChild(mouth);
    this.mouthEl = mouth;

    // Feet
    const footL = document.createElementNS(ns, "rect");
    footL.setAttribute("x", "25"); footL.setAttribute("y", "67");
    footL.setAttribute("width", "9"); footL.setAttribute("height", "4");
    footL.setAttribute("rx", "2");
    footL.setAttribute("fill", c);
    svg.appendChild(footL);

    const footR = document.createElementNS(ns, "rect");
    footR.setAttribute("x", "38"); footR.setAttribute("y", "67");
    footR.setAttribute("width", "9"); footR.setAttribute("height", "4");
    footR.setAttribute("rx", "2");
    footR.setAttribute("fill", c);
    svg.appendChild(footR);

    return svg;
  }

  private startMouthAnim(): void {
    if (this.mouthTimer) return;
    this.mouthTimer = setInterval(() => {
      if (!this.mouthEl) return;
      this.mouthOpen = !this.mouthOpen;
      this.mouthEl.setAttribute("height", this.mouthOpen ? "8" : "5");
      this.mouthEl.setAttribute("y", this.mouthOpen ? "30" : "32");
    }, 200);
  }

  private stopMouthAnim(): void {
    if (this.mouthTimer) {
      clearInterval(this.mouthTimer);
      this.mouthTimer = null;
    }
    if (this.mouthEl) {
      this.mouthEl.setAttribute("height", "5");
      this.mouthEl.setAttribute("y", "32");
    }
    this.mouthOpen = false;
  }

  private spawnSparkles(): void {
    if (!this.inner) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const dot = document.createElement("div");
        dot.className = "tmrg-sparkle";
        const angle = (i / 6) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 28 + Math.random() * 16;
        dot.style.setProperty("--sx", `${Math.cos(rad) * dist}px`);
        dot.style.setProperty("--sy", `${Math.sin(rad) * dist}px`);
        dot.style.backgroundColor =
          SPARKLE_COLORS[i % SPARKLE_COLORS.length];
        dot.style.top = "20px";
        dot.style.left = "28px";
        this.inner!.appendChild(dot);
        setTimeout(() => dot.remove(), 750);
      }, i * 60);
    }
  }
}
