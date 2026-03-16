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
 *
 * When targetCenterX is provided (center of the spotlighted element), the bubble
 * is placed on the side AWAY from the target (open space). Falls back to the
 * opposite side only if there is not enough room.
 */
export function computeBubbleSide(
  charX: number,
  charSize: number,
  bubbleWidth: number,
  targetCenterX?: number,
): "right" | "left" {
  const vw = window.innerWidth;
  const canFitRight = charX + charSize + bubbleWidth + MARGIN <= vw;
  const canFitLeft = charX - bubbleWidth - MARGIN >= 0;

  if (targetCenterX !== undefined) {
    // Robot center vs target center — prefer the side facing open space
    const robotCenterX = charX + charSize / 2;
    if (robotCenterX < targetCenterX) {
      // Robot is to the LEFT of the target → open space is on the left
      if (canFitLeft) return "left";
      if (canFitRight) return "right";
    } else {
      // Robot is to the RIGHT of the target → open space is on the right
      if (canFitRight) return "right";
      if (canFitLeft) return "left";
    }
  }

  // No target info: default to right, fall back to left
  if (canFitRight) return "right";
  return "left";
}
