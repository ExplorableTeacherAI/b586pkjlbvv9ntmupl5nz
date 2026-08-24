import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const triangleInCircleBlocks: ReactElement[] = [
    <StackLayout key="layout-triangle-heading" maxWidth="xl">
        <Block id="triangle-heading" padding="md">
            <EditableH2 id="h2-triangle-heading" blockId="triangle-heading">
                A Triangle Hidden in a Circle
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-setup" maxWidth="xl">
        <Block id="triangle-setup" padding="sm">
            <EditableParagraph id="para-triangle-setup" blockId="triangle-setup">
                Take a circle of radius 1 with its centre at the origin, and mark a point on the rim
                at an angle θ from the positive x-axis. Drop a line straight down to the x-axis and a
                right-angled triangle appears out of nowhere, with the radius itself as the
                hypotenuse.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-visual" maxWidth="xl">
        <Block id="triangle-visual">
            <VisualOptionCards
                blockId="triangle-visual"
                intro="Pick the visual for this section."
                cards={[
                    {
                        id: "point-on-rim",
                        title: "A point sliding round a circle of radius 1, with its right triangle drawn underneath",
                        looks:
                            "Imagine a circle of radius 1 on grid paper with a teal dot sitting on its rim. Under the dot a right-angled triangle is drawn: a flat side along the x-axis and an upright side reaching up to the dot, each with its length written beside it.",
                        manipulate:
                            "Slide the dot around the rim and watch the two side lengths change while the slanted side stays at 1",
                        reveals:
                            "The two side lengths are exactly the dot's coordinates, so the point on the circle sits at (cos θ, sin θ)",
                        paradigm: "conventional",
                        recommended: true,
                    },
                    {
                        id: "two-circles-compared",
                        title: "A circle of radius 1 next to a circle of radius 3, with a dot at the same angle in each",
                        looks:
                            "Imagine two circles side by side, a small one and a large one, each with a teal dot on the rim at the same angle and a right triangle drawn beneath it. Under each circle the side lengths are listed, along with each side divided by its own slanted side.",
                        manipulate:
                            "Turn the dot in either circle; the other one turns to match, so both triangles always share the same angle",
                        reveals:
                            "The divided-out ratios agree in both circles, but only in the radius-1 circle are the side lengths themselves equal to cos θ and sin θ",
                        paradigm: "comparison",
                        secondView: {
                            shows: "The radius-3 circle with the same angle, its side lengths, and its side-over-hypotenuse ratios",
                            role: "constraining",
                            syncedBy: "unitCircleAngle, plus a shared hover highlight on the horizontal and vertical sides",
                        },
                    },
                    {
                        id: "turntable-target",
                        title: "A Lego turntable on a coordinate grid with a target square marked on the rim",
                        looks:
                            "Imagine a round Lego plate centred on a grid, one stud on its rim marked in teal, and a small target square drawn somewhere on the circle. A readout beside the plate shows the stud's across-and-up position as it turns.",
                        manipulate:
                            "Spin the plate until the marked stud lands inside the target square",
                        reveals:
                            "Choosing an angle chooses a coordinate pair, so aiming at a position is the same as hunting down an angle",
                        paradigm: "goal",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-coordinates" maxWidth="xl">
        <Block id="triangle-coordinates" padding="sm">
            <EditableParagraph id="para-triangle-coordinates" blockId="triangle-coordinates">
                That hypotenuse is exactly 1 unit long, which makes SOH CAH TOA unusually kind. Since
                cos θ = adjacent ÷ 1, the horizontal side is simply cos θ, and in the same way the
                vertical side is sin θ. The point on the rim is therefore sitting at (cos θ, sin θ).
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-formula" maxWidth="xl">
        <Block id="triangle-formula" padding="lg">
            <FormulaBlock latex="P = (\cos\theta,\; \sin\theta)" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-hook" maxWidth="xl">
        <Block id="triangle-hook" padding="sm">
            <EditableParagraph id="para-triangle-hook" blockId="triangle-hook">
                Which raises a question worth chasing. If both sides hang off the same slanted side of
                length 1, can they really change independently of each other?
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
