export function injectCSS(id: string, css: string): void {
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Partial<Record<string, string>> = {},
  styles: Partial<CSSStyleDeclaration> = {},
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined) el.setAttribute(k, v);
  }
  Object.assign(el.style, styles);
  return el;
}

export function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
