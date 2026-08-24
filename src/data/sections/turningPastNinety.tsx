import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const turningPastNinetyBlocks: ReactElement[] = [
    <StackLayout key="layout-quadrants-heading" maxWidth="xl">
        <Block id="quadrants-heading" padding="md">
            <EditableH2 id="h2-quadrants-heading" blockId="quadrants-heading">
                Turning Past 90°
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-setup" maxWidth="xl">
        <Block id="quadrants-setup" padding="sm">
            <EditableParagraph id="para-quadrants-setup" blockId="quadrants-setup">
                A right-angled triangle runs out of angles at 90°, but a turntable does not. Nothing
                stops the point carrying on over the top of the circle and into the second quadrant,
                where the horizontal distance is now measured to the left.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-visual" maxWidth="xl">
        <Block id="quadrants-visual">
            <VisualOptionCards
                blockId="quadrants-visual"
                intro="Pick the visual for this section."
                cards={[
                    {
                        id: "predict-210",
                        title: "The unit circle with a 210° wedge shaded and a faint grey dot floating loose on the rim",
                        looks:
                            "Imagine the unit circle with a pale wedge sweeping anticlockwise from the positive x-axis all the way round to 210°, and a faint grey dot resting loose on the rim. The real point stays hidden, and two empty boxes below the circle wait for the values of cos θ and sin θ.",
                        manipulate:
                            "Drag the faint dot to where they think the 210° point sits, then release to reveal the real one and its two coordinates",
                        reveals:
                            "Angles past 90° land in the other quadrants, where cosine and sine are simply coordinates with a minus sign",
                        targetsMisconception:
                            "They think sine and cosine only work for angles below 90°",
                        paradigm: "prediction",
                        recommended: true,
                    },
                    {
                        id: "full-turn-trail",
                        title: "A dot walking one full turn round the circle, leaving a trail, with a sign board underneath",
                        looks:
                            "Imagine the dot creeping anticlockwise from 0° to 360°, leaving a faint trail on the rim behind it. Under the circle two bars grow and shrink for cos θ and sin θ, dropping below their zero line whenever the value turns negative.",
                        manipulate:
                            "Walk the dot forward and back through the whole turn and stop wherever a bar crosses its zero line",
                        reveals:
                            "Each bar changes sign exactly as the dot crosses an axis, which is what splits the circle into four quadrants",
                        paradigm: "temporal",
                    },
                    {
                        id: "four-mirrors",
                        title: "Four points at once, one in each quadrant, all the same distance from the axes",
                        looks:
                            "Imagine the unit circle carrying four dots at the same time, one in each quadrant, forming a rectangle of mirror images. Each dot has its own little triangle and its own pair of coordinates written beside it, and a shared bar shows the two squared sides adding to 1.",
                        manipulate:
                            "Drag the first-quadrant dot and watch its three mirror images move with it",
                        reveals:
                            "The four points differ only in their signs, so the squared values, and their total of 1, are identical in every quadrant",
                        targetsMisconception:
                            "They think sine and cosine only work for angles below 90°",
                        paradigm: "comparison",
                        secondView: {
                            shows: "A stacked bar of the two squared side lengths, unchanged as the quadrant changes",
                            role: "constraining",
                            syncedBy: "unitCircleAngle, plus a shared hover highlight linking each dot to its coordinates",
                        },
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-signs" maxWidth="xl">
        <Block id="quadrants-signs" padding="sm">
            <EditableParagraph id="para-quadrants-signs" blockId="quadrants-signs">
                Sine and cosine are coordinates, not lengths, so they are quite happy being negative.
                Squaring, though, wipes the sign out completely. Whichever quadrant the point wanders
                into, sin²θ + cos²θ still comes to exactly 1.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-range" maxWidth="xl">
        <Block id="quadrants-range" padding="sm">
            <EditableParagraph id="para-quadrants-range" blockId="quadrants-range">
                There is a bonus hiding in that. Because the radius is pinned at 1, neither coordinate
                can ever escape the range −1 to 1, no matter how big the angle grows.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
