export interface Position {
    x: number;
    y: number;
}
/**
 * Given a target element's rect and a preferred side, compute the fixed
 * pixel coordinates where the character should stand.
 * Falls back to bottom-right corner if no rect is provided.
 */
export declare function computeCharacterPosition(rect: DOMRect | null, side?: "left" | "right" | "top" | "bottom", charSize?: number): Position;
/**
 * Given the character's position, decide which side of it the bubble should
 * appear on — keeping the bubble within the viewport.
 *
 * When targetCenterX is provided (center of the spotlighted element), the bubble
 * is placed on the side AWAY from the target (open space). Falls back to the
 * opposite side only if there is not enough room.
 */
export declare function computeBubbleSide(charX: number, charSize: number, bubbleWidth: number, targetCenterX?: number): "right" | "left";
