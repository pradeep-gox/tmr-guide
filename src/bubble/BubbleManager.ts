import { injectCSS } from "../utils/dom";
import { BUBBLE_CSS } from "./styles";
import { computeBubbleSide } from "../utils/position";
import { prefersReducedMotion } from "../utils/dom";

const BUBBLE_WIDTH = 260;
const TYPEWRITER_INTERVAL = 18; // ms per character
const CHAR_SIZE = 72;

export type BubbleOnAsk = (text: string) => void;
export type BubbleOnDismiss = () => void;
export type BubbleOnFeedback = (rating: "up" | "down", question: string) => void;

export class BubbleManager {
  private bubble: HTMLElement | null = null;
  private scrollEl: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;
  private followupsEl: HTMLElement | null = null;
  private feedbackEl: HTMLElement | null = null;
  private sourcesEl: HTMLElement | null = null;
  private inputRow: HTMLElement | null = null;
  private inputEl: HTMLTextAreaElement | null = null;
  private typingEl: HTMLElement | null = null;
  private typeTimer: ReturnType<typeof setTimeout> | null = null;
  private onAsk: BubbleOnAsk | null = null;
  private onDismiss: BubbleOnDismiss | null = null;
  private onFeedback: BubbleOnFeedback | null = null;
  private onNext: (() => void) | null = null;
  private navEl: HTMLElement | null = null;
  /** Called after typewriter finishes so the host can re-clamp position */
  private repositionFn: (() => void) | null = null;
  /** Center X of the current spotlighted target — used to place bubble on the open side */
  private targetCenterX: number | undefined = undefined;
  /** Last user question — stored so feedback can report it */
  private lastQuestion = "";

