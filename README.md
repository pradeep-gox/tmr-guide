# tmr-guide

A framework-agnostic, embeddable JavaScript SDK that renders an animated AI guide character on any web page. The character walks to UI elements, spotlights them, speaks messages with a typewriter effect, and handles AI-powered Q&A via a speech bubble.

Built for Two Minute Reports onboarding, but designed to drop into any frontend (vanilla JS, React, Google Apps Script webview, etc.).

---

## Installation

### From GitHub (recommended for TMR projects)

```json
// package.json
"tmr-guide": "github:pradeep-gox/tmr-guide#<commit-sha>"
```

```bash
bun install   # or npm install / pnpm install
```

### As a script tag (IIFE build)

```html
<script src="dist/tmr-guide.iife.js"></script>
<!-- TMRGuide is available on window -->
```

---

## Quick Start

```ts
import { TMRGuide } from "tmr-guide";

// 1. Initialize once (e.g. on page load / component mount)
TMRGuide.init({
  apiEndpoint: "/api/onboarding/assist",
  userId: "user-123",
  theme: { primaryColor: "#ff6700", characterSize: 72 },
  idlePosition: "bottom-left",
  toggleStyle: "hover",
});

// 2. Show the guide at a specific step
TMRGuide.show({
  stepId: "connect-account",
  message: "Click **Connect** to link your Google Ads account.",
  target: '[data-guide-target="connect-btn"]',
  position: "left",
  showInput: true,
  context: {
    stepLabel: "Connect Account",
    secondsOnStep: 0,
  },
});

// 3. Celebrate a milestone
TMRGuide.celebrate("Account connected! Great job. ✨");

// 4. Clean up on unmount
TMRGuide.destroy();
```

---

## `TMRGuide.init(config)`

| Option | Type | Default | Description |
|---|---|---|---|
| `apiEndpoint` | `string` | **required** | URL to POST AI questions to |
| `userId` | `string` | `""` | Passed to AI backend inside context |
| `theme.primaryColor` | `string` | `"#ff6700"` | Spotlight ring + bubble accent colour |
| `theme.characterSize` | `number` | `72` | Character container size in px |
| `idlePosition` | `IdlePosition` | `"bottom-right"` | Corner the character rests in when idle/disabled |
| `idlePositionOffsetX` | `number` | `24` | Horizontal px offset from the corner edge |
| `idlePositionOffsetY` | `number` | `50` | Vertical px offset from the corner edge |
| `toggleStyle` | `ToggleStyle` | `"hover"` | How the Enable/Disable toggle is shown |
| `onStepChange` | `(stepId: string) => void` | — | Called whenever `show()` is called |
| `onAskQuestion` | `(text: string) => void` | — | Called when user submits a question |
| `onDismiss` | `() => void` | — | Called when bubble is dismissed |

### `IdlePosition`

```ts
type IdlePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
```

### `ToggleStyle`

Controls how the **Enable Guide / Disable Guide** toggle is presented to the user.

| Value | Description |
|---|---|
| `"hover"` | Pill fades in when user hovers the character (default) |
| `"below"` | Pill always visible directly below the character |
| `"badge"` | Small icon-only circle pinned to the top-right corner of the character |
| `"corner-chip"` | Separate fixed pill anchored to the same viewport corner as `idlePosition` |
| `"context-menu"` | No persistent UI — right-click the character to open a tiny menu |

---

## `TMRGuide.show(options)`

Walk the character to a target element, highlight it, and display a message.

```ts
interface ShowOptions {
  stepId: string;                            // Sent to AI as context
  message: string;                           // Supports **bold** and [links](url)
  target?: string;                           // CSS selector to highlight. Omit for no spotlight.
  position?: "left" | "right" | "top" | "bottom"; // Which side of target to stand on
  context?: Record<string, unknown>;         // Extra context merged into AI requests
  showInput?: boolean;                       // Show Q&A textarea in bubble (default: false)
}
```

