import type { AIResponse } from "../types";
export declare class AIManager {
    private readonly apiEndpoint;
    private apiKey;
    private readonly userId?;
    private readonly emailId?;
    private sessionId;
    private history;
    constructor(apiEndpoint: string, apiKey: string, userId?: string | undefined, emailId?: string | undefined);
    updateApiKey(apiKey: string): void;
    /**
     * Ask TMR AI Assistant a question.
     * Automatically times out after 20 seconds and returns a friendly fallback.
     */
    ask(message: string, context: Record<string, unknown>): Promise<AIResponse>;
    resetSession(): void;
}
