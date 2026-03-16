import type {
  TMRGuideConfig,
  ShowOptions,
  TourStep,
  CharacterRenderer,
  IdlePosition,
  ToggleStyle,
} from "./types";
import { BotCharacter } from "./character/BotCharacter";
import { CHARACTER_CSS } from "./character/styles";
import { SpotlightManager } from "./spotlight/SpotlightManager";
import { BubbleManager } from "./bubble/BubbleManager";
import { AIManager } from "./ai/AIManager";
import { TourManager } from "./tour/TourManager";
import { injectCSS, createElement, getRect } from "./utils/dom";
import { computeCharacterPosition } from "./utils/position";

class TMRGuideSDK {
  private config: TMRGuideConfig | null = null;
  private root: HTMLElement | null = null;
  private charContainer: HTMLElement | null = null;
  private character: CharacterRenderer | null = null;
  private spotlight: SpotlightManager | null = null;
  private bubble: BubbleManager | null = null;
  private ai: AIManager | null = null;
  private tourMgr: TourManager | null = null;
  private currentOptions: ShowOptions | null = null;
  private charX = 0;
  private charY = 0;
  private charSize = 72;
  private isVisible = false;
  private enabled = true;
  private toggleBtn: HTMLElement | null = null;
  private contextMenu: HTMLElement | null = null;
  private resizeHandler: (() => void) | null = null;
  private resizeDebounce: ReturnType<typeof setTimeout> | null = null;
  private clickOutsideHandler: ((e: MouseEvent) => void) | null = null;
  private readonly STORAGE_KEY = "tmr-guide-enabled";

  // ─── Public API ─────────────────────────────────────────────────

  init(config: TMRGuideConfig): void {
    if (this.root) this.destroy();

    this.config = config;
    this.charSize = config.theme?.characterSize ?? 72;
    const primaryColor = config.theme?.primaryColor ?? "#ff6700";

    // Read persisted enabled state (default: true)
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this.enabled = stored !== "false";

    // Root container (zero-size, fixed, sits above everything)
    injectCSS("tmrg-char-css", CHARACTER_CSS);
    const root = createElement("div", { id: "tmr-guide-root" });
    document.body.appendChild(root);
    this.root = root;

    // Character container
    const charContainer = createElement("div", { class: "tmrg-char" }, {});
    charContainer.dataset.state = "idle";
    charContainer.style.width = `${this.charSize}px`;
    charContainer.style.height = `${this.charSize}px`;
    root.appendChild(charContainer);
    this.charContainer = charContainer;

    // Character renderer
    const char = new BotCharacter(this.charSize, primaryColor);
    char.mount(charContainer);
    this.character = char;

    // Initial position: idle corner (disabled stays there; enabled starts there before first show())
    const { x: cx, y: cy } = this.cornerPosition();
    this.charX = cx;
    this.charY = cy;
    this.applyCharPosition();

    // Managers
    this.spotlight = new SpotlightManager();
    this.spotlight.init(root);

    this.bubble = new BubbleManager();
    this.bubble.init(
      root,
      (text) => this.ask(text),
      () => this.hide(),
      (rating, question) => this.config?.onFeedback?.(rating, question),
    );
    // Re-clamp position after typewriter so long AI responses never overflow
    this.bubble.setRepositionFn(() => this.bubble!.positionNear(this.charX, this.charY));

    this.ai = new AIManager(config.apiEndpoint, config.userId, config.emailId);
    this.tourMgr = new TourManager();

    // Toggle button (enable/disable guide)
    this.renderToggleBtn();

    // Click on character: when enabled toggles bubble; when disabled does nothing
    charContainer.addEventListener("click", () => {
      if (!this.enabled) return;
      if (this.isVisible) {
        this.hide();
      } else if (this.currentOptions) {
        this.show(this.currentOptions);
      }
    });

    // Reposition character + bubble when the viewport is resized (debounced 100ms)
    this.resizeHandler = () => {
      if (this.resizeDebounce) clearTimeout(this.resizeDebounce);
      this.resizeDebounce = setTimeout(() => this.handleResize(), 100);
    };
    window.addEventListener("resize", this.resizeHandler, { passive: true });
  }

