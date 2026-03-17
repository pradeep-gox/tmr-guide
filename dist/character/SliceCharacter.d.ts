import type { CharacterRenderer } from "./CharacterRenderer";
import type { CharacterState } from "../types";
export declare class SliceCharacter implements CharacterRenderer {
    private readonly size;
    private readonly primaryColor;
    private container;
    private inner;
    private svg;
    private headPath;
    private eyeL;
    private eyeR;
    private eyeShineL;
    private eyeShineR;
    private blinkTimer;
    private chompTimer;
    private chompOpen;
    constructor(size?: number, primaryColor?: string);
    mount(container: HTMLElement): void;
    setState(state: CharacterState): void;
    destroy(): void;
    private scheduleBlink;
    /** Close the irises (ry → 0.6) for 120ms then reopen. */
    private blink;
    private buildSVG;
    /** Chomp animation: alternate between PATH_OPEN and PATH_MEDIUM. */
    private startChomp;
    private stopChomp;
    private spawnSparkles;
}
