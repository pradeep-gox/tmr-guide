import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";

const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];

// Head path states — Pac-Man / quarter-circle centered at (36, 25), R=20
// Mouth opens toward the right (3 o'clock), ±angle/2 from horizontal.
// PATH_OPEN is the TMR logo shape (90° quarter removed).
const PATH_OPEN = "M 36,25 L 50,11 A 20,20 0 1 0 50,39 Z"; // 90° open  — logo shape
const PATH_MEDIUM = "M 36,25 L 55,17 A 20,20 0 1 0 55,33 Z"; // 45° open  — mid-chomp
const PATH_CLOSED = "M 36,25 L 56,24 A 20,20 0 1 0 56,26 Z"; //  5° open  — nearly closed

export class SliceCharacter implements CharacterRenderer {
  private container: HTMLElement | null = null;
  private inner: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  // The ENTIRE head is a single <path> that we animate — no separate mouthEl
  private headPath: SVGPathElement | null = null;
  private eyeL: SVGEllipseElement | null = null;
  private eyeR: SVGEllipseElement | null = null;
  private eyeShineL: SVGCircleElement | null = null;
  private eyeShineR: SVGCircleElement | null = null;
  private blinkTimer: ReturnType<typeof setTimeout> | null = null;
  private chompTimer: ReturnType<typeof setInterval> | null = null;
  private chompOpen = false;

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
      // Close mouth when thinking — shows full Pac-Man face
      this.headPath?.setAttribute("d", PATH_CLOSED);
      this.eyeL?.setAttribute("cy", "18");
      this.eyeR?.setAttribute("cy", "11");
    } else {
      // Restore logo-shape open mouth for all other states
      if (state !== "talking") {
        this.headPath?.setAttribute("d", PATH_OPEN);
      }
      this.eyeL?.setAttribute("cy", "21");
      this.eyeR?.setAttribute("cy", "14");
    }

    if (state === "talking") {
      this.startChomp();
    } else {
      this.stopChomp();
    }

    if (state === "celebrating") this.spawnSparkles();
  }

  destroy(): void {
    this.stopChomp();
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
    this.container = null;
    this.inner = null;
    this.svg = null;
    this.headPath = null;
    this.eyeL = null;
    this.eyeR = null;
  }

  // ─── private ───────────────────────────────────────────────────

  private scheduleBlink(): void {
    this.blinkTimer = setTimeout(
      () => {
        this.blink();
        this.scheduleBlink();
      },
      2500 + Math.random() * 3500,
    );
  }

  /** Close the irises (ry → 0.6) for 120ms then reopen. */
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
    svg.appendChild(
      el("ellipse", { cx: "36", cy: "70", rx: "16", ry: "3", fill: "rgba(0,0,0,0.12)" }),
    );

    // Body (below the head circle)
    svg.appendChild(el("rect", { x: "24", y: "44", width: "24", height: "13", rx: "7", fill: c }));

    // Legs
    svg.appendChild(
      el("rect", { x: "25", y: "55", width: "8", height: "9", rx: "4", fill: "#374151" }),
    );
    svg.appendChild(
      el("rect", { x: "39", y: "55", width: "8", height: "9", rx: "4", fill: "#374151" }),
    );

    // ── HEAD (animated Pac-Man path) ──────────────────────────────
    // Starts in logo shape — 90° quarter removed from the right side.
    // Eyes are inside the remaining 270° arc (upper-left quadrant area).
    const headPath = el("path", { d: PATH_OPEN, fill: c }) as SVGPathElement;
    svg.appendChild(headPath);
    this.headPath = headPath;

    // Eye scleras (white circles — behind irises)
    svg.appendChild(el("circle", { cx: "24", cy: "21", r: "4.5", fill: "white" }));
    svg.appendChild(el("circle", { cx: "30", cy: "13", r: "4.5", fill: "white" }));

    // Irises (dark ellipses — ry animated for blinking)
    const eyeL = el("ellipse", {
      cx: "24",
      cy: "21",
      rx: "3",
      ry: "3",
      fill: "#1f2937",
    }) as SVGEllipseElement;
    svg.appendChild(eyeL);
    this.eyeL = eyeL;

    const eyeR = el("ellipse", {
      cx: "30",
      cy: "14",
      rx: "3",
      ry: "3",
      fill: "#1f2937",
    }) as SVGEllipseElement;
    svg.appendChild(eyeR);
    this.eyeR = eyeR;

    // Eye shines
    const shineL = el("circle", {
      cx: "25.5",
      cy: "19.5",
      r: "1.2",
      fill: "white",
    }) as SVGCircleElement;
    svg.appendChild(shineL);
    this.eyeShineL = shineL;

    const shineR = el("circle", {
      cx: "31.5",
      cy: "12.5",
      r: "1.2",
      fill: "white",
    }) as SVGCircleElement;
    svg.appendChild(shineR);
    this.eyeShineR = shineR;

    return svg;
  }

  /** Chomp animation: alternate between PATH_OPEN and PATH_MEDIUM. */
  private startChomp(): void {
    if (this.chompTimer) return;
    this.chompTimer = setInterval(() => {
      if (!this.headPath) return;
      this.chompOpen = !this.chompOpen;
      this.headPath.setAttribute("d", this.chompOpen ? PATH_OPEN : PATH_MEDIUM);
    }, 180);
  }

  private stopChomp(): void {
    if (this.chompTimer) {
      clearInterval(this.chompTimer);
      this.chompTimer = null;
    }
    // Return to logo shape
    this.headPath?.setAttribute("d", PATH_OPEN);
    this.chompOpen = false;
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