Progress is always tracked even if the guide is currently disabled by the user — re-enabling resumes from the latest step.

### Targeting elements

Add `data-guide-target` attributes to your HTML elements:

```html
<button data-guide-target="connect-btn">Connect</button>
```

```ts
TMRGuide.show({ target: '[data-guide-target="connect-btn"]', ... });
```

---

## Other Methods

```ts
// Celebrate a milestone — character jumps + sparkles
// Optional message shown in bubble
TMRGuide.celebrate(message?: string): void

// Enable the guide programmatically (persists in localStorage)
TMRGuide.enable(): void

// Disable the guide — character idles in corner, progress still tracked
TMRGuide.disable(): void

// Multi-step guided tour
TMRGuide.tour(steps: TourStep[]): void
TMRGuide.next(): void  // advance to next step
TMRGuide.prev(): void  // go back

// Replace the default bot with a custom character renderer
TMRGuide.setCharacter(renderer: CharacterRenderer): void

// Tear down everything — removes DOM, stops all timers
TMRGuide.destroy(): void
```

---

## AI Integration

When the user types a question in the bubble (`showInput: true`), the SDK calls:

```
POST {apiEndpoint}
Content-Type: application/json

{
  "trigger": "user_question",
  "question": "How do I connect Google Ads?",
  "context": {
    ...options.context,
    "stepId": "connect-account",
    "sessionId": "<uuid>",     ← generated per SDK session
    "userId": "<config.userId>"
  },
  "history": [...]             ← last 12 messages
}
```

Expected response shape:

```ts
{
  message: string;
  followUps?: string[];        // shown as clickable chips below the response
  sources?: { title: string; url: string }[];
}
```

On network error, a built-in fallback message is shown. Session ID is generated with `crypto.randomUUID()` when `init()` is called and persists for the lifetime of the SDK instance.

> **For TMR's Maya backend:** `sessionId` and `userId` must be inside `context` (not top-level). Maya's DTO validates this strictly. The SDK already handles this correctly.

---

## Character States

The bot character has 5 animated states managed via CSS keyframes:

| State | When | Animation |
|---|---|---|
| `idle` | Default, between actions | Gentle float up/down |
| `walking` | Moving to a new target | Side-to-side waddle |
| `talking` | Showing a message | Mouth opens/closes |
| `thinking` | Waiting for AI response | Eyes shift upward |
| `celebrating` | After `celebrate()` | Jump + sparkle particles |

---

## Custom Characters

Implement the `CharacterRenderer` interface to swap in a Lottie animation, PNG sprite, or any other renderer:

```ts
interface CharacterRenderer {
  mount(container: HTMLElement): void;    // attach your character DOM/canvas to container
  setState(state: CharacterState): void;  // react to state changes
  destroy(): void;                        // clean up
}

// Usage
TMRGuide.init({ ... });
TMRGuide.setCharacter(new MyLottieCharacter("robot.json"));
```

---

## Guided Tours

Chain multiple steps into a linear tour:

```ts
TMRGuide.tour([
  {
    stepId: "step-1",
    message: "First, select your agency type.",
    target: '[data-guide-target="agency-cards"]',
    position: "right",
    showInput: false,
    waitFor: '[data-guide-target="agency-cards"] .card', // auto-advance on click
  },
  {
    stepId: "step-2",
    message: "Now choose your data source.",
    target: '[data-guide-target="connector-list"]',
    position: "right",
    showInput: true,
  },
]);
```

`waitFor` is a CSS selector — when an element matching it receives a `click` or `change` event, the tour auto-advances.

---

## React Integration

