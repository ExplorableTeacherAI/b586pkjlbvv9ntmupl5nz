import { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineTooltip,
    InlineTrigger,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    spotColorPropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
    scrubVarsFromDefinitions,
} from "../variables";
import { Point, POINT_LIST_CLASS } from "./pointList";

import {
    ANGLE_HUE,
    COS_HUE,
    HANDLE_HUE,
    INK,
    INK_QUIET,
    INK_STRUCTURE,
    RADIUS_HUE,
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

    // Publish both coordinates so the formula below can read them live.
    useEffect(() => {
        setVar("unitCircleCosValue", Number(cosValue.toFixed(2)));
        setVar("unitCircleSinValue", Number(sinValue.toFixed(2)));
    }, [cosValue, sinValue, setVar]);

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
                    <line x1={ORIGIN.x} y1={ORIGIN.y} x2={pointX} y2={pointY} stroke={RADIUS_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={ORIGIN.x}
                    y1={ORIGIN.y}
                    x2={pointX}
                    y2={pointY}
                    stroke={RADIUS_HUE}
                    strokeWidth={isActive("hypotenuse") ? 5 : 2.8}
                    strokeLinecap="round"
                    style={ease}
                />
                <text x={hypotenuseMid.x} y={hypotenuseMid.y} fill={RADIUS_HUE} fontSize="12" textAnchor="middle">1</text>
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
            caption="Drag the teal point around the rim. The violet upright side and the indigo flat side change together, while the sky-blue slanted side stays pinned at 1."
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
                The Right-Angled Triangle in the Unit Circle
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-setup" maxWidth="xl">
        <Block id="triangle-setup" padding="sm">
            <EditableParagraph id="para-triangle-setup" blockId="triangle-setup" className={POINT_LIST_CLASS}>
                <Point>
                    The{" "}
                    <InlineTooltip id="tooltip-unit-circle" tooltip="A circle of radius exactly 1, centred on the origin. Radius 1 is what lets sine and cosine be read straight off the coordinates.">
                        unit circle
                    </InlineTooltip>
                    , with a point on the rim at an angle{" "}
                    <InlineFormula latex="\clr{angle}{\theta}" colorMap={{ angle: ANGLE_HUE }} />
                    {" "}from the positive x-axis.
                </Point>
                <Point>
                    Drag that{" "}
                    <InlineSpotColor varName="unitCircleAngle" {...spotColorPropsFromDefinition(getVariableInfo("unitCircleAngle"))}>
                        teal point
                    </InlineSpotColor>{" "}
                    around the rim and a right-angled triangle follows it everywhere.
                </Point>
                <Point>
                    The{" "}
                    <InlineLinkedHighlight
                        varName="unitCircleHighlight"
                        highlightId="hypotenuse"
                        {...linkedHighlightPropsFromDefinition(getVariableInfo("unitCircleRadiusHighlight"))}
                    >
                        slanted side
                    </InlineLinkedHighlight>
                    {" "}is the radius, so it is always the{" "}
                    <InlineTooltip id="tooltip-hypotenuse" tooltip="The longest side of a right-angled triangle, the one opposite the right angle.">
                        hypotenuse
                    </InlineTooltip>
                    .
                </Point>
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
                    At <InlineFormula latex="\clr{angle}{\theta}" colorMap={{ angle: ANGLE_HUE }} /> ={" "}
                    <InlineScrubbleNumber
                        varName="unitCircleAngle"
                        {...numberPropsFromDefinition(getVariableInfo("unitCircleAngle"))}
                        formatValue={(v) => `${Math.round(v)}°`}
                    />
                    {" "}the slanted side is still exactly 1 unit long, which makes{" "}
                    <InlineTooltip id="tooltip-soh-cah-toa" tooltip="Sine is Opposite over Hypotenuse, Cosine is Adjacent over Hypotenuse, Tangent is Opposite over Adjacent.">
                        SOH CAH TOA
                    </InlineTooltip>
                    {" "}unusually kind.
                </Point>
                <Point>
                    <InlineFormula latex="\clr{cos}{\cos}\clr{angle}{\theta} = \clr{cos}{\text{adjacent}} \div \clr{radius}{1}" colorMap={{ angle: ANGLE_HUE, cos: COS_HUE, radius: RADIUS_HUE }} />
                    , so the{" "}
                    <InlineLinkedHighlight
                        varName="unitCircleHighlight"
                        highlightId="cos"
                        {...linkedHighlightPropsFromDefinition(getVariableInfo("unitCircleCosHighlight"))}
                    >
                        flat side
                    </InlineLinkedHighlight>
                    {" "}is simply <InlineFormula latex="\clr{cos}{\cos}\clr{angle}{\theta}" colorMap={{ angle: ANGLE_HUE, cos: COS_HUE }} />.
                </Point>
                <Point>
                    <InlineFormula latex="\clr{sin}{\sin}\clr{angle}{\theta} = \clr{sin}{\text{opposite}} \div \clr{radius}{1}" colorMap={{ angle: ANGLE_HUE, sin: SIN_HUE, radius: RADIUS_HUE }} />
                    , so the{" "}
                    <InlineLinkedHighlight
                        varName="unitCircleHighlight"
                        highlightId="sin"
                        {...linkedHighlightPropsFromDefinition(getVariableInfo("unitCircleSinHighlight"))}
                    >
                        upright side
                    </InlineLinkedHighlight>
                    {" "}is <InlineFormula latex="\clr{sin}{\sin}\clr{angle}{\theta}" colorMap={{ angle: ANGLE_HUE, sin: SIN_HUE }} />.
                </Point>
                <Point>
                    So the point is sitting at{" "}
                    <InlineFormula
                        latex="(\clr{cos}{\cos}\clr{angle}{\theta},\; \clr{sin}{\sin}\clr{angle}{\theta})"
                        colorMap={{ angle: ANGLE_HUE, cos: COS_HUE, sin: SIN_HUE }}
                    />
                    , and at{" "}
                    <InlineTrigger varName="unitCircleAngle" value={45} icon="zap">
                        exactly 45°
                    </InlineTrigger>
                    {" "}the two sides come out the same length.
                </Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-formula" maxWidth="xl">
        <Block id="triangle-formula" padding="lg">
            <FormulaBlock
                latex="\clr{angle}{\theta} = \clr{angle}{\scrub{unitCircleAngle}^\circ} \;\Longrightarrow\; P = (\clr{cos}{\val{unitCircleCosValue}},\; \clr{sin}{\val{unitCircleSinValue}})"
                colorMap={{ angle: ANGLE_HUE, cos: COS_HUE, sin: SIN_HUE }}
                variables={scrubVarsFromDefinitions(["unitCircleAngle", "unitCircleCosValue", "unitCircleSinValue"])}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-hook" maxWidth="xl">
        <Block id="triangle-hook" padding="sm">
            <EditableParagraph id="para-triangle-hook" blockId="triangle-hook" className={POINT_LIST_CLASS}>
                <Point>
                    Both sides hang off the same slanted side of length 1, whether the point sits low at{" "}
                    <InlineTrigger varName="unitCircleAngle" value={20} icon="play">
                        20°
                    </InlineTrigger>
                    {" "}or high at{" "}
                    <InlineTrigger varName="unitCircleAngle" value={75} icon="play">
                        75°
                    </InlineTrigger>
                    .
                </Point>
                <Point>So can they really change independently?</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

export default triangleInCircleBlocks;