  init(
    root: HTMLElement,
    onAsk: BubbleOnAsk,
    onDismiss: BubbleOnDismiss,
    onFeedback?: BubbleOnFeedback,
  ): void {
    injectCSS("tmrg-bubble-css", BUBBLE_CSS);
    this.onAsk = onAsk;
    this.onDismiss = onDismiss;
    this.onFeedback = onFeedback ?? null;

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

    // Scrollable content area
    const scrollEl = document.createElement("div");
    scrollEl.className = "tmrg-bubble-scroll";
    bubble.appendChild(scrollEl);
    this.scrollEl = scrollEl;

    // Text content (inside scroll area)
    const textEl = document.createElement("p");
    textEl.className = "tmrg-bubble-text";
    scrollEl.appendChild(textEl);
    this.textEl = textEl;

    // Typing indicator (inside scroll area)
    const typingEl = document.createElement("div");
    typingEl.className = "tmrg-typing";
    typingEl.innerHTML = "<span></span><span></span><span></span>";
    typingEl.style.display = "none";
    scrollEl.appendChild(typingEl);
    this.typingEl = typingEl;

    // Source citations (outside scroll, pinned below text)
    const sourcesEl = document.createElement("div");
    sourcesEl.className = "tmrg-sources";
    sourcesEl.style.display = "none";
    bubble.appendChild(sourcesEl);
    this.sourcesEl = sourcesEl;

    // Feedback row (outside scroll, shown after AI responses)
    const feedbackEl = document.createElement("div");
    feedbackEl.className = "tmrg-feedback";
    feedbackEl.style.display = "none";
    bubble.appendChild(feedbackEl);
    this.feedbackEl = feedbackEl;

    // Follow-up chips (outside scroll)
    const followupsEl = document.createElement("div");
    followupsEl.className = "tmrg-followups";
    bubble.appendChild(followupsEl);
    this.followupsEl = followupsEl;

    // Tour navigation row — "Next →" shown only during guided tours
    const navEl = document.createElement("div");
    navEl.className = "tmrg-tour-nav";
    navEl.style.display = "none";
    const navBtn = document.createElement("button");
    navBtn.className = "tmrg-tour-next";
    navBtn.innerHTML = `Next <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
    navBtn.addEventListener("click", () => this.onNext?.());
    navEl.appendChild(navBtn);
    bubble.appendChild(navEl);
    this.navEl = navEl;

    // Q&A input row (outside scroll)
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

  setRepositionFn(fn: () => void): void {
    this.repositionFn = fn;
  }

  /** Update the target element's center X so the bubble positions on the open side. */
  setTargetCenterX(x: number | undefined): void {
    this.targetCenterX = x;
  }

  /**
   * Set (or clear) the tour "Next →" button callback.
   * Pass a function to show the button; pass null to hide it.
   */
  setOnNext(fn: (() => void) | null): void {
    this.onNext = fn;
    if (this.navEl) this.navEl.style.display = fn ? "flex" : "none";
  }

  /**
   * Position the bubble so its tail aligns near the character's mouth.
   */
  positionNear(charX: number, charY: number, mouthOffsetY = CHAR_SIZE * 0.42): void {
    if (!this.bubble) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Determine which side has enough room — prefer the side away from the target
    const side = computeBubbleSide(charX, CHAR_SIZE, BUBBLE_WIDTH, this.targetCenterX);
    this.bubble.setAttribute("data-side", side);

    const bh = this.bubble.offsetHeight;
    const mouthY = charY + mouthOffsetY;

    let left: number;
    if (side === "right") {
      left = charX + CHAR_SIZE + 12;
    } else {
      left = charX - BUBBLE_WIDTH - 12;
    }

    // Clamp horizontally so the bubble never overflows the viewport on either side
    left = Math.max(8, Math.min(vw - BUBBLE_WIDTH - 8, left));

    const TAIL_BOTTOM_OFFSET = 18 + 7;
    let top = mouthY - (bh - TAIL_BOTTOM_OFFSET);
    top = Math.max(12, Math.min(vh - bh - 12, top));

    this.bubble.style.left = `${left}px`;
    this.bubble.style.top = `${top}px`;
  }

  show(message: string, showInput = false, followUps: string[] = []): void {
    if (!this.bubble) return;
    this.clearTypewriter();
    this.typingEl!.style.display = "none";
    this.followupsEl!.innerHTML = "";
    this.clearFeedback();
    this.clearSources();
    this.inputRow!.style.display = showInput ? "flex" : "none";

    this.typeText(message, () => {
      this.renderFollowUps(followUps);
      this.repositionFn?.();
      if (this.scrollEl) this.scrollEl.scrollTop = 0;
    });

    this.bubble.classList.add("visible");
  }

  showLoading(): void {
    if (!this.bubble) return;
    this.clearTypewriter();
    this.textEl!.innerHTML = "";
    this.followupsEl!.innerHTML = "";
    this.clearFeedback();
    this.clearSources();
    this.typingEl!.style.display = "flex";
    this.bubble.classList.add("visible");
  }

  showResponse(
    message: string,
    followUps: string[] = [],
    sources: { title: string; url: string }[] = [],
  ): void {
    if (!this.bubble) return;
    this.typingEl!.style.display = "none";
    this.clearFeedback();
    this.clearSources();

    this.typeText(message, () => {
      this.renderFollowUps(followUps);
      this.renderSources(sources);
      this.renderFeedback();
      this.repositionFn?.();
      if (this.scrollEl) this.scrollEl.scrollTop = 0;
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
    this.scrollEl = null;
    this.textEl = null;
    this.typingEl = null;
    this.followupsEl = null;
    this.feedbackEl = null;
    this.sourcesEl = null;
    this.navEl = null;
    this.inputRow = null;
    this.inputEl = null;
    this.repositionFn = null;
    this.onNext = null;
  }

  // ─── private ───────────────────────────────────────────────────

  private typeText(text: string, onDone?: () => void): void {
    if (!this.textEl) return;
    const html = this.markdownToHtml(text);

    if (prefersReducedMotion()) {
      this.textEl.innerHTML = html;
      onDone?.();
      return;
    }

    // Strip markdown for typewriter plain-text pass, then swap to rich HTML
    const plain = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^[-*]\s+/gm, "• ");
    let i = 0;
    this.textEl.textContent = "";

    const REPOSITION_EVERY = 30; // reposition every N chars to keep bubble in viewport while typing
    const tick = () => {
      if (i < plain.length) {
        this.textEl!.textContent += plain[i++];
        if (i % REPOSITION_EVERY === 0) this.repositionFn?.();
        this.typeTimer = setTimeout(tick, TYPEWRITER_INTERVAL);
      } else {
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

  /**
   * Lightweight Markdown → HTML converter.
   * Supports: **bold**, *italic*, `code`, [links](url), - lists, line breaks.
   */
  private markdownToHtml(text: string): string {
    const lines = text.split("\n");
    const out: string[] = [];
    let inList = false;

    for (const line of lines) {
      const listMatch = line.match(/^[-*]\s+(.+)/);
      if (listMatch) {
        if (!inList) {
          out.push("<ul>");
          inList = true;
        }
        out.push(`<li>${this.inlineMarkdown(listMatch[1])}</li>`);
      } else {
        if (inList) {
          out.push("</ul>");
          inList = false;
        }
        out.push(this.inlineMarkdown(line));
      }
    }
    if (inList) out.push("</ul>");

    // Join lines: don't put <br> around list tags
    return out
      .join("\n")
      .replace(/<\/ul>\n/g, "</ul>")
      .replace(/\n<ul>/g, "<ul>")
      .replace(/\n/g, "<br>");
  }

  private inlineMarkdown(text: string): string {
    return (
      text
        // Inline code (before bold/italic so backticks aren't processed further)
        .replace(/`([^`]+)`/g, '<code class="tmrg-code">$1</code>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        // Italic (avoid matching inside already-replaced bold)
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    );
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

  private renderSources(sources: { title: string; url: string }[]): void {
    if (!this.sourcesEl || sources.length === 0) return;
    this.sourcesEl.style.display = "block";
    this.sourcesEl.innerHTML = "";

    const label = document.createElement("p");
    label.className = "tmrg-sources-label";
    label.textContent = "Sources";
    this.sourcesEl.appendChild(label);

    for (const src of sources) {
      const link = document.createElement("a");
      link.className = "tmrg-source-link";
      link.href = src.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = src.title;
      this.sourcesEl.appendChild(link);
    }
  }

  private clearSources(): void {
    if (!this.sourcesEl) return;
    this.sourcesEl.style.display = "none";
    this.sourcesEl.innerHTML = "";
  }

  private renderFeedback(): void {
    if (!this.feedbackEl) return;
    this.feedbackEl.style.display = "flex";
    this.feedbackEl.innerHTML = "";

    const label = document.createElement("span");
    label.className = "tmrg-feedback-label";
    label.textContent = "Helpful?";
    this.feedbackEl.appendChild(label);

    const thumbUp = document.createElement("button");
    thumbUp.className = "tmrg-feedback-btn";
    thumbUp.title = "Yes, helpful";
    thumbUp.textContent = "👍";
    thumbUp.addEventListener("click", () => {
      this.onFeedback?.("up", this.lastQuestion);
      if (this.feedbackEl) {
        this.feedbackEl.innerHTML = '<span class="tmrg-feedback-done">Thanks! 👍</span>';
      }
    });

    const thumbDown = document.createElement("button");
    thumbDown.className = "tmrg-feedback-btn";
    thumbDown.title = "Not helpful";
    thumbDown.textContent = "👎";
    thumbDown.addEventListener("click", () => {
      this.onFeedback?.("down", this.lastQuestion);
      if (this.feedbackEl) {
        this.feedbackEl.innerHTML =
          '<span class="tmrg-feedback-done">Got it — I\'ll do better.</span>';
      }
    });

    this.feedbackEl.appendChild(thumbUp);
    this.feedbackEl.appendChild(thumbDown);
  }

  private clearFeedback(): void {
    if (!this.feedbackEl) return;
    this.feedbackEl.style.display = "none";
    this.feedbackEl.innerHTML = "";
  }

  private submitInput(): void {
    const text = this.inputEl?.value.trim();
    if (!text) return;
    this.lastQuestion = text;
    this.onAsk?.(text);
    this.inputEl!.value = "";
    this.inputEl!.style.height = "auto";
    (this.bubble!.querySelector(".tmrg-bubble-send") as HTMLButtonElement).disabled = true;
  }
}
