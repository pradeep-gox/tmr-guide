export type BubbleOnAsk = (text: string) => void;
export type BubbleOnDismiss = () => void;
export declare class BubbleManager {
    private bubble;
    private scrollEl;
    private textEl;
    private followupsEl;
    private inputRow;
    private inputEl;
    private typingEl;
    private typeTimer;
    private onAsk;
    private onDismiss;
    /** Called after typewriter finishes so the host can re-clamp position */
    private repositionFn;
    init(root: HTMLElement, onAsk: BubbleOnAsk, onDismiss: BubbleOnDismiss): void;
    /**
     * Register a callback invoked after the typewriter finishes.
     * Use this to re-clamp the bubble position once its final height is known.
     */
    setRepositionFn(fn: () => void): void;
    /**
     * Position the bubble so its tail aligns near the character's mouth.
     * charY is the character's top edge; mouthOffsetY is how far down the
     * mouth sits within the character (default: ~42% from top — mouth y=30 of 72 viewBox).
     */
    positionNear(charX: number, charY: number, mouthOffsetY?: number): void;
    show(message: string, showInput?: boolean, followUps?: string[]): void;
    showLoading(): void;
    showResponse(message: string, followUps?: string[]): void;
    hide(): void;
    destroy(): void;
    private typeText;
    private clearTypewriter;
    private markdownLite;
    private renderFollowUps;
    private submitInput;
}
