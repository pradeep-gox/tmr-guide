export declare class SpotlightManager {
    private overlay;
    private ring;
    private svg;
    private mask;
    private resizeObs;
    private scrollHandler;
    private currentTarget;
    init(root: HTMLElement): void;
    show(targetSelector: string, primaryColor?: string): void;
    hide(): void;
    destroy(): void;
    private updatePosition;
    private setHoleRect;
    private startTracking;
    private stopTracking;
}
