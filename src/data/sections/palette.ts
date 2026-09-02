/**
 * Lesson palette — one quantity, one colour, everywhere.
 *
 * Every figure, inline formula, scrubble number, cloze answer and highlight in
 * this lesson reads its colour from here, so the same quantity never appears in
 * two different hues across the drawing, the prose and the formulas.
 *
 * | Quantity                          | Hue                     |
 * |-----------------------------------|-------------------------|
 * | the angle theta (what you drag)   | ANGLE_HUE  teal         |
 * | the flat side, cos theta          | COS_HUE    soft indigo  |
 * | the upright side, sin theta       | SIN_HUE    soft violet  |
 * | the slanted side, always 1        | RADIUS_HUE soft sky     |
 * | the total the squares add up to   | TOTAL_HUE  soft rose    |
 * | a target to aim at                | TARGET_HUE warm amber   |
 * | the sin(theta^2) impostor         | IMPOSTOR_HUE soft slate |
 * | a solution already found          | FOUND_HUE  soft green   |
 */

/** Body ink — text and numbers that carry no quantity identity. */
export const INK = "#334155";
/** Structural strokes: axes carrying meaning, frames. */
export const INK_STRUCTURE = "#64748B";
/** Quiet scaffolding: grid lines, unit circle outline, tick labels. */
export const INK_QUIET = "#CBD5E1";

/** The angle theta, and every handle the student drags to change it. */
export const ANGLE_HUE = "#62D0AD";
/** Kept as an alias: the draggable handle IS the angle control. */
export const HANDLE_HUE = ANGLE_HUE;

/** The flat (horizontal) side and everything that is cos theta. */
export const COS_HUE = "#8E90F5";
/** The upright (vertical) side and everything that is sin theta. */
export const SIN_HUE = "#AC8BF9";
/** The slanted side: the radius, pinned at 1, and every hypotenuse. */
export const RADIUS_HUE = "#62CCF9";
/** The total the two squares add up to, and the square of side 1 they fill. */
export const TOTAL_HUE = "#F8A0CD";

/** A value the student is aiming to hit. */
export const TARGET_HUE = "#F7B23B";
/** sin(theta^2) — the notation impostor, deliberately kept colourless. */
export const IMPOSTOR_HUE = "#94A3B8";
/** A solution the student has already landed on. */
export const FOUND_HUE = "#22c55e";

/** Matching 20%-opacity backgrounds for inline highlight chips. */
export const ANGLE_BG = "rgba(98, 208, 173, 0.20)";
export const COS_BG = "rgba(142, 144, 245, 0.20)";
export const SIN_BG = "rgba(172, 139, 249, 0.20)";
export const RADIUS_BG = "rgba(98, 204, 249, 0.20)";
export const TOTAL_BG = "rgba(248, 160, 205, 0.20)";
export const TARGET_BG = "rgba(247, 178, 59, 0.20)";
