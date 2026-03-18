import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";
export declare class OrbitCharacter implements CharacterRenderer {
  private readonly size;
  private readonly primaryColor;
  private container;
  private inner;
  private svg;
  private mouthEl;
  private eyeL;
  private eyeR;
  private eyeShineL;
  private eyeShineR;
  private sat1;
  private sat2;
  private sat3;
  private blinkTimer;
  private mouthTimer;
  private mouthOpen;
  private rafId;
  private orbitAngle;
  private orbitSpeed;
  constructor(size?: number, primaryColor?: string);
  mount(container: HTMLElement): void;
  setState(state: CharacterState): void;
  destroy(): void;
  private scheduleBlink;
  private blink;
  /** rAF loop — moves satellite circles continuously. */
  private startOrbit;
  private stopOrbit;
  private updateSatellites;
  private buildSVG;
  private startMouthAnim;
  private stopMouthAnim;
  private spawnSparkles;
}
