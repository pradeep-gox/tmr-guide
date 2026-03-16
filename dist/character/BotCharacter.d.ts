import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";
export declare class BotCharacter implements CharacterRenderer {
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
    constructor(size?: number, primaryColor?: string);
    mount(container: HTMLElement): void;
    setState(state: CharacterState): void;
    destroy(): void;
    /** Schedule the next blink at a random interval (2.5s – 6s). */
    private scheduleBlink;
    /**
     * Quick blink: squish ry to near-zero for 120ms then restore.
     * Also hide the shine dot so it doesn't float in mid-air.
     */
    private blink;
    private buildSVG;
    private mouthTimer;
    private mouthOpen;
    private startMouthAnim;
    private stopMouthAnim;
    private spawnSparkles;
}
