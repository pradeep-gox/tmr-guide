export interface Position {
  x: number;
  y: number;
}

const CHAR_SIZE = 72; // px, default character size
const MARGIN = 16; // px from target / viewport edge

/**
 * Given a target element's rect and a preferred side, compute the fixed
 * pixel coordinates where the character should stand.
 * Falls back to bottom-right corner if no rect is provided.
 */
export function computeCharacterPosition(
  rect: DOMRect | null,
  side: "left" | "right" | "top" | "bottom" = "right",
  charSize = CHAR_SIZE,
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect) {
    // Default: bottom-right corner
    return { x: vw - charSize - MARGIN, y: vh - charSize - MARGIN };
  }

  let x: number;
  let y: number;

  switch (side) {
    case "right":
      x = rect.right + MARGIN;
      y = rect.top + rect.height / 2 - charSize / 2;
      break;
    case "left":
      x = rect.left - charSize - MARGIN;
      y = rect.top + rect.height / 2 - charSize / 2;
      break;
    case "top":
      x = rect.left + rect.width / 2 - charSize / 2;
      y = rect.top - charSize - MARGIN;
      break;
    case "bottom":
      x = rect.left + rect.width / 2 - charSize / 2;
      y = rect.bottom + MARGIN;
      break;
  }

  // Clamp to viewport
  x = Math.max(MARGIN, Math.min(vw - charSize - MARGIN, x));
  y = Math.max(MARGIN, Math.min(vh - charSize - MARGIN, y));

  return { x, y };
}

/**
 * Given the character's position, decide which side of it the bubble should
 * appear on — keeping the bubble within the viewport.
 */
export function computeBubbleSide(
  charX: number,
  charSize: number,
  bubbleWidth: number,
): "right" | "left" {
  const vw = window.innerWidth;
  if (charX + charSize + bubbleWidth + MARGIN > vw) return "left";
  return "right";
}
