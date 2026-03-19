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
  apiKey: "",
  userId: "user-123",
  emailId: "user@example.com",
  theme: { primaryColor: "#ff6700", characterSize: 72 },
  idlePosition: "bottom-left",
  idlePositionOffsetY: 36,
  toggleStyle: "hover",
  highlight: { mode: "pulse", ringWidth: 2, fadeDuration: 3000 },
  onAskQuestion: (text) => console.log("User asked:", text),
  onFeedback: (rating, question) => console.log(rating, question),
});

// 2. Show the guide at a specific step
TMRGuide.show({
  stepId: "connect-account",
  message: "Click **Connect** to link your Google Ads account.",
  target: '[data-guide-target="connect-btn"]',
  position: "left",
  showInput: true,
  context: { subscriptionContext: "Step: Connect Account\n..." },
});

// 3. Celebrate a milestone
TMRGuide.celebrate("Account connected! Great job. ✨");

// 4. Clean up on unmount
TMRGuide.destroy();
```

---

## `TMRGuide.init(config)`

| Option                   | Type                         | Default          | Description                                         |
| ------------------------ | ---------------------------- | ---------------- | --------------------------------------------------- |
| `apiEndpoint`            | `string`                     | **required**     | URL to POST AI questions to                         |
| `apiKey`                 | `string`                     | **required**     | API key for authentication                          |
| `userId`                 | `string`                     | —                | Forwarded to AI backend                             |
| `emailId`                | `string`                     | —                | Forwarded to AI backend                             |
| `theme.primaryColor`     | `string`                     | `"#ff6700"`      | Ring, bubble accent, robot eye colour               |
| `theme.characterSize`    | `number`                     | `72`             | Character container size in px                      |
| `idlePosition`           | `IdlePosition`               | `"bottom-right"` | Corner the character rests in when idle/disabled    |
| `idlePositionOffsetX`    | `number`                     | `24`             | Horizontal px offset from the corner edge           |
| `idlePositionOffsetY`    | `number`                     | `50`             | Vertical px offset from the corner edge             |
| `toggleStyle`            | `ToggleStyle`                | `"hover"`        | How the Enable/Disable toggle is presented          |
| `highlight.mode`         | `HighlightMode`              | `"persistent"`   | How the spotlight behaves                           |
| `highlight.color`        | `string`                     | `primaryColor`   | Ring border colour (any CSS colour)                 |
| `highlight.ringWidth`    | `number`                     | `3`              | Ring border width in px                             |
| `highlight.fadeDuration` | `number`                     | `4000`           | ms before fade-out for `timed` / `pulse` modes      |
| `onStepChange`           | `(stepId) => void`           | —                | Called whenever `show()` is invoked                 |
| `onAskQuestion`          | `(text) => void`             | —                | Called when the user submits a question             |
| `onDismiss`              | `() => void`                 | —                | Called when the bubble is dismissed                 |
| `onFeedback`             | `(rating, question) => void` | —                | Called when user taps 👍 or 👎 after an AI response |

### `IdlePosition`

```ts
type IdlePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
```

### `ToggleStyle`

| Value            | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `"hover"`        | Pill fades in when the user hovers the character (default)                 |
| `"below"`        | Pill always visible directly below the character                           |
| `"badge"`        | Icon-only circle pinned to the top-right corner of the character           |
| `"corner-chip"`  | Separate fixed pill anchored to the same viewport corner as `idlePosition` |
| `"context-menu"` | No persistent UI — right-click the character to open a tiny menu           |

### `HighlightMode`

| Value          | Description                                                |
| -------------- | ---------------------------------------------------------- |
| `"persistent"` | Overlay + ring stay on until the step changes (default)    |
| `"timed"`      | Overlay + ring fade out after `fadeDuration` ms            |
| `"ring-only"`  | No dark overlay — only the glowing ring is shown           |
| `"pulse"`      | Ring pulses 3× to draw attention, then fades (recommended) |

---

## `TMRGuide.show(options)`

Walk the character to a target element, spotlight it, and display a message.

```ts
interface ShowOptions {
  stepId: string; // Sent to AI as context
  message: string; // Supports **bold**, *italic*, `code`, - lists, [links](url)
  target?: string; // CSS selector to spotlight. Omit for corner-idle.
  position?: "left" | "right" | "top" | "bottom"; // Which side of target the character stands on
  context?: Record<string, unknown>; // Extra context merged into AI requests
  showInput?: boolean; // Show Q&A textarea in bubble (default: false)
}
```

When `target` is omitted the character walks to its idle corner and opens the bubble there — useful for revisit messages or proactive nudges.

When a `target` is supplied the spotlight auto-scrolls the element into view before highlighting it.

Progress is always tracked even if the guide is disabled — re-enabling resumes from the latest step.

### Targeting elements

```html
<button data-guide-target="connect-btn">Connect</button>
```

```ts
TMRGuide.show({ target: '[data-guide-target="connect-btn"]', ... });
```

> **Dev warning:** If the selector matches nothing, the SDK logs `[tmr-guide] target "..." not found for step "..."` to the console.

---

## Other Methods

```ts
// Celebrate a milestone — character jumps + sparkles, optional bubble message
// No-op when the guide is disabled (bubble won't reappear if user turned it off)
TMRGuide.celebrate(message?: string): void