  show(options: ShowOptions): void {
    this.assertInit();
    // Always track progress regardless of enabled state
    this.currentOptions = options;
    this.config!.onStepChange?.(options.stepId);
    // Clear tour nav when show() is called directly (not via tour)
    if (!this.tourMgr?.isActive()) this.bubble?.setOnNext(null);

    // When disabled: track progress but stay idle in corner
    if (!this.enabled) return;

    this.isVisible = true;

    const primaryColor = this.config!.theme?.primaryColor ?? "#ff6700";

    // Warn in development if the target selector does not match any element
    if (options.target && !document.querySelector(options.target)) {
      console.warn(`[tmr-guide] target "${options.target}" not found for step "${options.stepId}"`);
    }

    // 1. Walk character toward target (or idle corner when no target)
    const rect = options.target ? getRect(options.target) : null;
    const targetPos = rect
      ? computeCharacterPosition(rect, options.position ?? "right", this.charSize)
      : this.cornerPosition();

    const isAlreadyNear =
      Math.abs(this.charX - targetPos.x) < 4 &&
      Math.abs(this.charY - targetPos.y) < 4;

    if (!isAlreadyNear) {
      this.character!.setState("walking");
    }

    this.charX = targetPos.x;
    this.charY = targetPos.y;
    this.applyCharPosition();

    // Tell the bubble which side the target is on so it positions in open space
    this.bubble!.setTargetCenterX(rect ? rect.left + rect.width / 2 : undefined);

    // 2. After walking transition, show bubble + spotlight
    const delay = isAlreadyNear ? 0 : 500;
    setTimeout(() => {
      this.character!.setState("talking");

      if (options.target) {
        const hl = this.config!.highlight ?? {};
        this.spotlight!.show(options.target, {
          mode: hl.mode ?? "persistent",
          color: hl.color ?? primaryColor,
          ringWidth: hl.ringWidth ?? 3,
          fadeDuration: hl.fadeDuration ?? 4000,
        });
      }

      this.bubble!.show(options.message, options.showInput ?? false);
      // Position bubble after it's rendered (needs height)
      requestAnimationFrame(() => {
        this.bubble!.positionNear(this.charX, this.charY);
        // Settle to idle after speaking
        setTimeout(() => this.character!.setState("idle"), 1800);
      });
      // Dismiss bubble when user clicks outside the guide root
      this.attachClickOutside();
    }, delay);
  }

  hide(): void {
    this.assertInit();
    this.isVisible = false;
    this.spotlight!.hide();
    this.bubble!.hide();
    this.bubble!.setOnNext(null);
    this.bubble!.setTargetCenterX(undefined);
    this.character!.setState("idle");
    this.detachClickOutside();
    this.config?.onDismiss?.();
  }

  /** Run a multi-step guided tour */
  tour(steps: TourStep[]): void {
    this.assertInit();
    this.tourMgr!.load(steps, (step) => {
      this.show(step);
      // Show "Next →" button when not on the last step
      const isLast = this.tourMgr!.current() === steps[steps.length - 1];
      this.bubble!.setOnNext(isLast ? null : () => this.tourMgr!.next());
    });
    this.tourMgr!.start();
  }

  next(): void {
    this.assertInit();
    this.tourMgr!.next();
  }

  prev(): void {
    this.assertInit();
    this.tourMgr!.prev();
  }

  /** Send a user question to AI and show the response in the bubble */
  async ask(text: string): Promise<void> {
    this.assertInit();
    this.config?.onAskQuestion?.(text);

    const context: Record<string, unknown> = {
      ...(this.currentOptions?.context ?? {}),
      stepId: this.currentOptions?.stepId ?? "unknown",
    };

    this.character!.setState("thinking");
    this.bubble!.showLoading();

    const response = await this.ai!.ask(text, context);

    this.character!.setState("talking");
    this.bubble!.showResponse(response.message, response.followUps ?? [], response.sources ?? []);
    setTimeout(() => this.character!.setState("idle"), 1800);
  }

  /** Celebrate a milestone (character jumps, optional message in bubble) */
  celebrate(message?: string): void {
    this.assertInit();
    if (!this.enabled) return;
    this.character!.setState("celebrating");
    if (message) {
      this.bubble!.show(message);
      requestAnimationFrame(() => this.bubble!.positionNear(this.charX, this.charY));
      this.isVisible = true;
      this.attachClickOutside();
    }
    setTimeout(() => this.character!.setState("idle"), 1800);
  }

  /** Enable the guide — resumes guidance from the current step */
  enable(): void {
    this.assertInit();
    if (this.enabled) return;
    this.enabled = true;
    localStorage.setItem(this.STORAGE_KEY, "true");
    this.updateToggleBtn();
    if (this.currentOptions) {
      this.show(this.currentOptions);
    }
  }

  /** Disable the guide — character idles in the corner; progress is still tracked */
  disable(): void {
    this.assertInit();
    if (!this.enabled) return;
    this.enabled = false;
    localStorage.setItem(this.STORAGE_KEY, "false");
    this.updateToggleBtn();
    this.isVisible = false;
    this.spotlight!.hide();
    this.bubble!.hide();
    this.character!.setState("idle");
    this.detachClickOutside();
    this.moveToCorner();
  }

