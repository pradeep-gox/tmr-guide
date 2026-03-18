import type { CharacterState } from "../types";
export interface CharacterRenderer {
  mount(container: HTMLElement): void;
  setState(state: CharacterState): void;
  destroy(): void;
}
