import type { TourStep } from "../types";

export type TourAdvanceFn = (step: TourStep) => void;

export class TourManager {
  private steps: TourStep[] = [];
  private index = 0;
  private advanceFn: TourAdvanceFn | null = null;
  private waitListeners: Array<{ el: Element; fn: EventListener }> = [];

  load(steps: TourStep[], advanceFn: TourAdvanceFn): void {
    this.steps = steps;
    this.index = 0;
    this.advanceFn = advanceFn;
  }

  start(): void {
    this.goTo(0);
  }

  next(): void {
    this.removeWaitListeners();
    if (this.index < this.steps.length - 1) {
      this.goTo(this.index + 1);
    }
  }

  prev(): void {
    this.removeWaitListeners();
    if (this.index > 0) {
      this.goTo(this.index - 1);
    }
  }

  isActive(): boolean {
    return this.steps.length > 0;
  }

  current(): TourStep | null {
    return this.steps[this.index] ?? null;
  }

  destroy(): void {
    this.removeWaitListeners();
    this.steps = [];
    this.index = 0;
    this.advanceFn = null;
  }

  // ─── private ───────────────────────────────────────────────────

  private goTo(i: number): void {
    this.index = i;
    const step = this.steps[i];
    if (!step || !this.advanceFn) return;
    this.advanceFn(step);

    if (step.waitFor) {
      // Auto-advance when target receives click or change
      const el = document.querySelector(step.waitFor);
      if (el) {
        const fn: EventListener = () => {
          setTimeout(() => this.next(), 350); // small delay so user sees the interaction
        };
        el.addEventListener("click", fn, { once: true });
        el.addEventListener("change", fn, { once: true });
        this.waitListeners.push({ el, fn });
      }
    }
  }

  private removeWaitListeners(): void {
    for (const { el, fn } of this.waitListeners) {
      el.removeEventListener("click", fn);
      el.removeEventListener("change", fn);
    }
    this.waitListeners = [];
  }
}
