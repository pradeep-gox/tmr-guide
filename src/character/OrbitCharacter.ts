import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";

const SPARKLE_COLORS = ["#ff6700", "#ffd700", "#ff4fa3", "#4fc3f7"];

// Orbit center matches the head circle center
const OX = 36;
const OY = 33;

export class OrbitCharacter implements CharacterRenderer {
  private container: HTMLElement | null = null;
  private inner: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private mouthEl: SVGRectElement | null = null;
  private eyeL: SVGEllipseElement | null = null;
  private eyeR: SVGEllipseElement | null = null;
  private eyeShineL: SVGCircleElement | null = null;
  private eyeShineR: SVGCircleElement | null = null;
  // Orbiting satellite circles
  private sat1: SVGCircleElement | null = null;
  private sat2: SVGCircleElement | null = null;
  private sat3: SVGCircleElement | null = null;

  private blinkTimer: ReturnType<typeof setTimeout> | null = null;
  private mouthTimer: ReturnType<typeof setInterval> | null = null;
  private mouthOpen = false;
  private rafId: number | null = null;
  private orbitAngle = 0;
  private orbitSpeed = 0.8; // degrees per rAF tick (~60fps → ~7.5s/rev)

  constructor(
    private readonly size: number = 72,
    private readonly primaryColor: string = "#ff6700",
  ) {}

  mount(container: HTMLElement): void {
    this.container = container;
    const inner = document.createElement("div");
    inner.className = "tmrg-char-inner";
    // overflow:visible so satellites can orbit slightly outside the 72×72 box
    inner.style.cssText = `display:inline-block;position:relative;overflow:visible;`;
    inner.appendChild(this.buildSVG());
    container.appendChild(inner);
    this.inner = inner;
    this.scheduleBlink();
    this.startOrbit();
  }

  setState(state: CharacterState): void {
    if (!this.container) return;
    this.container.dataset.state = state;

    if (state === "thinking") {
      this.eyeL?.setAttribute("cy", "29");
      this.eyeR?.setAttribute("cy", "29");
      this.orbitSpeed = 0.2; // satellites slow — contemplative
    } else {
      this.eyeL?.setAttribute("cy", "31");
      this.eyeR?.setAttribute("cy", "31");
      if (state === "celebrating") this.orbitSpeed = 4.0;
      else if (state === "talking") this.orbitSpeed = 1.4;
      else this.orbitSpeed = 0.8;
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
    this.stopOrbit();
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
    this.sat1 = null;
    this.sat2 = null;
    this.sat3 = null;
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

  /** rAF loop — moves satellite circles continuously. */
  private startOrbit(): void {
    const tick = () => {
      this.orbitAngle = (this.orbitAngle + this.orbitSpeed) % 360;
      this.updateSatellites();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopOrbit(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateSatellites(): void {
    const deg = (this.orbitAngle * Math.PI) / 180;
    if (this.sat1) {
      this.sat1.setAttribute("cx", String(OX + 23 * Math.cos(deg)));
      this.sat1.setAttribute("cy", String(OY + 23 * Math.sin(deg)));
    }
    if (this.sat2) {
      const a2 = ((this.orbitAngle * 0.7 + 120) * Math.PI) / 180;
      this.sat2.setAttribute("cx", String(OX + 31 * Math.cos(a2)));
      this.sat2.setAttribute("cy", String(OY + 31 * Math.sin(a2)));
    }
    if (this.sat3) {
      const a3 = ((this.orbitAngle * 0.5 + 240) * Math.PI) / 180;
      this.sat3.setAttribute("cx", String(OX + 38 * Math.cos(a3)));
      this.sat3.setAttribute("cy", String(OY + 38 * Math.sin(a3)));
    }
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
    svg.setAttribute("overflow", "visible"); // satellites orbit outside viewBox
    svg.setAttribute("xmlns", ns);
    this.svg = svg;

    const el = (tag: string, attrs: Record<string, string>) => {
      const e = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      return e;
    };

    // Shadow
    svg.appendChild(
      el("ellipse", { cx: "36", cy: "70", rx: "18", ry: "3", fill: "rgba(0,0,0,0.12)" }),
    );

    // ── Satellites (drawn first — behind the head) ─────────────────
    // Initial positions placed on the orbit radii; rAF will move them.
    const sat1 = el("circle", {
      cx: String(OX + 23),
      cy: String(OY),
      r: "4",
      fill: c,
    }) as SVGCircleElement;
    svg.appendChild(sat1);
    this.sat1 = sat1;

    const sat2 = el("circle", {
      cx: String(OX - 15),
      cy: String(OY - 27),
      r: "3",
      fill: c,
      opacity: "0.8",
    }) as SVGCircleElement;
    svg.appendChild(sat2);
    this.sat2 = sat2;

    const sat3 = el("circle", {
      cx: String(OX - 19),
      cy: String(OY + 33),
      r: "2.5",
      fill: c,
      opacity: "0.65",
    }) as SVGCircleElement;
    svg.appendChild(sat3);
    this.sat3 = sat3;

    // ── Head (planet body) ─────────────────────────────────────────
    svg.appendChild(el("circle", { cx: "36", cy: "33", r: "20", fill: "#1f2937" }));

    // Subtle equatorial band
    svg.appendChild(
      el("ellipse", {
        cx: "36",
        cy: "33",
        rx: "20",
        ry: "5",
        fill: "none",
        stroke: c,
        "stroke-width": "1.2",
        opacity: "0.25",
      }),
    );

    // Eyes (primary color, blink-animated)
    const eyeL = el("ellipse", {
      cx: "28",
      cy: "31",
      rx: "4",
      ry: "4",
      fill: c,
    }) as SVGEllipseElement;
    svg.appendChild(eyeL);
    this.eyeL = eyeL;

    const eyeR = el("ellipse", {
      cx: "44",
      cy: "31",
      rx: "4",
      ry: "4",
      fill: c,
    }) as SVGEllipseElement;
    svg.appendChild(eyeR);
    this.eyeR = eyeR;

    // Eye shines
    const shineL = el("circle", {
      cx: "30",
      cy: "29",
      r: "1.5",
      fill: "white",
    }) as SVGCircleElement;
    svg.appendChild(shineL);
    this.eyeShineL = shineL;

    const shineR = el("circle", {
      cx: "46",
      cy: "29",
      r: "1.5",
      fill: "white",
    }) as SVGCircleElement;
    svg.appendChild(shineR);
    this.eyeShineR = shineR;

    // Mouth (mouthEl)
    const mouth = el("rect", {
      x: "28",
      y: "38",
      width: "16",
      height: "4",
      rx: "2",
      fill: c,
      opacity: "0.55",
    }) as SVGRectElement;
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
      this.mouthEl.setAttribute("y", this.mouthOpen ? "36" : "38");
    }, 180);
  }

  private stopMouthAnim(): void {
    if (this.mouthTimer) {
      clearInterval(this.mouthTimer);
      this.mouthTimer = null;
    }
    if (this.mouthEl) {
      this.mouthEl.setAttribute("height", "4");
      this.mouthEl.setAttribute("y", "38");
    }
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