  /** Replace the default bot character with a custom renderer */
  setCharacter(renderer: CharacterRenderer): void {
    this.assertInit();
    if (this.character) this.character.destroy();
    renderer.mount(this.charContainer!);
    this.character = renderer;
  }

  destroy(): void {
    if (this.resizeDebounce) { clearTimeout(this.resizeDebounce); this.resizeDebounce = null; }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    this.detachClickOutside();
    this.spotlight?.destroy();
    this.bubble?.destroy();
    this.tourMgr?.destroy();
    this.root?.remove();
    this.root = null;
    this.charContainer = null;
    this.character = null;
    this.spotlight = null;
    this.bubble = null;
    this.ai = null;
    this.tourMgr = null;
    this.toggleBtn = null;
    this.contextMenu?.remove();
    this.contextMenu = null;
    this.currentOptions = null;
    this.config = null;
    this.isVisible = false;
  }

  // ─── Private ────────────────────────────────────────────────────

  private handleResize(): void {
    // Recompute character position based on current options (or idle corner)
    const opts = this.currentOptions;
    const rect = opts?.target ? getRect(opts.target) : null;
    const newPos = rect
      ? computeCharacterPosition(rect, opts?.position ?? "right", this.charSize)
      : this.cornerPosition();

    this.charX = newPos.x;
    this.charY = newPos.y;
    this.applyCharPosition();

    // Re-clamp bubble if it's visible
    if (this.isVisible) {
      this.bubble?.positionNear(this.charX, this.charY);
    }

    // Reposition corner chip toggle if in use
    this.positionCornerChip();
  }

  private applyCharPosition(): void {
    if (!this.charContainer) return;
    this.charContainer.style.left = `${this.charX}px`;
    this.charContainer.style.top = `${this.charY}px`;
  }

  private cornerPosition(): { x: number; y: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pos: IdlePosition = this.config?.idlePosition ?? "bottom-right";
    const ox = this.config?.idlePositionOffsetX ?? 24;
    const oy = this.config?.idlePositionOffsetY ?? 50;
    const right = vw - this.charSize - ox;
    const bottom = vh - this.charSize - oy;
    switch (pos) {
      case "top-left":     return { x: ox,    y: oy };
      case "top-right":    return { x: right,  y: oy };
      case "bottom-left":  return { x: ox,    y: bottom };
      case "bottom-right": return { x: right,  y: bottom };
    }
  }

  private moveToCorner(): void {
    const { x, y } = this.cornerPosition();
    this.charX = x;
    this.charY = y;
    this.applyCharPosition();
  }

