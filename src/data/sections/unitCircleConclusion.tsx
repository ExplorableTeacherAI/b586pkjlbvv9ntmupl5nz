import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { Point, POINT_LIST_CLASS } from "./pointList";

export const unitCircleConclusionBlocks: ReactElement[] = [
    <StackLayout key="layout-conclusion-heading" maxWidth="xl">
        <Block id="conclusion-heading" padding="md">
            <EditableH2 id="h2-conclusion-heading" blockId="conclusion-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-conclusion-insight" maxWidth="xl">
        <Block id="conclusion-insight" padding="sm">
            <EditableParagraph id="para-conclusion-insight" blockId="conclusion-insight" className={POINT_LIST_CLASS}>
                <Point>sin²θ + cos²θ = 1 was never really a formula to memorise.</Point>
                <Point>It is Pythagoras' theorem on a triangle whose hypotenuse happens to be 1.</Point>
                <Point>And it was hiding inside a circle you already knew how to draw.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-conclusion-forward" maxWidth="xl">
        <Block id="conclusion-forward" padding="sm">
            <EditableParagraph id="para-conclusion-forward" blockId="conclusion-forward" className={POINT_LIST_CLASS}>
                <Point>Sine and cosine are the coordinates of a point on the unit circle.</Point>
                <Point>Squaring throws away the sign, so the total is always 1 and one ratio hands you the other.</Point>
                <Point>Next, that same circle gets unrolled into a wave, the graph behind everything that repeats, from a rowing machine's stroke to sound itself.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
