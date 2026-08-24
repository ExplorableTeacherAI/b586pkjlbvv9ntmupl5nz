import { type ReactNode } from "react";

/**
 * Point — one bullet inside an EditableParagraph.
 *
 * Lesson prose is written in point form rather than flowing paragraphs.
 * Each Point renders as a block-level span with the bullet absolutely
 * positioned in the left gutter, so a paragraph block still holds exactly one
 * EditableParagraph (keeping the block editable, deletable and reorderable)
 * while reading as a list.
 *
 * The bullet is positioned rather than hung with a negative `text-indent`:
 * `text-indent` inherits into inline-flex children (InlineLinkedHighlight,
 * InlineScrubbleNumber, …) and shifts their text sideways, which swallows the
 * space before the component and leaves a gap after it.
 *
 * Inline components work inside a Point exactly as they do in prose.
 */
export function Point({ children }: { children: ReactNode }) {
    return (
        <span className="relative block indent-0 pl-5 mt-1.5 first:mt-0">
            <span className="absolute left-0 text-foreground/40" aria-hidden="true">
                &bull;
            </span>
            {children}
        </span>
    );
}

/** Vertical rhythm for a paragraph written in point form. */
export const POINT_LIST_CLASS = "space-y-1.5";

export default Point;