// Hide the bubble (character stays in place)
TMRGuide.hide(): void

// Enable guide programmatically (persists in localStorage)
TMRGuide.enable(): void

// Disable guide — character idles in corner, progress still tracked
TMRGuide.disable(): void

// Multi-step guided tour
TMRGuide.tour(steps: TourStep[]): void
TMRGuide.next(): void
TMRGuide.prev(): void

// Replace default bot with a custom renderer
TMRGuide.setCharacter(renderer: CharacterRenderer): void

// Tear down — removes all DOM, cancels all timers
TMRGuide.destroy(): void
```

---

## AI Integration

When the user submits a question, the SDK posts:

```
POST {apiEndpoint}
Content-Type: application/json
Authorization: Bearer {apiKey}

{
  "sessionId": "<uuid>",
  "userId": "<config.userId>",
  "emailId": "<config.emailId>",
  "message": "How do I connect Google Ads?",
  "history": [...],              // last 12 turns
  "subscriptionContext": "..."   // from options.context.subscriptionContext
}
```

Expected response shape:

```ts
{
  response: string;              // or message: string (either field accepted)
  followUps?: string[];          // shown as clickable chips below the response
  sources?: { title: string; url: string }[];  // rendered as a "Sources" section
}
```

Requests time out after **20 seconds** — the user sees "That took too long — please try again in a moment." Network errors show a generic fallback. Session ID is generated with `crypto.randomUUID()` in `init()` and lives for the lifetime of the SDK instance.

---

## Speech Bubble — Markdown & Features

The bubble text renderer supports a lightweight markdown subset:

| Syntax        | Output      |
| ------------- | ----------- |
| `**bold**`    | **bold**    |
| `*italic*`    | _italic_    |
| `` `code` ``  | inline code |
| `- list item` | `<ul><li>`  |
| `[text](url)` | hyperlink   |
| `\n`          | line break  |

After every AI response:

- **Follow-up chips** — suggested questions shown as clickable pills
- **Source citations** — if `sources[]` returned, rendered as a "Sources" list with links
- **Feedback row** — 👍 / 👎 buttons; tapping either fires `onFeedback(rating, question)` and replaces the row with a short acknowledgement

### Bubble positioning — open side

The bubble always appears on the side of the character that faces **away from the spotlighted target** — so it never covers the element the user needs to interact with. If there is no room on the open side it falls back gracefully. When no target is active (corner idle) the bubble defaults to whichever side has more space.

### Click-outside dismiss

After every `show()`, `tour()`, or `celebrate()` call a document-level click listener is attached. Clicking anywhere **outside** the guide root (robot + bubble) hides the bubble. The click propagates normally so the underlying element (e.g. a CTA button) still receives it. The listener is removed automatically on `hide()`, `disable()`, and `destroy()`.

---

## Character States & Animations

| State         | When                     | Animation                                   |
| ------------- | ------------------------ | ------------------------------------------- |
| `idle`        | Default, between actions | Gentle float + random blinks (every 2.5–6s) |
| `walking`     | Moving to a new target   | Side-to-side waddle                         |
| `talking`     | Showing a message        | Mouth opens/closes                          |
| `thinking`    | Waiting for AI response  | Eyes shift upward                           |
| `celebrating` | After `celebrate()`      | Jump + sparkle particles                    |

All animations respect `prefers-reduced-motion`.

---

## Custom Characters

```ts
interface CharacterRenderer {
  mount(container: HTMLElement): void;
  setState(state: CharacterState): void;
  destroy(): void;
}

