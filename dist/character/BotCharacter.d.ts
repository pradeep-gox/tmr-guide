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
    constructor(size?: number, primaryColor?: string);
    mount(container: HTMLElement): void;
    setState(state: CharacterState): void;
    destroy(): void;
    private buildSVG;
    private mouthTimer;
    private mouthOpen;
    private startMouthAnim;
    private stopMouthAnim;
    private spawnSparkles;
}
