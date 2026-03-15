import type { AIRequest, AIResponse } from "../types";
export declare class AIManager {
    private readonly apiEndpoint;
    private readonly userId?;
    private sessionId;
    private history;
    constructor(apiEndpoint: string, userId?: string | undefined);
    ask(question: string, context: Record<string, unknown>, trigger?: AIRequest["trigger"]): Promise<AIResponse>;
    /** Trigger an idle or error prompt (no user text) */
    prompt(trigger: "idle" | "error", context: Record<string, unknown>): Promise<AIResponse>;
    resetSession(): void;
}
