export type BubbleOnAsk = (text: string) => void;
export type BubbleOnDismiss = () => void;
export type BubbleOnFeedback = (rating: "up" | "down", question: string) => void;
export declare class BubbleManager {
    private bubble;
    private scrollEl;
    private textEl;
    private followupsEl;
    private feedbackEl;
    private sourcesEl;
    private inputRow;
    private inputEl;
    private typingEl;
    private typeTimer;
    private onAsk;
    private onDismiss;
    private onFeedback;
    /** Called after typewriter finishes so the host can re-clamp position */
    private repositionFn;
    /** Last user question — stored so feedback can report it */
    private lastQuestion;
    init(root: HTMLElement, onAsk: BubbleOnAsk, onDismiss: BubbleOnDismiss, onFeedback?: BubbleOnFeedback): void;
    setRepositionFn(fn: () => void): void;
    /**
     * Position the bubble so its tail aligns near the character's mouth.
     */
    positionNear(charX: number, charY: number, mouthOffsetY?: number): void;
    show(message: string, showInput?: boolean, followUps?: string[]): void;
    showLoading(): void;
    showResponse(message: string, followUps?: string[], sources?: {
        title: string;
        url: string;
    }[]): void;
    hide(): void;
    destroy(): void;
    private typeText;
    private clearTypewriter;
    /**
     * Lightweight Markdown → HTML converter.
     * Supports: **bold**, *italic*, `code`, [links](url), - lists, line breaks.
     */
    private markdownToHtml;
    private inlineMarkdown;
    private renderFollowUps;
    private renderSources;
    private clearSources;
    private renderFeedback;
    private clearFeedback;
    private submitInput;
}
