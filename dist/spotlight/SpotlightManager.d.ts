import type { HighlightMode } from "../types";
export interface SpotlightOptions {
    mode?: HighlightMode;
    color?: string;
    ringWidth?: number;
    fadeDuration?: number;
}
export declare class SpotlightManager {
    private overlay;
    private ring;
    private svg;
    private mask;
    private resizeObs;
    private scrollHandler;
    private currentTarget;
    private fadeTimer;
    init(root: HTMLElement): void;
    show(targetSelector: string, opts?: SpotlightOptions): void;
    hide(): void;
    destroy(): void;
    private fadeOut;
    private clearFadeTimer;
    private updatePosition;
    private setHoleRect;
    private startTracking;
    private stopTracking;
}
