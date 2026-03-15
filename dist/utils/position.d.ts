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
 */
export declare function computeBubbleSide(charX: number, charSize: number, bubbleWidth: number): "right" | "left";
