import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph } from "@/components/atoms";
import { Point, POINT_LIST_CLASS } from "./pointList";

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
                <Point>You already have the pieces: sine and cosine in a right-angled triangle, Pythagoras' theorem, and angles measured from the positive x-axis.</Point>
                <Point>Put them together on a circle of radius 1 and something neat falls out.</Point>
                <Point>By the end you will read sine and cosine straight off that circle, and see why sin²θ + cos²θ = 1 has no choice but to be true.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
