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
                <Point>Spin the top plate of a Lego turntable and every stud travels a perfect circle.</Point>
                <Point>Pin any stud down with just two numbers: how far across it sits, and how far up.</Point>
                <Point>Those two numbers are what trigonometry is really made of.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orient-promise" maxWidth="xl">
        <Block id="orient-promise" padding="sm">
            <EditableParagraph id="para-orient-promise" blockId="orient-promise" className={POINT_LIST_CLASS}>
                <Point>
                    You already have the pieces:{" "}
                    <InlineTooltip id="tooltip-orient-ratios" tooltip="In a right-angled triangle, sine is opposite over hypotenuse and cosine is adjacent over hypotenuse.">
                        sine and cosine
                    </InlineTooltip>
                    {" "}in a right-angled triangle,{" "}
                    <InlineTooltip id="tooltip-orient-pythagoras" tooltip="The squares on the two shorter sides of a right-angled triangle add up to the square on the longest side.">
                        Pythagoras' theorem
                    </InlineTooltip>
                    , and angles measured from the positive x-axis.
                </Point>
                <Point>Put them together on a circle of radius 1 and something neat falls out.</Point>
                <Point>
                    By the end you will read sine and cosine straight off that circle, and see why{" "}
                    <InlineFormula
                        latex="\clr{sin}{\sin^2}\clr{angle}{\theta} + \clr{cos}{\cos^2}\clr{angle}{\theta} = \clr{total}{1}"
                        colorMap={{ angle: ANGLE_HUE, cos: COS_HUE, sin: SIN_HUE, total: TOTAL_HUE }}
                    />
                    {" "}has no choice but to be true.
                </Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
