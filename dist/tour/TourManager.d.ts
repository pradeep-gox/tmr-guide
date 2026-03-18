import type { TourStep } from "../types";
export type TourAdvanceFn = (step: TourStep) => void;
export declare class TourManager {
  private steps;
  private index;
  private advanceFn;
  private waitListeners;
  load(steps: TourStep[], advanceFn: TourAdvanceFn): void;
  start(): void;
  next(): void;
  prev(): void;
  isActive(): boolean;
  current(): TourStep | null;
  destroy(): void;
  private goTo;
  private removeWaitListeners;
}
