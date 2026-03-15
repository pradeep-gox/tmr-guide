export type BubbleOnAsk = (text: string) => void;
export type BubbleOnDismiss = () => void;
export declare class BubbleManager {
    private bubble;
    private textEl;
    private followupsEl;
    private inputRow;
    private inputEl;
    private typingEl;
    private typeTimer;
    private onAsk;
    private onDismiss;
    init(root: HTMLElement, onAsk: BubbleOnAsk, onDismiss: BubbleOnDismiss): void;
    /** Position the bubble relative to character coords */
    positionNear(charX: number, charY: number): void;
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
