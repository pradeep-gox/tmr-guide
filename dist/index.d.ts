import type { TMRGuideConfig, ShowOptions, TourStep, CharacterRenderer } from "./types";
declare class TMRGuideSDK {
    private config;
    private root;
    private charContainer;
    private character;
    private spotlight;
    private bubble;
    private ai;
    private tourMgr;
    private currentOptions;
    private charX;
    private charY;
    private charSize;
    private isVisible;
    private enabled;
    private toggleBtn;
    private contextMenu;
    private resizeHandler;
    private resizeDebounce;
    private readonly STORAGE_KEY;
    init(config: TMRGuideConfig): void;
    show(options: ShowOptions): void;
    hide(): void;
    /** Run a multi-step guided tour */
    tour(steps: TourStep[]): void;
    next(): void;
    prev(): void;
    /** Send a user question to AI and show the response in the bubble */
    ask(text: string): Promise<void>;
    /** Celebrate a milestone (character jumps, optional message in bubble) */
    celebrate(message?: string): void;
    /** Enable the guide — resumes guidance from the current step */
    enable(): void;
    /** Disable the guide — character idles in the corner; progress is still tracked */
    disable(): void;
    /** Replace the default bot character with a custom renderer */
    setCharacter(renderer: CharacterRenderer): void;
    destroy(): void;
    private handleResize;
    private applyCharPosition;
    private cornerPosition;
    private moveToCorner;
    private renderToggleBtn;
    private updateToggleBtn;
    private positionCornerChip;
    private setupContextMenu;
    private showContextMenu;
    private assertInit;
}
export declare const TMRGuide: TMRGuideSDK;
export type { TMRGuideConfig, ShowOptions, TourStep, CharacterRenderer, IdlePosition, ToggleStyle, HighlightMode, } from "./types";
