export type CharacterState = "idle" | "walking" | "talking" | "thinking" | "celebrating";
export interface CharacterRenderer {
    mount(container: HTMLElement): void;
    setState(state: CharacterState): void;
    destroy(): void;
}
export type IdlePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
/**
 * Controls how the Enable / Disable Guide toggle is presented.
 *
 * - "below"        — pill always visible directly below the character
 * - "hover"        — pill fades in when the user hovers the character (default)
 * - "badge"        — small icon-only circle pinned to the top-right of the character
 * - "corner-chip"  — separate fixed pill anchored to the same viewport corner as idlePosition
 * - "context-menu" — no persistent UI; right-click the character to open a tiny menu
 */
export type ToggleStyle = "below" | "hover" | "badge" | "corner-chip" | "context-menu";
export interface TMRGuideConfig {
    /** Endpoint to call for AI responses. e.g. '/api/onboarding/assist' */
    apiEndpoint: string;
    userId?: string;
    emailId?: string;
    theme?: {
        primaryColor?: string;
        characterSize?: number;
    };
    /** Corner the character rests in when idle or disabled. Default: 'bottom-right' */
    idlePosition?: IdlePosition;
    /** Horizontal offset (px) from the corner edge. Default: 24 */
    idlePositionOffsetX?: number;
    /** Vertical offset (px) from the corner edge. Default: 50 */
    idlePositionOffsetY?: number;
    /** UI style for the enable/disable toggle. Default: 'hover' */
    toggleStyle?: ToggleStyle;
    onStepChange?: (stepId: string) => void;
    onAskQuestion?: (text: string) => void;
    onDismiss?: () => void;
}
export interface ShowOptions {
    /** Step ID sent to AI as context */
    stepId: string;
    /** What the character says */
    message: string;
    /** CSS selector of element to highlight. Omit for no spotlight. */
    target?: string;
    /** Which side of the target the character stands on */
    position?: "left" | "right" | "top" | "bottom";
    /** Extra context passed to AI */
    context?: Record<string, unknown>;
    /** Show Q&A input in the bubble */
    showInput?: boolean;
}
export interface TourStep extends ShowOptions {
    /** CSS selector — auto-advance when this element receives a click or change event */
    waitFor?: string;
}
export interface AIRequest {
    question?: string;
    trigger: "idle" | "error" | "user_question";
    /** sessionId and userId are merged into context before sending */
    context: Record<string, unknown>;
    history?: {
        role: "user" | "assistant";
        content: string;
    }[];
}
export interface AIResponse {
    message: string;
    followUps?: string[];
    sources?: {
        title: string;
        url: string;
    }[];
}
