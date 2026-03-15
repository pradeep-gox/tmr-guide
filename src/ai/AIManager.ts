import type { AIRequest, AIResponse } from "../types";

const FALLBACK_MSG =
  "I'm having trouble connecting right now. You can reach our support team via the chat bubble in the corner.";

export class AIManager {
  private sessionId: string;
  private history: { role: "user" | "assistant"; content: string }[] = [];

  constructor(
    private readonly apiEndpoint: string,
    private readonly userId?: string,
  ) {
    this.sessionId = crypto.randomUUID();
  }

  async ask(
    question: string,
    context: Record<string, unknown>,
    trigger: AIRequest["trigger"] = "user_question",
  ): Promise<AIResponse> {
    // Keep last 6 exchanges (12 messages)
    const history = this.history.slice(-12);

    // sessionId and userId go inside context — matches the format Maya expects
    const body: AIRequest = {
      question,
      trigger,
      context: {
        ...context,
        sessionId: this.sessionId,
        userId: this.userId ?? "",
      },
      history,
    };

    try {
      const res = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AIResponse = await res.json();

      // Record in history
      this.history.push({ role: "user", content: question });
      this.history.push({ role: "assistant", content: data.message });

      return data;
    } catch {
      return { message: FALLBACK_MSG };
    }
  }

  /** Trigger an idle or error prompt (no user text) */
  async prompt(
    trigger: "idle" | "error",
    context: Record<string, unknown>,
  ): Promise<AIResponse> {
    return this.ask("", context, trigger);
  }

  resetSession(): void {
    this.sessionId = crypto.randomUUID();
    this.history = [];
  }
}
