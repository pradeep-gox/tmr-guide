import type { AIResponse } from "../types";

const FALLBACK_MSG =
  "I'm having trouble connecting right now. You can reach our support team via the chat bubble in the corner.";

const TIMEOUT_MS = 20_000; // 20 seconds

export class AIManager {
  private sessionId: string;
  private history: { role: "user" | "assistant"; content: string }[] = [];

  constructor(
    private readonly apiEndpoint: string,
    private readonly userId?: string,
    private readonly emailId?: string,
  ) {
    this.sessionId = crypto.randomUUID();
  }

  /**
   * Ask TMR AI Assistant a question.
   * Automatically times out after 20 seconds and returns a friendly fallback.
   */
  async ask(
    message: string,
    context: Record<string, unknown>,
  ): Promise<AIResponse> {
    const history = this.history.slice(-12);

    const body = {
      sessionId: this.sessionId,
      userId: this.userId ?? null,
      emailId: this.emailId ?? null,
      message,
      history,
      subscriptionContext:
        typeof context.subscriptionContext === "string"
          ? context.subscriptionContext
          : undefined,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const replyText: string = data.response ?? data.message ?? "";
      const followUps: string[] = Array.isArray(data.followUps)
        ? data.followUps
        : [];
      const sources: { title: string; url: string }[] = Array.isArray(
        data.sources,
      )
        ? data.sources
        : [];

      this.history.push({ role: "user", content: message });
      this.history.push({ role: "assistant", content: replyText });

      return { message: replyText, followUps, sources };
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout =
        err instanceof DOMException && err.name === "AbortError";
      return {
        message: isTimeout
          ? "That took too long — please try again in a moment."
          : FALLBACK_MSG,
      };
    }
  }

  resetSession(): void {
    this.sessionId = crypto.randomUUID();
    this.history = [];
  }
}
