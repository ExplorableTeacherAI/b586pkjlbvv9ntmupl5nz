import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const squaresNotDoublesBlocks: ReactElement[] = [
    <StackLayout key="layout-squares-heading" maxWidth="xl">
        <Block id="squares-heading" padding="md">
            <EditableH2 id="h2-squares-heading" blockId="squares-heading">
                Squares, Not Doubles
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-setup" maxWidth="xl">
        <Block id="squares-setup" padding="sm">
            <EditableParagraph id="para-squares-setup" blockId="squares-setup">
                Pythagoras says the two shorter sides of a right triangle, each squared, add up to the
                hypotenuse squared. Our triangle has sides of length cos θ and sin θ, and a hypotenuse
                of 1. Square them and the whole thing collapses into one short line.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-visual" maxWidth="xl">
        <Block id="squares-visual">
            <VisualOptionCards
                blockId="squares-visual"
                intro="Pick the visual for this section."
                cards={[
                    {
                        id: "brick-squares",
                        title: "Two brick-tiled squares built on the triangle's sides, and an empty square of side 1",
                        looks:
                            "Imagine the circle triangle with a square built outward on its flat side and another on its upright side, both tiled like Lego plates so their areas can be counted. Beside them sits a third, empty outlined square whose side is the slanted side, length 1.",
                        manipulate:
                            "Drag the tiles out of both small squares and pack them into the empty square of side 1",
                        reveals:
                            "The two small squares fill the big one exactly and never overflow, so cos²θ + sin²θ = 1",
                        targetsMisconception:
                            "They read sin²θ as the sine of θ squared, not (sin θ) squared",
                        paradigm: "constructivist",
                        recommended: true,
                    },
                    {
                        id: "predict-on-number-line",
                        title: "A number line from −1 to 1 with sin θ marked, and two loose markers to place",
                        looks:
                            "Imagine a number line running from −1 to 1 with the current value of sin θ marked on it in teal. Below the line sit two loose grey markers, one labelled sin²θ and the other labelled sin of θ squared, waiting to be dropped onto the line.",
                        manipulate:
                            "Drag each marker to where they think that value belongs, then release to see the true positions slide into place",
                        reveals:
                            "Squaring the sine gives a small positive number close to the line's middle, while squaring the angle first gives something wildly different",
                        targetsMisconception:
                            "They read sin²θ as the sine of θ squared, not (sin θ) squared",
                        paradigm: "prediction",
                    },
                    {
                        id: "stacked-area-bar",
                        title: "The unit circle with a two-part bar beside it showing cos²θ stacked on sin²θ",
                        looks:
                            "Imagine the unit circle with its dot and triangle on the left, and on the right a tall bar rising to a line marked 1. The bar is split into two coloured blocks, one for each squared side, that trade height as the dot moves but always reach the line together.",
                        manipulate:
                            "Swing the dot around the rim and watch one block grow by exactly as much as the other shrinks",
                        reveals:
                            "Neither squared side can change on its own, because between them they must always make up 1",
                        paradigm: "comparison",
                        secondView: {
                            shows: "A stacked bar of the two squared side lengths against a fixed line at 1",
                            role: "complementary",
                            syncedBy: "unitCircleAngle, plus a shared hover highlight linking each side to its block",
                        },
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-formula" maxWidth="xl">
        <Block id="squares-formula" padding="lg">
            <FormulaBlock latex="\sin^2\theta + \cos^2\theta = 1" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-notation" maxWidth="xl">
        <Block id="squares-notation" padding="sm">
            <EditableParagraph id="para-squares-notation" blockId="squares-notation">
                Mathematicians write (sin θ)² as sin²θ purely to save the brackets. It means take the
                sine first, then square the answer, which is not the same as the sine of θ². At 30°
                those two readings give 0.25 and 0, which is quite a gap for one small typo.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
