export declare function injectCSS(id: string, css: string): void;
export declare function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Partial<Record<string, string>>, styles?: Partial<CSSStyleDeclaration>): HTMLElementTagNameMap[K];
export declare function getRect(selector: string): DOMRect | null;
export declare function prefersReducedMotion(): boolean;
