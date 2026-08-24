import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph } from "@/components/atoms";

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
            <EditableParagraph id="para-orient-hook" blockId="orient-hook">
                Snap a Lego turntable together and spin the top plate. Every stud on it travels a
                perfect circle, and at any instant you could pin one down with just two numbers: how
                far across it sits, and how far up. Those two numbers are what trigonometry is really
                made of.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orient-promise" maxWidth="xl">
        <Block id="orient-promise" padding="sm">
            <EditableParagraph id="para-orient-promise" blockId="orient-promise">
                You already know sine and cosine in a right-angled triangle, Pythagoras' theorem,
                and how to measure an angle from the positive x-axis. Put those together on a circle
                of radius 1 and something neat falls out. By the end you will read sine and cosine
                straight off that circle, and see why sin²θ + cos²θ = 1 has no choice but to be
                true.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
