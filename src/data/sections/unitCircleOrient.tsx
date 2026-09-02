import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph, InlineFormula, InlineTooltip } from "@/components/atoms";
import { Point, POINT_LIST_CLASS } from "./pointList";
import { ANGLE_HUE, COS_HUE, SIN_HUE, TOTAL_HUE } from "./palette";

export const unitCircleOrientBlocks: ReactElement[] = [
    <StackLayout key="layout-orient-title" maxWidth="xl">
        <Block id="orient-title" padding="md">
            <EditableH1 id="h1-orient-title" blockId="orient-title">
                Trigonometry on the Unit Circle
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orient-hook" maxWidth="xl">
        <Block id="orient-hook" padding="sm">
            <EditableParagraph id="para-orient-hook" blockId="orient-hook" className={POINT_LIST_CLASS}>
                <Point>Picture a Ferris wheel. One seat goes round and round, always the same distance from the centre.</Point>
                <Point>To say exactly where that seat is right now, you only need two measurements: how far it sits to the side of the centre, and how high it sits above it.</Point>
                <Point>Those two measurements have names. The sideways one is the cosine of the angle, and the upward one is the sine. That is the whole idea behind trigonometry.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orient-promise" maxWidth="xl">
        <Block id="orient-promise" padding="sm">
            <EditableParagraph id="para-orient-promise" blockId="orient-promise" className={POINT_LIST_CLASS}>
                <Point>
                    You already know{" "}
                    <InlineTooltip id="tooltip-orient-ratios" tooltip="In a right-angled triangle, sine is opposite over hypotenuse and cosine is adjacent over hypotenuse.">
                        sine and cosine
                    </InlineTooltip>
                    {" "}from right-angled triangles, and you know{" "}
                    <InlineTooltip id="tooltip-orient-pythagoras" tooltip="The squares on the two shorter sides of a right-angled triangle add up to the square on the longest side.">
                        Pythagoras' theorem
                    </InlineTooltip>
                    : the two short sides, squared, add up to the long side squared.
                </Point>
                <Point>Now we shrink that Ferris wheel down to a circle with radius 1 and put its centre at the origin. The angle is measured round from the positive x-axis, and the seat's two measurements become the cosine and the sine themselves, with no dividing to do.</Point>
                <Point>
                    By the end you will read both of them straight off the circle, and see why{" "}
                    <InlineFormula
                        latex="\clr{sin}{\sin^2}\clr{angle}{\theta} + \clr{cos}{\cos^2}\clr{angle}{\theta} = \clr{total}{1}"
                        colorMap={{ angle: ANGLE_HUE, cos: COS_HUE, sin: SIN_HUE, total: TOTAL_HUE }}
                    />
                    {" "}is really just Pythagoras' theorem in disguise.
                </Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