TMRGuide.init({ ... });
TMRGuide.setCharacter(new MyLottieCharacter("robot.json"));
```

---

## Guided Tours

```ts
TMRGuide.tour([
  {
    stepId: "step-1",
    message: "First, select your agency type.",
    target: '[data-guide-target="agency-cards"]',
    position: "right",
    waitFor: '[data-guide-target="agency-cards"] .card', // auto-advance on click
  },
  {
    stepId: "step-2",
    message: "Now choose your data source.",
    target: '[data-guide-target="connector-list"]',
    showInput: true,
  },
]);
```

`waitFor` — CSS selector; when a matching element receives a `click` or `change` event, the tour auto-advances.

---

## React Integration

The key challenge in React is preventing step-change effects from firing before `init()` completes. Use a **dual-lock pattern** — a `ref` for synchronous guards inside `setTimeout` callbacks and a `state` flag for effect dependency arrays:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { TMRGuide } from "tmr-guide";

interface Props {
  stepId: string;
  userId: string | null;
}

export function GuideController({ stepId, userId }: Props) {
  const initialised = useRef(false); // synchronous guard (safe in setTimeout)
  const [isInitialised, setIsInitialised] = useState(false); // dep-array guard
  const hasInteracted = useRef(false);

  // Init once — wait for userId so backend can rate-limit per user
  useEffect(() => {
    if (initialised.current || !userId) return;
    initialised.current = true;
    TMRGuide.init({
      apiEndpoint: "/api/assist",
      userId,
      theme: { primaryColor: "#ff6700" },
      idlePosition: "bottom-left",
      highlight: { mode: "pulse" },
      onAskQuestion: () => {
        hasInteracted.current = true;
      },
    });
    setIsInitialised(true);
    return () => {
      TMRGuide.destroy();
      initialised.current = false;
      setIsInitialised(false);
    };
  }, [userId]);

  // Show on step change — only after init
  useEffect(() => {
    if (!isInitialised) return;
    hasInteracted.current = false;
    const t = setTimeout(() => {
      if (!initialised.current) return; // guard against late-firing after unmount
      TMRGuide.show({ stepId, message: `You're on: ${stepId}`, showInput: true });
    }, 400);
    return () => clearTimeout(t);
  }, [stepId, isInitialised]);

  // Proactive nudge after 65s of inactivity
  useEffect(() => {
    if (!isInitialised) return;
    const t = setTimeout(() => {
      if (!initialised.current) return;
      if (!hasInteracted.current) {
        TMRGuide.show({ stepId, message: "Still there? Feel free to ask me anything!" });
      }
    }, 65_000);
    return () => clearTimeout(t);
  }, [stepId, isInitialised]);

  return null;
}
```

> **Next.js / Turbopack:** Add `transpilePackages: ["tmr-guide"]` to `next.config.mjs`.

---

## Architecture

```
src/
  index.ts                  ← TMRGuideSDK class + singleton export
  types.ts                  ← All shared interfaces + HighlightMode, ToggleStyle, etc.

  character/
    BotCharacter.ts         ← SVG robot; ellipse eyes (blink via ry); 5 CSS-animated states
    CharacterRenderer.ts    ← Interface for swappable renderers
    styles.ts               ← Keyframe CSS injected via <style>

  spotlight/
    SpotlightManager.ts     ← SVG overlay with mask hole + separate ring div
                              Scrolls target into view before showing
                              ResizeObserver + scroll listener keep hole in sync
                              4 highlight modes: persistent / timed / ring-only / pulse

  bubble/
    BubbleManager.ts        ← Speech bubble with typewriter effect (18ms/char)
                              Markdown: bold, italic, code, lists, links
                              showLoading() dots → showResponse() transition
                              Follow-up chips, source citations, thumbs feedback
                              Smart left/right side — bubble placed on open side away from target
                              max-height cap + scrollable inner area prevents overflow
    styles.ts               ← Bubble CSS (color-scheme:light, list/code styles, etc.)

  ai/
    AIManager.ts            ← Session UUID, history (last 12), AbortController (20s timeout)
                              Returns followUps + sources from response

  tour/
    TourManager.ts          ← Sequences TourStep[], waitFor auto-advance

  utils/
    dom.ts                  ← injectCSS(), createElement(), getRect(), prefersReducedMotion()
    position.ts             ← computeCharacterPosition(), computeBubbleSide()