```tsx
"use client";
import { useEffect, useRef } from "react";
import { TMRGuide } from "tmr-guide";

interface Props {
  stepId: string;
}

export function GuideController({ stepId }: Props) {
  const initialised = useRef(false);
  const secondsOnStep = useRef(0);

  // Init once on mount
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    TMRGuide.init({
      apiEndpoint: "/api/assist",
      theme: { primaryColor: "#ff6700" },
      idlePosition: "bottom-left",
    });
    return () => {
      TMRGuide.destroy();
      initialised.current = false;
    };
  }, []);

  // Track time on step
  useEffect(() => {
    secondsOnStep.current = 0;
    const t = setInterval(() => { secondsOnStep.current += 1; }, 1000);
    return () => clearInterval(t);
  }, [stepId]);

  // Show on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      TMRGuide.show({
        stepId,
        message: `You're on step: ${stepId}`,
        context: { stepLabel: stepId, secondsOnStep: secondsOnStep.current },
      });
    }, 400); // wait for DOM to render
    return () => clearTimeout(timer);
  }, [stepId]);

  return null; // no DOM output
}
```

> **Next.js / Turbopack:** Add `transpilePackages: ["tmr-guide"]` to `next.config.mjs`.

---

## Architecture

```
src/
  index.ts                  ← TMRGuideSDK class + singleton export
  types.ts                  ← All shared interfaces (ShowOptions, TMRGuideConfig, etc.)

  character/
    BotCharacter.ts         ← SVG robot built from DOM elements; 5 CSS-animated states
    CharacterRenderer.ts    ← Interface for swappable character implementations
    styles.ts               ← CSS keyframe animations injected via <style>

  spotlight/
    SpotlightManager.ts     ← Full-screen SVG overlay with mask-based transparent hole
                              Orange highlight ring via box-shadow on separate div
                              ResizeObserver + scroll listener keep hole in sync

  bubble/
    BubbleManager.ts        ← Speech bubble with typewriter effect (18ms/char)
                              showLoading() animated dots → showResponse() transition
                              Smart side (left/right) keeps bubble in viewport
                              Q&A textarea + send button + follow-up chips
    styles.ts               ← Bubble CSS injected via <style>

  ai/
    AIManager.ts            ← Session UUID, last-12-message history, fetch wrapper
                              sessionId + userId merged into context before sending

  tour/
    TourManager.ts          ← Sequences TourStep[], waitFor auto-advance on click/change

  utils/
    dom.ts                  ← injectCSS(), createElement(), getRect()
    position.ts             ← computeCharacterPosition(), computeBubbleSide()
```

### Key design decisions

**Framework-agnostic:** Zero runtime dependencies. Pure DOM manipulation. Works via `<script>` tag (IIFE) or ESM import. State is entirely in-class — no React, no stores.

**Dual build:** Vite produces both `tmr-guide.esm.js` (for bundlers) and `tmr-guide.iife.js` (for script tags). The `exports` field in `package.json` ensures turbopack resolves the ESM build correctly.

**Spotlight:** Full-screen SVG with a `<mask>` that cuts a transparent hole over the target. The `feComposite` filter is not used — the hole is a black `<rect>` inside the mask, which inverts to transparent over the dark overlay. An orange ring is a separate positioned `<div>` with `box-shadow: 0 0 0 3px orange`.

**Hover toggle fix:** The toggle button is positioned `bottom: -26px` outside the character container's border box. Pure CSS `:hover` loses the state as the cursor crosses the gap. Fixed with JS `mouseenter`/`mouseleave` + 200ms grace period on both the container and the button.

**Enable/disable persistence:** `localStorage.setItem("tmr-guide-enabled", "true/false")`. The enabled state is read in `init()` so it survives page reloads.

---

## Building & Publishing

```bash
# In tmr-guide/
pnpm build          # outputs dist/tmr-guide.esm.js + dist/tmr-guide.iife.js
git add -A
git commit -m "feat: ..."
git push
git rev-parse HEAD  # copy this SHA
```

Then in the consuming project's `package.json`:

```json
"tmr-guide": "github:pradeep-gox/tmr-guide#<new-sha>"
```

```bash
bun install   # or npm install / pnpm install
```

The `dist/` folder is committed to the repo so GitHub-sourced installs work without a build step.
