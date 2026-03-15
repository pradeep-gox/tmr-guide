import type { AIResponse } from "../types";
export declare class AIManager {
    private readonly apiEndpoint;
    private readonly userId?;
    private sessionId;
    private history;
    constructor(apiEndpoint: string, userId?: string | undefined);
    /**
     * Ask Maya a question.
     * `context` should contain a `subscriptionContext` string key built by the
     * host application (e.g. buildSystemContext() in tmr_platform).
     */
    ask(message: string, context: Record<string, unknown>): Promise<AIResponse>;
    resetSession(): void;
}
