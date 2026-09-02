import { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineSpotColor,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineTooltip,
    InlineTrigger,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useSpring } from "@/lib/motion";
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
    FOUND_HUE,
    HANDLE_HUE,
    INK,
    INK_QUIET,
    INK_STRUCTURE,
    RADIUS_HUE,
    SIN_HUE,
    TARGET_HUE,
    TOTAL_HUE,
} from "./palette";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 380;
const PAD = 24;
const CENTRE = { x: 185, y: 190 };
const RADIUS = 120;
const HIT_TOLERANCE = 0.02;


const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const fmtRatio = (value: number) => value.toFixed(2);

// ── The bespoke drawing ──────────────────────────────────────────────────────

function TargetCosineDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("applyAngle", 20);
    const target = useVar<number>("applyTargetCos", 0.6);
    const foundUpper = useVar<boolean>("applyFoundUpper", false);
    const foundLower = useVar<boolean>("applyFoundLower", false);
    const highlight = useVar<string>("applyHighlight", "");
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const previousTarget = useRef(target);

    const handleScale = useSpring(dragging || hovered ? 1.25 : 1, { stiffness: 400, damping: 26 });

    const radians = toRadians(angle);
    const cosValue = Math.cos(radians);
    const sinValue = Math.sin(radians);
    const miss = Math.abs(cosValue - target);

    // A new target starts a fresh hunt.
    useEffect(() => {
        if (previousTarget.current !== target) {
            previousTarget.current = target;
            setVar("applyFoundUpper", false);
            setVar("applyFoundLower", false);
        }
    }, [target, setVar]);

    // Publish the sine size the identity predicts for this target.
    useEffect(() => {
        setVar("applySinMagnitude", Number(Math.sqrt(Math.max(1 - target * target, 0)).toFixed(2)));
    }, [target, setVar]);

    useEffect(() => {
        if (miss > HIT_TOLERANCE) return;
        if (sinValue > 0.05 && !foundUpper) setVar("applyFoundUpper", true);
        if (sinValue < -0.05 && !foundLower) setVar("applyFoundLower", true);
        setVar("applyExplored", true);
    }, [miss, sinValue, foundUpper, foundLower, setVar]);

    const pointX = CENTRE.x + RADIUS * cosValue;
    const pointY = CENTRE.y - RADIUS * sinValue;
    const targetX = CENTRE.x + RADIUS * target;
    const crossingOffset = RADIUS * Math.sqrt(Math.max(1 - target * target, 0));

    const isActive = (id: string) => highlight === id;
    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const dimOthers = highlight ? 0.35 : 1;
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("applyHighlight", id),
        onPointerLeave: () => setVar("applyHighlight", ""),
    });

    const updateFromPointer = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return;
        const bounds = svg.getBoundingClientRect();
        const x = ((clientX - bounds.left) / bounds.width) * VIEW_WIDTH - CENTRE.x;
        const y = CENTRE.y - ((clientY - bounds.top) / bounds.height) * VIEW_HEIGHT;
        setVar("applyAngle", Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360));
    };

    const foundCount = (foundUpper ? 1 : 0) + (foundLower ? 1 : 0);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A unit circle with a target cosine marked on the x-axis and a dot to steer around the rim"
        >
            <defs>
                <filter id="target-dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Axes and circle */}
            <g opacity={dimOthers} style={ease}>
                <line x1={45} y1={CENTRE.y} x2={325} y2={CENTRE.y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={CENTRE.x} y1={320} x2={CENTRE.x} y2={60} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx={CENTRE.x} cy={CENTRE.y} r={RADIUS} fill="none" stroke={INK_QUIET} strokeWidth="1.5" />
            </g>

            {/* The target on the x-axis, and the two rim positions that hit it */}
            <g opacity={dimOthers} style={ease}>
                <line
                    x1={targetX}
                    y1={CENTRE.y - crossingOffset}
                    x2={targetX}
                    y2={CENTRE.y + crossingOffset}
                    stroke={TARGET_HUE}
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                    opacity={0.75}
                />
                <polygon
                    points={`${targetX},${CENTRE.y} ${targetX - 7},${CENTRE.y + 13} ${targetX + 7},${CENTRE.y + 13}`}
                    fill={TARGET_HUE}
                />
                <text x={targetX + 10} y={CENTRE.y + 26} fill={TARGET_HUE} fontSize="11" textAnchor="start">
                    target
                </text>
                <circle
                    cx={targetX}
                    cy={CENTRE.y - crossingOffset}
                    r="9"
                    fill={foundUpper ? FOUND_HUE : "none"}
                    fillOpacity={foundUpper ? 0.25 : 0}
                    stroke={foundUpper ? FOUND_HUE : INK_QUIET}
                    strokeWidth="2"
                    strokeDasharray={foundUpper ? "0" : "3 3"}
                />
                <circle
                    cx={targetX}
                    cy={CENTRE.y + crossingOffset}
                    r="9"
                    fill={foundLower ? FOUND_HUE : "none"}
                    fillOpacity={foundLower ? 0.25 : 0}
                    stroke={foundLower ? FOUND_HUE : INK_QUIET}
                    strokeWidth="2"
                    strokeDasharray={foundLower ? "0" : "3 3"}
                />
            </g>

            {/* The radius and the drop line down to the axis */}
            <g opacity={dim("cos")} style={ease} {...hoverProps("cos")}>
                {isActive("cos") && (
                    <line x1={CENTRE.x} y1={CENTRE.y} x2={pointX} y2={CENTRE.y} stroke={COS_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={CENTRE.x}
                    y1={CENTRE.y}
                    x2={pointX}
                    y2={CENTRE.y}
                    stroke={COS_HUE}
                    strokeWidth={isActive("cos") ? 5 : 3.2}
                    strokeLinecap="round"
                    style={ease}
                />
                <line x1={pointX} y1={pointY} x2={pointX} y2={CENTRE.y} stroke={INK_QUIET} strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* The vertical coordinate */}
            <g opacity={dim("sin")} style={ease} {...hoverProps("sin")}>
                {isActive("sin") && (
                    <line x1={pointX} y1={CENTRE.y} x2={pointX} y2={pointY} stroke={SIN_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={pointX}
                    y1={CENTRE.y}
                    x2={pointX}
                    y2={pointY}
                    stroke={SIN_HUE}
                    strokeWidth={isActive("sin") ? 5 : 3.2}
                    strokeLinecap="round"
                    style={ease}
                />
            </g>

            {/* The steerable dot */}
            <g opacity={dimOthers} style={ease}>
                <line x1={CENTRE.x} y1={CENTRE.y} x2={pointX} y2={pointY} stroke={RADIUS_HUE} strokeWidth="2.8" strokeLinecap="round" />
                <g transform={`translate(${pointX} ${pointY}) scale(${handleScale})`}>
                    <circle r="9" fill={HANDLE_HUE} filter="url(#target-dot-shadow)" />
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

            {/* Readouts, in a column beside the circle */}
            <g opacity={dimOthers} style={ease}>
                <text x={VIEW_WIDTH - PAD} y={96} fill={TARGET_HUE} fontSize="13" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`target cos θ = ${fmtRatio(target)}`}
                </text>
                <text x={VIEW_WIDTH - PAD} y={120} fill={COS_HUE} fontSize="13" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`your cos θ = ${fmtRatio(cosValue)}`}
                </text>
                <text
                    x={VIEW_WIDTH - PAD}
                    y={144}
                    fill={miss <= HIT_TOLERANCE ? FOUND_HUE : INK_STRUCTURE}
                    fontSize="13"
                    textAnchor="end"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {miss <= HIT_TOLERANCE ? "on target" : `miss = ${fmtRatio(miss)}`}
                </text>
                <text x={VIEW_WIDTH - PAD} y={180} fill={SIN_HUE} fontSize="13" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`sin θ = ${fmtRatio(sinValue)}`}
                </text>
                <text x={VIEW_WIDTH - PAD} y={212} fill={INK} fontSize="13" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`found ${foundCount} of 2`}
                </text>
                <text x={PAD} y={352} fill={ANGLE_HUE} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`θ = ${Math.round(angle)}°`}
                </text>
            </g>
        </svg>
    );
}

function TargetCosineFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="target-cosine-hunt"
            onReset={() => {
                setVar("applyAngle", 20);
                setVar("applyTargetCos", 0.6);
                setVar("applyFoundUpper", false);
                setVar("applyFoundLower", false);
                setVar("applyHighlight", "");
            }}
            caption="Steer the teal dot until its dashed drop line lands on the amber target. There are two places on the rim that manage it, one above the axis and one below."
        >
            <TargetCosineDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="applyTargetCos"
                    label="Target cos θ"
                    {...numberPropsFromDefinition(getVariableInfo("applyTargetCos"))}
                    formatValue={(v) => v.toFixed(2)}
                />
            </div>
            <InteractionHintSequence
                hintKey="target-cosine-steer"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Steer the teal dot onto the amber target",
                        position: { x: "57%", y: "36%" },
                        dragPath: { type: "arc", startAngle: -20, endAngle: -55, radius: 38 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const oneRatioGivesTheOtherBlocks: ReactElement[] = [
    <StackLayout key="layout-apply-heading" maxWidth="xl">
        <Block id="apply-heading" padding="md">
            <EditableH2 id="h2-apply-heading" blockId="apply-heading">
                Finding cos θ from sin θ
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-setup" maxWidth="xl">
        <Block id="apply-setup" padding="sm">
            <EditableParagraph id="para-apply-setup" blockId="apply-setup" className={POINT_LIST_CLASS}>
                <Point>The identity earns its keep the moment you know one ratio and need the other.</Point>
                <Point>
                    Say{" "}
                    <InlineFormula latex="\clr{cos}{\cos}\clr{angle}{\theta} = \clr{target}{0.6}" colorMap={{ angle: ANGLE_HUE, cos: COS_HUE, target: TARGET_HUE }} />
                    : then{" "}
                    <InlineFormula
                        latex="\clr{sin}{\sin^2}\clr{angle}{\theta} = \clr{total}{1} - \clr{cos}{0.36} = \clr{sin}{0.64}"
                        colorMap={{ angle: ANGLE_HUE, cos: COS_HUE, sin: SIN_HUE, total: TOTAL_HUE }}
                    />
                    , so{" "}
                    <InlineFormula latex="\clr{sin}{\sin}\clr{angle}{\theta} = \pm\,\clr{sin}{0.8}" colorMap={{ angle: ANGLE_HUE, sin: SIN_HUE }} />
                    .
                </Point>
                <Point>
                    Steer the{" "}
                    <InlineSpotColor varName="applyAngle" {...spotColorPropsFromDefinition(getVariableInfo("applyAngle"))}>
                        teal dot
                    </InlineSpotColor>
                    {" "}round the rim until its dashed line lands on the{" "}
                    <InlineSpotColor varName="applyTargetCos" {...spotColorPropsFromDefinition(getVariableInfo("applyTargetCos"))}>
                        amber target
                    </InlineSpotColor>
                    .
                </Point>
                <Point>
                    Then go hunting for the second spot that hits it too, and try a target on the far side like{" "}
                    <InlineTrigger varName="applyTargetCos" value={-0.5} icon="zap">
                        -0.50
                    </InlineTrigger>
                    .
                </Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-formula" maxWidth="xl">
        <Block id="apply-formula" padding="lg">
            <FormulaBlock
                latex="\clr{sin}{\sin}\clr{angle}{\theta} = \choice{answerApplySign}\sqrt{\clr{total}{1} - \left(\clr{target}{\scrub{applyTargetCos}}\right)^2} = \pm\,\clr{sin}{\val{applySinMagnitude}}"
                colorMap={{ angle: ANGLE_HUE, sin: SIN_HUE, total: TOTAL_HUE, target: TARGET_HUE }}
                variables={scrubVarsFromDefinitions(["applyTargetCos", "applySinMagnitude"])}
                clozeChoices={{
                    answerApplySign: {
                        correctAnswer: "\u00b1",
                        options: ["+", "\u2212", "\u00b1"],
                        placeholder: "???",
                        color: SIN_HUE,
                        bgColor: "rgba(172, 139, 249, 0.20)",
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-visual" maxWidth="xl">
        <Block id="apply-visual" padding="sm" hasVisualization>
            <TargetCosineFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-apply-sign" maxWidth="xl">
        <Block id="apply-sign" padding="sm">
            <EditableParagraph id="para-apply-sign" blockId="apply-sign" className={POINT_LIST_CLASS}>
                <Point>That ± is not the maths being vague.</Point>
                <Point>
                    Two points on the circle share a cosine of{" "}
                    <InlineScrubbleNumber
                        varName="applyTargetCos"
                        {...numberPropsFromDefinition(getVariableInfo("applyTargetCos"))}
                        formatValue={(v) => v.toFixed(2)}
                    />
                    , one above the axis and one below.
                </Point>
                <Point>
                    <InlineLinkedHighlight
                        varName="applyHighlight"
                        highlightId="sin"
                        {...linkedHighlightPropsFromDefinition(getVariableInfo("applyHighlight"))}
                    >
                        Their sines
                    </InlineLinkedHighlight>
                    {" "}are opposite: jump to{" "}
                    <InlineTrigger varName="applyAngle" value={53} icon="play">
                        the crossing above the axis
                    </InlineTrigger>
                    {" "}or{" "}
                    <InlineTrigger varName="applyAngle" value={307} icon="play">
                        the one below
                    </InlineTrigger>
                    {" "}and compare. Knowing the{" "}
                    <InlineTooltip id="tooltip-apply-quadrant" tooltip="Which of the four regions of the circle the angle lands in. It fixes whether each coordinate comes out positive or negative.">
                        quadrant
                    </InlineTooltip>
                    {" "}is what tells you which sign to keep.
                </Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
