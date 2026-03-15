import type { AIResponse } from "../types";

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

  /**
   * Ask Maya a question.
   * `context` should contain a `subscriptionContext` string key built by the
   * host application (e.g. buildSystemContext() in tmr_platform).
   */
  async ask(
    message: string,
    context: Record<string, unknown>,
  ): Promise<AIResponse> {
    const history = this.history.slice(-12);

    const body = {
      sessionId: this.sessionId,
      userId: this.userId ?? null,
      message,
      history,
      subscriptionContext:
        typeof context.subscriptionContext === "string"
          ? context.subscriptionContext
          : undefined,
    };

    try {
      const res = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Maya returns { response: string }
      const replyText: string = data.response ?? data.message ?? "";

      this.history.push({ role: "user", content: message });
      this.history.push({ role: "assistant", content: replyText });

      return { message: replyText };
    } catch {
      return { message: FALLBACK_MSG };
    }
  }

  resetSession(): void {
    this.sessionId = crypto.randomUUID();
    this.history = [];
  }
}
