import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";

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
            <EditableParagraph id="para-conclusion-insight" blockId="conclusion-insight">
                So sin²θ + cos²θ = 1 was never really a formula to memorise. It is Pythagoras'
                theorem applied to a triangle whose hypotenuse happens to be 1, hiding inside a circle
                you already knew how to draw.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-conclusion-forward" maxWidth="xl">
        <Block id="conclusion-forward" padding="sm">
            <EditableParagraph id="para-conclusion-forward" blockId="conclusion-forward">
                Sine and cosine are the coordinates of a point on the unit circle, and squaring them
                throws away the sign, so the total is always 1 and one ratio hands you the other.
                Next, that same circle gets unrolled into a wave, where sine and cosine become the
                graphs behind everything that repeats, from a rowing machine's stroke to sound
                itself.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