```

### Key design decisions

**Framework-agnostic:** Zero runtime dependencies. Pure DOM manipulation. Works via `<script>` tag or ESM import.

**Dual build:** Vite produces `tmr-guide.esm.js` (bundlers) and `tmr-guide.iife.js` (script tags). The `exports` field ensures Turbopack resolves ESM correctly.

**Spotlight:** Full-screen SVG with a `<mask>` that cuts a transparent hole over the target. A separate `<div>` provides the coloured ring via `box-shadow`. Ring animation (`tmrg-ring-pulse`) is a CSS keyframe on the ring element. Resize handled by `ResizeObserver` + `window.scroll`.

**Bubble overflow prevention:** `max-height: min(380px, calc(100vh - 120px))` caps bubble height. A flex scrollable inner div (`tmrg-bubble-scroll`) prevents content from pushing outside. After the typewriter finishes, `repositionFn` is called to re-clamp the bubble within the viewport.

**Open-side bubble:** `computeBubbleSide()` accepts `targetCenterX` — the center X of the spotlighted element. The bubble is placed on whichever side of the robot faces away from the target (open space). Falls back gracefully if there is no room.

**Tail anchoring:** Bubble tail is anchored at `bottom: 18px`, and `positionNear()` computes `top` such that the tail aligns with the robot's mouth (≈42% from top of 72px SVG viewBox, i.e. y≈30).

**Click-outside dismiss:** A `document` click listener attached after each `show()`/`tour()`/`celebrate()` hides the bubble when the user clicks outside the guide root. The click propagates so the underlying element still receives it. The listener is torn down on `hide()`, `disable()`, and `destroy()`.

**Enable/disable persistence:** `localStorage("tmr-guide-enabled")` read in `init()` so state survives page reloads.

**`celebrate()` guard:** No-op when `this.enabled === false` — prevents the bubble reappearing mid-step if the user has disabled the guide.

**Resize debounce:** `handleResize()` is debounced 100ms to avoid excessive layout recomputation while the user drags a window edge.

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

In the consuming project's `package.json`:

```json
"tmr-guide": "github:pradeep-gox/tmr-guide#<new-sha>"
```

```bash
bun install
```

The `dist/` folder is committed to the repo so GitHub-sourced installs work without a build step.
