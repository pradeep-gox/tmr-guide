import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";

const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];

export class BotCharacter implements CharacterRenderer {
  private container: HTMLElement | null = null;
  private inner: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mouthEl: SVGRectElement | null = null;
  // Eyes are ellipses so we can animate ry for blinking
  private eyeL: SVGEllipseElement | null = null;
  private eyeR: SVGEllipseElement | null = null;
  private eyeShineL: SVGCircleElement | null = null;
  private eyeShineR: SVGCircleElement | null = null;
  private blinkTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly size: number = 72, private readonly primaryColor: string = "#ff6700") {}

  mount(container: HTMLElement): void {
    this.container = container;

    const inner = document.createElement("div");
    inner.className = "tmrg-char-inner";
    inner.style.cssText = `display:inline-block;position:relative;`;

    const svg = this.buildSVG();
    inner.appendChild(svg);

    container.appendChild(inner);
    this.inner = inner;

    // Start random blink loop
    this.scheduleBlink();
  }

  setState(state: CharacterState): void {
    if (!this.container) return;
    this.container.dataset.state = state;

    if (state === "thinking") {
      this.eyeL!.setAttribute("cy", "19");
      this.eyeR!.setAttribute("cy", "19");
    } else {
      this.eyeL!.setAttribute("cy", "22");
      this.eyeR!.setAttribute("cy", "22");
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

  /** Schedule the next blink at a random interval (2.5s – 6s). */
  private scheduleBlink(): void {
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
  private blink(): void {
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

    // Body
    const body = document.createElementNS(ns, "rect");
    body.setAttribute("x", "18"); body.setAttribute("y", "30");
    body.setAttribute("width", "36"); body.setAttribute("height", "26");
    body.setAttribute("rx", "6");
    body.setAttribute("fill", c);
    svg.appendChild(body);

    // Head
    const head = document.createElementNS(ns, "rect");
    head.setAttribute("x", "16"); head.setAttribute("y", "8");
    head.setAttribute("width", "40"); head.setAttribute("height", "30");
    head.setAttribute("rx", "10");
    head.setAttribute("fill", "#1f2937");
    svg.appendChild(head);

    // Screen inside head (face panel)
    const screen = document.createElementNS(ns, "rect");
    screen.setAttribute("x", "20"); screen.setAttribute("y", "12");
    screen.setAttribute("width", "32"); screen.setAttribute("height", "22");
    screen.setAttribute("rx", "6");
    screen.setAttribute("fill", "#111827");
    svg.appendChild(screen);

    // Antenna
    const antennaBase = document.createElementNS(ns, "rect");
    antennaBase.setAttribute("x", "34"); antennaBase.setAttribute("y", "2");
    antennaBase.setAttribute("width", "4"); antennaBase.setAttribute("height", "8");
    antennaBase.setAttribute("rx", "2");
    antennaBase.setAttribute("fill", "#374151");
    svg.appendChild(antennaBase);

    const antennaBall = document.createElementNS(ns, "circle");
    antennaBall.setAttribute("cx", "36"); antennaBall.setAttribute("cy", "2");
    antennaBall.setAttribute("r", "3");
    antennaBall.setAttribute("fill", c);
    svg.appendChild(antennaBall);

    // Eyes — ellipses so ry can be animated for blinking
    const eyeL = document.createElementNS(ns, "ellipse");
    eyeL.setAttribute("cx", "29"); eyeL.setAttribute("cy", "22");
    eyeL.setAttribute("rx", "4"); eyeL.setAttribute("ry", "4");
    eyeL.setAttribute("fill", c);
    svg.appendChild(eyeL);
    this.eyeL = eyeL;

    const eyeR = document.createElementNS(ns, "ellipse");
    eyeR.setAttribute("cx", "43"); eyeR.setAttribute("cy", "22");
    eyeR.setAttribute("rx", "4"); eyeR.setAttribute("ry", "4");
    eyeR.setAttribute("fill", c);
    svg.appendChild(eyeR);
    this.eyeR = eyeR;

    // Eye shines
    const shineL = document.createElementNS(ns, "circle");
    shineL.setAttribute("cx", "31"); shineL.setAttribute("cy", "20"); shineL.setAttribute("r", "1.5");
    shineL.setAttribute("fill", "white");
    svg.appendChild(shineL);
    this.eyeShineL = shineL;

    const shineR = document.createElementNS(ns, "circle");
    shineR.setAttribute("cx", "45"); shineR.setAttribute("cy", "20"); shineR.setAttribute("r", "1.5");
    shineR.setAttribute("fill", "white");
    svg.appendChild(shineR);
    this.eyeShineR = shineR;

    // Mouth
    const mouth = document.createElementNS(ns, "rect");
    mouth.setAttribute("x", "28"); mouth.setAttribute("y", "28");
    mouth.setAttribute("width", "16"); mouth.setAttribute("height", "4");
    mouth.setAttribute("rx", "2");
    mouth.setAttribute("fill", "#374151");
    svg.appendChild(mouth);
    this.mouthEl = mouth;

    // Chest light (decoration)
    const chest = document.createElementNS(ns, "circle");
    chest.setAttribute("cx", "36"); chest.setAttribute("cy", "40");
    chest.setAttribute("r", "4");
    chest.setAttribute("fill", "rgba(255,255,255,0.25)");
    svg.appendChild(chest);

    // Left arm
    const armL = document.createElementNS(ns, "rect");
    armL.setAttribute("x", "10"); armL.setAttribute("y", "32");
    armL.setAttribute("width", "10"); armL.setAttribute("height", "16");
    armL.setAttribute("rx", "5");
    armL.setAttribute("fill", "#374151");
    svg.appendChild(armL);

    // Right arm
    const armR = document.createElementNS(ns, "rect");
    armR.setAttribute("x", "52"); armR.setAttribute("y", "32");
    armR.setAttribute("width", "10"); armR.setAttribute("height", "16");
    armR.setAttribute("rx", "5");
    armR.setAttribute("fill", "#374151");
    svg.appendChild(armR);

    // Left leg
    const legL = document.createElementNS(ns, "rect");
    legL.setAttribute("x", "22"); legL.setAttribute("y", "54");
    legL.setAttribute("width", "10"); legL.setAttribute("height", "14");
    legL.setAttribute("rx", "5");
    legL.setAttribute("fill", "#374151");
    svg.appendChild(legL);

    // Right leg
    const legR = document.createElementNS(ns, "rect");
    legR.setAttribute("x", "40"); legR.setAttribute("y", "54");
    legR.setAttribute("width", "10"); legR.setAttribute("height", "14");
    legR.setAttribute("rx", "5");
    legR.setAttribute("fill", "#374151");
    svg.appendChild(legR);

    return svg;
  }

  private mouthTimer: ReturnType<typeof setInterval> | null = null;
  private mouthOpen = false;

  private startMouthAnim(): void {
    if (this.mouthTimer) return;
    this.mouthTimer = setInterval(() => {
      if (!this.mouthEl) return;
      this.mouthOpen = !this.mouthOpen;
      this.mouthEl.setAttribute("height", this.mouthOpen ? "7" : "4");
      this.mouthEl.setAttribute("y", this.mouthOpen ? "26" : "28");
    }, 180);
  }

  private stopMouthAnim(): void {
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
        dot.style.top = "30px";
        dot.style.left = "33px";
        this.inner!.appendChild(dot);
        setTimeout(() => dot.remove(), 750);
      }, i * 60);
    }
  }
}
