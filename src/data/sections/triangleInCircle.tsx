import { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineFeedback,
    InlineFormula,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure, FigureSlider, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    getVariableInfo,
    spotColorPropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";
import { Point, POINT_LIST_CLASS } from "./pointList";

import {
    ANGLE_HUE,
    COS_HUE,
    HANDLE_HUE,
    INK,
    INK_QUIET,
    INK_STRUCTURE,
    SIN_HUE,
} from "./palette";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 420;
const ORIGIN = { x: 200, y: 250 };
const UNIT = 105; // pixels per unit of radius


const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const fmtRatio = (value: number) => value.toFixed(2);

// ── The bespoke drawing ──────────────────────────────────────────────────────

function UnitCircleTriangleDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("unitCircleAngle", 35);
    const highlight = useVar<string>("unitCircleHighlight", "");
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const handleScale = useSpring(dragging || hovered ? 1.25 : 1, { stiffness: 400, damping: 26 });

    // The follow-up questions unlock once the student has moved the point at all,
    // whether by dragging the handle or by using the slider.
    useEffect(() => {
        if (angle !== 35) setVar("triangleExplored", true);
    }, [angle, setVar]);

    const radians = toRadians(angle);
    const cosValue = Math.cos(radians);
    const sinValue = Math.sin(radians);
    const pointX = ORIGIN.x + UNIT * cosValue;
    const pointY = ORIGIN.y - UNIT * sinValue;

    // Linked-highlight contract: the target pops, everything else recedes.
    const isActive = (id: string) => highlight === id;
    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const dimOthers = highlight ? 0.35 : 1;
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("unitCircleHighlight", id),
        onPointerLeave: () => setVar("unitCircleHighlight", ""),
        style: { cursor: "default" as const },
    });

    const updateFromPointer = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * VIEW_WIDTH - ORIGIN.x;
        const y = ORIGIN.y - ((clientY - rect.top) / rect.height) * VIEW_HEIGHT;
        const degrees = (Math.atan2(y, x) * 180) / Math.PI;
        setVar("unitCircleAngle", Math.round(clamp(degrees, 15, 80)));
        setVar("triangleExplored", true);
    };

    // Angle arc (counter-clockwise on screen => sweep flag 0)
    const arcRadius = 42;
    const arcPath = `M ${ORIGIN.x + arcRadius} ${ORIGIN.y} A ${arcRadius} ${arcRadius} 0 0 0 ${
        ORIGIN.x + arcRadius * cosValue
    } ${ORIGIN.y - arcRadius * sinValue}`;
    const bisector = toRadians(angle / 2);
    const thetaGlyph = {
        x: ORIGIN.x + 46 * Math.cos(bisector),
        y: ORIGIN.y - 46 * Math.sin(bisector) + 4,
    };

    const hypotenuseMid = {
        x: ORIGIN.x + (UNIT * cosValue) / 2 - 14 * sinValue,
        y: ORIGIN.y - (UNIT * sinValue) / 2 - 14 * cosValue,
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A point on a circle of radius one, with its right-angled triangle"
        >
            <defs>
                <filter id="unit-circle-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Axes, ticks and the unit circle — quiet structure */}
            <g opacity={dimOthers} style={ease}>
                <line x1={75} y1={ORIGIN.y} x2={332} y2={ORIGIN.y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={ORIGIN.x} y1={370} x2={ORIGIN.x} y2={132} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx={ORIGIN.x} cy={ORIGIN.y} r={UNIT} fill="none" stroke={INK_QUIET} strokeWidth="1.5" />
                <text x={ORIGIN.x + UNIT} y={ORIGIN.y + 18} fill={INK_STRUCTURE} fontSize="11" textAnchor="middle">1</text>
                <text x={ORIGIN.x - UNIT} y={ORIGIN.y + 18} fill={INK_STRUCTURE} fontSize="11" textAnchor="middle">-1</text>
                <text x={ORIGIN.x - 9} y={ORIGIN.y - UNIT + 4} fill={INK_STRUCTURE} fontSize="11" textAnchor="end">1</text>
                <text x={ORIGIN.x - 9} y={ORIGIN.y + UNIT + 4} fill={INK_STRUCTURE} fontSize="11" textAnchor="end">-1</text>
            </g>

            {/* Angle arc */}
            <g opacity={dimOthers} style={ease}>
                <path d={arcPath} fill="none" stroke={ANGLE_HUE} strokeWidth="2" strokeLinecap="round" />
                <text x={thetaGlyph.x} y={thetaGlyph.y} fill={ANGLE_HUE} fontSize="13" textAnchor="middle">θ</text>
            </g>

            {/* Hypotenuse — the radius, always 1 */}
            <g opacity={dim("hypotenuse")} style={ease} {...hoverProps("hypotenuse")}>
                {isActive("hypotenuse") && (
                    <line x1={ORIGIN.x} y1={ORIGIN.y} x2={pointX} y2={pointY} stroke={INK_STRUCTURE} strokeWidth="9" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={ORIGIN.x}
                    y1={ORIGIN.y}
                    x2={pointX}
                    y2={pointY}
                    stroke={INK_STRUCTURE}
                    strokeWidth={isActive("hypotenuse") ? 3.5 : 2}
                    strokeLinecap="round"
                    style={ease}
                />
                <text x={hypotenuseMid.x} y={hypotenuseMid.y} fill={INK_STRUCTURE} fontSize="12" textAnchor="middle">1</text>
            </g>

            {/* Horizontal side — cos θ */}
            <g opacity={dim("cos")} style={ease} {...hoverProps("cos")}>
                {isActive("cos") && (
                    <line x1={ORIGIN.x} y1={ORIGIN.y} x2={pointX} y2={ORIGIN.y} stroke={COS_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={ORIGIN.x}
                    y1={ORIGIN.y}
                    x2={pointX}
                    y2={ORIGIN.y}
                    stroke={COS_HUE}
                    strokeWidth={isActive("cos") ? 5 : 3.2}
                    strokeLinecap="round"
                    style={ease}
                />
                <text
                    x={ORIGIN.x + (pointX - ORIGIN.x) / 2}
                    y={ORIGIN.y + 26}
                    fill={COS_HUE}
                    fontSize="13"
                    textAnchor="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`cos θ = ${fmtRatio(cosValue)}`}
                </text>
            </g>

            {/* Vertical side — sin θ */}
            <g opacity={dim("sin")} style={ease} {...hoverProps("sin")}>
                {isActive("sin") && (
                    <line x1={pointX} y1={ORIGIN.y} x2={pointX} y2={pointY} stroke={SIN_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={pointX}
                    y1={ORIGIN.y}
                    x2={pointX}
                    y2={pointY}
                    stroke={SIN_HUE}
                    strokeWidth={isActive("sin") ? 5 : 3.2}
                    strokeLinecap="round"
                    style={ease}
                />
                <text
                    x={pointX + 10}
                    y={ORIGIN.y - (UNIT * sinValue) / 2 + 4}
                    fill={SIN_HUE}
                    fontSize="13"
                    textAnchor="start"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`sin θ = ${fmtRatio(sinValue)}`}
                </text>
            </g>

            {/* The draggable point on the rim */}
            <g opacity={dimOthers} style={ease}>
                <g transform={`translate(${pointX} ${pointY}) scale(${handleScale})`}>
                    <circle r="9" fill={HANDLE_HUE} filter="url(#unit-circle-handle-shadow)" />
                </g>
                <circle
                    cx={pointX}
                    cy={pointY}
                    r="22"
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging(true);
                        updateFromPointer(event.clientX, event.clientY);
                    }}
                    onPointerMove={(event) => {
                        if (!dragging) return;
                        updateFromPointer(event.clientX, event.clientY);
                    }}
                    onPointerUp={() => setDragging(false)}
                    onPointerCancel={() => setDragging(false)}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                />
            </g>

            {/* Readouts, beside the drawing rather than over it */}
            <g opacity={dimOthers} style={ease}>
                <text x={24} y={388} fill={ANGLE_HUE} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`θ = ${Math.round(angle)}°`}
                </text>
                <text x={VIEW_WIDTH - 24} y={388} fontSize="13" textAnchor="end" fill={INK} style={{ fontVariantNumeric: "tabular-nums" }}>
                    P = (<tspan fill={COS_HUE}>{fmtRatio(cosValue)}</tspan>, <tspan fill={SIN_HUE}>{fmtRatio(sinValue)}</tspan>)
                </text>
            </g>
        </svg>
    );
}

function UnitCircleTriangleFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="unit-circle-triangle"
            onReset={() => {
                setVar("unitCircleAngle", 35);
                setVar("unitCircleHighlight", "");
            }}
            caption="Drag the teal point around the rim. The purple upright side and the indigo flat side change together, while the slanted side stays pinned at 1."
        >
            <UnitCircleTriangleDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="unitCircleAngle"
                    label="Angle θ"
                    {...numberPropsFromDefinition(getVariableInfo("unitCircleAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
            </div>
            <InteractionHintSequence
                hintKey="unit-circle-triangle-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Drag the teal point around the rim",
                        position: { x: "53%", y: "42%" },
                        dragPath: { type: "arc", startAngle: -35, endAngle: -70, radius: 38 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

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
            <EditableParagraph id="para-triangle-setup" blockId="triangle-setup" className={POINT_LIST_CLASS}>
                <Point>
                    A circle of radius 1, centred on the origin, with a point on the rim at an angle{" "}
                    <InlineFormula latex="\clr{unitCircleAngle}{\theta}" colorMap={{ unitCircleAngle: ANGLE_HUE }} />
                    {" "}from the positive x-axis.
                </Point>
                <Point>
                    Drag that{" "}
                    <InlineSpotColor varName="unitCircleAngle" {...spotColorPropsFromDefinition(getVariableInfo("unitCircleAngle"))}>
                        teal point
                    </InlineSpotColor>{" "}
                    around the rim and a right-angled triangle follows it everywhere.
                </Point>
                <Point>The radius itself is always the hypotenuse.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-visual" maxWidth="xl">
        <Block id="triangle-visual" padding="sm" hasVisualization>
            <UnitCircleTriangleFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-coordinates" maxWidth="xl">
        <Block id="triangle-coordinates" padding="sm">
            <EditableParagraph id="para-triangle-coordinates" blockId="triangle-coordinates" className={POINT_LIST_CLASS}>
                <Point>
                    At <InlineFormula latex="\clr{unitCircleAngle}{\theta}" colorMap={{ unitCircleAngle: ANGLE_HUE }} /> ={" "}
                    <InlineScrubbleNumber
                        varName="unitCircleAngle"
                        {...numberPropsFromDefinition(getVariableInfo("unitCircleAngle"))}
                        formatValue={(v) => `${Math.round(v)}°`}
                    />
                    {" "}the slanted side is still exactly 1 unit long, which makes SOH CAH TOA unusually kind.
                </Point>
                <Point>
                    <InlineFormula latex="\clr{cos}{\cos\theta} = \text{adjacent} \div 1" colorMap={{ cos: COS_HUE }} />
                    , so the{" "}
                    <InlineLinkedHighlight
                        varName="unitCircleHighlight"
                        highlightId="cos"
                        {...linkedHighlightPropsFromDefinition(getVariableInfo("unitCircleCosHighlight"))}
                    >
                        flat side
                    </InlineLinkedHighlight>
                    {" "}is simply <InlineFormula latex="\clr{cos}{\cos\theta}" colorMap={{ cos: COS_HUE }} />.
                </Point>
                <Point>
                    <InlineFormula latex="\clr{sin}{\sin\theta} = \text{opposite} \div 1" colorMap={{ sin: SIN_HUE }} />
                    , so the{" "}
                    <InlineLinkedHighlight
                        varName="unitCircleHighlight"
                        highlightId="sin"
                        {...linkedHighlightPropsFromDefinition(getVariableInfo("unitCircleSinHighlight"))}
                    >
                        upright side
                    </InlineLinkedHighlight>
                    {" "}is <InlineFormula latex="\clr{sin}{\sin\theta}" colorMap={{ sin: SIN_HUE }} />.
                </Point>
                <Point>
                    So the point is sitting at{" "}
                    <InlineFormula
                        latex="(\clr{cos}{\cos\theta},\; \clr{sin}{\sin\theta})"
                        colorMap={{ cos: COS_HUE, sin: SIN_HUE }}
                    />
                    .
                </Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-formula" maxWidth="xl">
        <Block id="triangle-formula" padding="lg">
            <FormulaBlock latex="P = (\clr{cos}{\cos\theta},\; \clr{sin}{\sin\theta})" colorMap={{ cos: COS_HUE, sin: SIN_HUE }} />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-hook" maxWidth="xl">
        <Block id="triangle-hook" padding="sm">
            <EditableParagraph id="para-triangle-hook" blockId="triangle-hook" className={POINT_LIST_CLASS}>
                <Point>Both sides hang off the same slanted side of length 1.</Point>
                <Point>So can they really change independently?</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

export default triangleInCircleBlocks;
