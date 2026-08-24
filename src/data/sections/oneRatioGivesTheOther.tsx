import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const oneRatioGivesTheOtherBlocks: ReactElement[] = [
    <StackLayout key="layout-apply-heading" maxWidth="xl">
        <Block id="apply-heading" padding="md">
            <EditableH2 id="h2-apply-heading" blockId="apply-heading">
                One Ratio Gives You the Other
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-setup" maxWidth="xl">
        <Block id="apply-setup" padding="sm">
            <EditableParagraph id="para-apply-setup" blockId="apply-setup">
                The identity earns its keep the moment you know one ratio and need the other, with no
                triangle and no calculator handy. Suppose sin θ = 0.6. Then cos²θ = 1 − 0.36 = 0.64,
                so cos θ = ±0.8.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-formula" maxWidth="xl">
        <Block id="apply-formula" padding="lg">
            <FormulaBlock latex="\cos\theta = \pm\sqrt{1 - \sin^2\theta}" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-visual" maxWidth="xl">
        <Block id="apply-visual">
            <VisualOptionCards
                blockId="apply-visual"
                intro="Pick the visual for this section."
                cards={[
                    {
                        id: "height-line",
                        title: "A horizontal line cutting across the unit circle at a chosen height",
                        looks:
                            "Imagine the unit circle with a teal horizontal line running across it. Wherever the line sits, it meets the rim at two points, each marked with a dot, and under each dot its cosine value is written out.",
                        manipulate:
                            "Slide the horizontal line up and down to set the value of sin θ, and watch the two crossing dots slide apart or squeeze together",
                        reveals:
                            "One sine value always answers with two points whose cosines are equal in size but opposite in sign, which is where the ± comes from",
                        paradigm: "inversion",
                        recommended: true,
                    },
                    {
                        id: "hit-the-cosine",
                        title: "The unit circle with a target mark on the x-axis and a dot to steer round the rim",
                        looks:
                            "Imagine the unit circle with a small target notch sitting somewhere on the x-axis and a teal dot on the rim. A faint dashed line drops from the dot to the axis, showing where its cosine currently lands, with the miss distance printed beneath.",
                        manipulate:
                            "Steer the dot around the rim until its dashed line lands on the target notch",
                        reveals:
                            "Two different positions on the rim hit the same cosine, so a cosine alone does not pin down the angle",
                        paradigm: "goal",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-sign" maxWidth="xl">
        <Block id="apply-sign" padding="sm">
            <EditableParagraph id="para-apply-sign" blockId="apply-sign">
                That ± is not the maths being vague. Two different points on the circle sit at the
                same height of 0.6, one on the right and one on the left, and they have opposite
                cosines. Knowing the quadrant is what tells you which sign to keep.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
