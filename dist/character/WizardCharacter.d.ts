import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";
export declare class WizardCharacter implements CharacterRenderer {
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
    private blinkTimer;
    private mouthTimer;
    private mouthOpen;
    constructor(size?: number, primaryColor?: string);
    mount(container: HTMLElement): void;
    setState(state: CharacterState): void;
    destroy(): void;
    private scheduleBlink;
    private blink;
    private buildSVG;
    private startMouthAnim;
    private stopMouthAnim;
    private spawnSparkles;
}