  private renderToggleBtn(): void {
    const style: ToggleStyle = this.config?.toggleStyle ?? "hover";

    if (style === "context-menu") {
      this.setupContextMenu();
      return;
    }

    if (style === "corner-chip") {
      const chip = document.createElement("button");
      chip.className = "tmrg-corner-chip";
      chip.addEventListener("click", () => {
        if (this.enabled) this.disable();
        else this.enable();
      });
      this.root!.appendChild(chip);
      this.toggleBtn = chip;
      this.positionCornerChip();
    } else {
      // "below" | "hover" | "badge" — all attach inside charContainer
      const btn = document.createElement("button");
      btn.className = "tmrg-toggle-btn";
      btn.dataset.style = style;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.enabled) this.disable();
        else this.enable();
      });
      this.charContainer!.appendChild(btn);
      this.toggleBtn = btn;

      // "hover" style: the button sits outside the char container's border box
      // (bottom: -26px), so CSS :hover on the parent loses track as the cursor
      // crosses the gap. Use JS with a 200ms grace period instead.
      if (style === "hover") {
        let hideTimer: ReturnType<typeof setTimeout> | null = null;
        const showBtn = () => {
          if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
          btn.style.opacity = "1";
          btn.style.pointerEvents = "auto";
        };
        const hideBtn = () => {
          hideTimer = setTimeout(() => {
            btn.style.opacity = "0";
            btn.style.pointerEvents = "none";
          }, 200);
        };
        this.charContainer!.addEventListener("mouseenter", showBtn);
        this.charContainer!.addEventListener("mouseleave", hideBtn);
        btn.addEventListener("mouseenter", showBtn);
        btn.addEventListener("mouseleave", hideBtn);
      }
    }

    this.updateToggleBtn();
  }

  private updateToggleBtn(): void {
    if (!this.toggleBtn) return;
    const style: ToggleStyle = this.config?.toggleStyle ?? "hover";
    const disableIcon = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><rect x="0.5" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/><rect x="6" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/></svg>`;
    const enableIcon  = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><polygon points="0.5,0.5 8.5,4.5 0.5,8.5" fill="currentColor"/></svg>`;
    const icon  = this.enabled ? disableIcon : enableIcon;
    const label = this.enabled ? "Disable Guide" : "Enable Guide";
    // Badge shows icon only; all others show icon + label
    this.toggleBtn.innerHTML = style === "badge" ? icon : `${icon} ${label}`;
    this.toggleBtn.dataset.enabled = this.enabled ? "true" : "false";
    this.toggleBtn.title = label;
  }

  private positionCornerChip(): void {
    if (!this.toggleBtn) return;
    const pos: IdlePosition = this.config?.idlePosition ?? "bottom-right";
    const chip = this.toggleBtn;
    chip.style.top = chip.style.bottom = chip.style.left = chip.style.right = "auto";
    const m = "12px";
    switch (pos) {
      case "top-left":     chip.style.top    = m; chip.style.left  = m; break;
      case "top-right":    chip.style.top    = m; chip.style.right = m; break;
      case "bottom-left":  chip.style.bottom = m; chip.style.left  = m; break;
      case "bottom-right": chip.style.bottom = m; chip.style.right = m; break;
    }
  }

  private setupContextMenu(): void {
    if (!this.charContainer) return;
    this.charContainer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showContextMenu((e as MouseEvent).clientX, (e as MouseEvent).clientY);
    });
  }

  private showContextMenu(x: number, y: number): void {
    this.contextMenu?.remove();

    const disableIcon = `<svg width="10" height="10" viewBox="0 0 9 9" fill="none"><rect x="0.5" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/><rect x="6" y="0.5" width="2.5" height="8" rx="1" fill="currentColor"/></svg>`;
    const enableIcon  = `<svg width="10" height="10" viewBox="0 0 9 9" fill="none"><polygon points="0.5,0.5 8.5,4.5 0.5,8.5" fill="currentColor"/></svg>`;
    const icon  = this.enabled ? disableIcon : enableIcon;
    const label = this.enabled ? "Disable Guide" : "Enable Guide";

    const menu = document.createElement("div");
    menu.className = "tmrg-ctx-menu";

    const item = document.createElement("div");
    item.className = "tmrg-ctx-item";
    item.innerHTML = `${icon} ${label}`;
    item.addEventListener("click", () => {
      if (this.enabled) this.disable();
      else this.enable();
      menu.remove();
      this.contextMenu = null;
    });
    menu.appendChild(item);
    document.body.appendChild(menu);
    this.contextMenu = menu;

    // Keep within viewport
    const vw = window.innerWidth, vh = window.innerHeight;
    menu.style.left = `${Math.min(x, vw - 180)}px`;
    menu.style.top  = `${Math.min(y, vh - 48)}px`;

    // Close on outside click
    const onOutside = (e: Event) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        this.contextMenu = null;
        document.removeEventListener("click", onOutside);
      }
    };
    setTimeout(() => document.addEventListener("click", onOutside), 0);

    // Close on Escape
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        menu.remove();
        this.contextMenu = null;
        document.removeEventListener("keydown", onEsc);
      }
    };
    document.addEventListener("keydown", onEsc);
  }

  /** Attach a document click listener that hides the bubble when clicking outside the guide root. */
  private attachClickOutside(): void {
    this.detachClickOutside(); // clear any previous listener first
    // Delay by one tick so the current click (e.g. character click) doesn't immediately dismiss
    setTimeout(() => {
      this.clickOutsideHandler = (e: MouseEvent) => {
        if (!this.isVisible) return;
        // Use composedPath() so elements removed from the DOM during their own click handler
        // (e.g. follow-up chips that clear their container) still resolve correctly.
        const path = e.composedPath();
        if (this.root && path.includes(this.root)) return;
        this.hide();
      };
      document.addEventListener("click", this.clickOutsideHandler, { passive: true });
    }, 0);
  }

  private detachClickOutside(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }

  private assertInit(): void {
    if (!this.root) throw new Error("TMRGuide: call init() first");
  }
}

// Singleton export — works both as ESM import and as window.TMRGuide via IIFE
export const TMRGuide = new TMRGuideSDK();

// Re-export types for consumers
export type {
  TMRGuideConfig,
  ShowOptions,
  TourStep,
  CharacterRenderer,
  IdlePosition,
  ToggleStyle,
  HighlightMode,
} from "./types";
