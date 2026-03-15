import { injectCSS } from "../utils/dom";
import { BUBBLE_CSS } from "./styles";
import { computeBubbleSide } from "../utils/position";
import { prefersReducedMotion } from "../utils/dom";

const BUBBLE_WIDTH = 260;
const TYPEWRITER_INTERVAL = 18; // ms per character
const CHAR_SIZE = 72;

export type BubbleOnAsk = (text: string) => void;
export type BubbleOnDismiss = () => void;

export class BubbleManager {
  private bubble: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;
  private followupsEl: HTMLElement | null = null;
  private inputRow: HTMLElement | null = null;
  private inputEl: HTMLTextAreaElement | null = null;
  private typingEl: HTMLElement | null = null;
  private typeTimer: ReturnType<typeof setTimeout> | null = null;
  private onAsk: BubbleOnAsk | null = null;
  private onDismiss: BubbleOnDismiss | null = null;

  init(root: HTMLElement, onAsk: BubbleOnAsk, onDismiss: BubbleOnDismiss): void {
    injectCSS("tmrg-bubble-css", BUBBLE_CSS);
    this.onAsk = onAsk;
    this.onDismiss = onDismiss;

    const bubble = document.createElement("div");
    bubble.className = "tmrg-bubble";
    bubble.setAttribute("data-side", "right");

    // Dismiss button
    const dismiss = document.createElement("button");
    dismiss.className = "tmrg-bubble-dismiss";
    dismiss.innerHTML = "×";
    dismiss.title = "Dismiss";
    dismiss.addEventListener("click", () => onDismiss());
    bubble.appendChild(dismiss);

    // Text content
    const textEl = document.createElement("p");
    textEl.className = "tmrg-bubble-text";
    bubble.appendChild(textEl);
    this.textEl = textEl;

    // Typing indicator (shown while AI loading)
    const typingEl = document.createElement("div");
    typingEl.className = "tmrg-typing";
    typingEl.innerHTML = "<span></span><span></span><span></span>";
    typingEl.style.display = "none";
    bubble.appendChild(typingEl);
    this.typingEl = typingEl;

    // Follow-up chips
    const followupsEl = document.createElement("div");
    followupsEl.className = "tmrg-followups";
    bubble.appendChild(followupsEl);
    this.followupsEl = followupsEl;

    // Q&A input row (hidden by default)
    const inputRow = document.createElement("div");
    inputRow.className = "tmrg-bubble-input-row";
    inputRow.style.display = "none";

    const input = document.createElement("textarea");
    input.className = "tmrg-bubble-input";
    input.rows = 1;
    input.placeholder = "Ask me anything…";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.submitInput();
      }
    });
    input.addEventListener("input", () => {
      // Auto-grow
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 80)}px`;
      sendBtn.disabled = input.value.trim().length === 0;
    });
    this.inputEl = input;

    const sendBtn = document.createElement("button");
    sendBtn.className = "tmrg-bubble-send";
    sendBtn.disabled = true;
    sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    sendBtn.addEventListener("click", () => this.submitInput());

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);
    bubble.appendChild(inputRow);
    this.inputRow = inputRow;

    root.appendChild(bubble);
    this.bubble = bubble;
  }

  /** Position the bubble relative to character coords */
  positionNear(charX: number, charY: number): void {
    if (!this.bubble) return;
    const side = computeBubbleSide(charX, CHAR_SIZE, BUBBLE_WIDTH);
    this.bubble.setAttribute("data-side", side);

    const bh = this.bubble.offsetHeight;
    const vh = window.innerHeight;

    let left: number;
    let top: number;

    if (side === "right") {
      left = charX + CHAR_SIZE + 12;
    } else {
      left = charX - BUBBLE_WIDTH - 12;
    }
    top = charY + CHAR_SIZE / 2 - Math.min(bh / 2, 60);
    top = Math.max(12, Math.min(vh - bh - 12, top));

    this.bubble.style.left = `${left}px`;
    this.bubble.style.top = `${top}px`;
  }

  show(message: string, showInput = false, followUps: string[] = []): void {
    if (!this.bubble) return;
    this.clearTypewriter();
    this.typingEl!.style.display = "none";
    this.followupsEl!.innerHTML = "";
    this.inputRow!.style.display = showInput ? "flex" : "none";

    this.typeText(message, () => {
      this.renderFollowUps(followUps);
    });

    this.bubble.classList.add("visible");
  }

  showLoading(): void {
    if (!this.bubble) return;
    this.clearTypewriter();
    this.textEl!.innerHTML = "";
    this.followupsEl!.innerHTML = "";
    this.typingEl!.style.display = "flex";
    this.bubble.classList.add("visible");
  }

  showResponse(message: string, followUps: string[] = []): void {
    if (!this.bubble) return;
    this.typingEl!.style.display = "none";
    this.typeText(message, () => {
      this.renderFollowUps(followUps);
    });
  }

  hide(): void {
    this.clearTypewriter();
    this.bubble?.classList.remove("visible");
  }

  destroy(): void {
    this.clearTypewriter();
    this.bubble?.remove();
    this.bubble = null;
    this.textEl = null;
    this.typingEl = null;
    this.followupsEl = null;
    this.inputRow = null;
    this.inputEl = null;
  }

  // ─── private ───────────────────────────────────────────────────

  private typeText(text: string, onDone?: () => void): void {
    if (!this.textEl) return;
    const html = this.markdownLite(text);

    if (prefersReducedMotion()) {
      this.textEl.innerHTML = html;
      onDone?.();
      return;
    }

    // Typewriter over plain text, then inject HTML at end
    const plain = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    let i = 0;
    this.textEl.textContent = "";

    const tick = () => {
      if (i < plain.length) {
        this.textEl!.textContent += plain[i++];
        this.typeTimer = setTimeout(tick, TYPEWRITER_INTERVAL);
      } else {
        // Replace plain text with rich HTML once done
        this.textEl!.innerHTML = html;
        onDone?.();
      }
    };
    tick();
  }

  private clearTypewriter(): void {
    if (this.typeTimer) {
      clearTimeout(this.typeTimer);
      this.typeTimer = null;
    }
  }

  private markdownLite(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, "<br>");
  }

  private renderFollowUps(followUps: string[]): void {
    if (!this.followupsEl || followUps.length === 0) return;
    for (const fu of followUps) {
      const chip = document.createElement("button");
      chip.className = "tmrg-chip";
      chip.textContent = fu;
      chip.addEventListener("click", () => {
        if (this.inputEl) {
          this.inputEl.value = fu;
          this.inputRow!.style.display = "flex";
        }
        this.onAsk?.(fu);
        this.followupsEl!.innerHTML = "";
      });
      this.followupsEl.appendChild(chip);
    }
  }

  private submitInput(): void {
    const text = this.inputEl?.value.trim();
    if (!text) return;
    this.onAsk?.(text);
    this.inputEl!.value = "";
    this.inputEl!.style.height = "auto";
    (this.bubble!.querySelector(".tmrg-bubble-send") as HTMLButtonElement).disabled = true;
  }
}
