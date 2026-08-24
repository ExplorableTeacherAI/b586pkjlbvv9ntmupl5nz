import { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useRafLoop, useSpring } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 540;
const VIEW_HEIGHT = 360;
const PAD = 24;
const CENTRE = { x: 150, y: 175 };
const RADIUS = 115; // pixels for one unit — shared by the circle AND the bars

const BAR_ZERO_Y = CENTRE.y; // the bars' zero line sits at the circle's centre height
const COS_BAR_X = 366;
const SIN_BAR_X = 452;
const BAR_WIDTH = 46;
const SCALE_X = 322;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const COS_HUE = "#8E90F5";
const SIN_HUE = "#AC8BF9";
const HANDLE_HUE = "#62D0AD";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const fmtRatio = (value: number) => value.toFixed(2);

const trailPath = (sweep: number) => {
    const clamped = Math.min(Math.max(sweep, 0), 360);
    if (clamped >= 359.5) {
        return `M ${CENTRE.x + RADIUS} ${CENTRE.y} A ${RADIUS} ${RADIUS} 0 1 0 ${CENTRE.x - RADIUS} ${CENTRE.y} A ${RADIUS} ${RADIUS} 0 1 0 ${CENTRE.x + RADIUS} ${CENTRE.y}`;
    }
    const end = {
        x: CENTRE.x + RADIUS * Math.cos(toRadians(clamped)),
        y: CENTRE.y - RADIUS * Math.sin(toRadians(clamped)),
    };
    return `M ${CENTRE.x + RADIUS} ${CENTRE.y} A ${RADIUS} ${RADIUS} 0 ${clamped > 180 ? 1 : 0} 0 ${end.x} ${end.y}`;
};

// ── The bespoke drawing ──────────────────────────────────────────────────────

function WalkingDotDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("quadrantAngle", 40);
    const trailMax = useVar<number>("quadrantTrailMax", 40);
    const playing = useVar<boolean>("quadrantPlaying", false);
    const highlight = useVar<string>("quadrantHighlight", "");
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const angleRef = useRef(angle);
    angleRef.current = angle;

    const handleScale = useSpring(dragging || hovered ? 1.25 : 1, { stiffness: 400, damping: 26 });

    useEffect(() => {
        if (angle > trailMax) setVar("quadrantTrailMax", angle);
        if (angle >= 200) setVar("quadrantExplored", true);
    }, [angle, trailMax, setVar]);

    useRafLoop(
        (dt) => {
            const next = (angleRef.current + 55 * dt) % 360;
            setVar("quadrantAngle", Math.round(next));
        },
        { paused: !playing || dragging },
    );

    const radians = toRadians(angle);
    const cosValue = Math.cos(radians);
    const sinValue = Math.sin(radians);
    const pointX = CENTRE.x + RADIUS * cosValue;
    const pointY = CENTRE.y - RADIUS * sinValue;

    const isActive = (id: string) => highlight === id;
    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const dimOthers = highlight ? 0.35 : 1;
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("quadrantHighlight", id),
        onPointerLeave: () => setVar("quadrantHighlight", ""),
    });

    const updateFromPointer = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return;
        const bounds = svg.getBoundingClientRect();
        const x = ((clientX - bounds.left) / bounds.width) * VIEW_WIDTH - CENTRE.x;
        const y = CENTRE.y - ((clientY - bounds.top) / bounds.height) * VIEW_HEIGHT;
        const degrees = (Math.atan2(y, x) * 180) / Math.PI;
        setVar("quadrantAngle", Math.round((degrees + 360) % 360));
    };

    const barTip = (value: number) => BAR_ZERO_Y - RADIUS * value;
    const bar = (value: number) => ({
        y: value >= 0 ? BAR_ZERO_Y - RADIUS * value : BAR_ZERO_Y,
        height: Math.abs(RADIUS * value),
    });
    const cosBar = bar(cosValue);
    const sinBar = bar(sinValue);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A dot walking round the unit circle beside two bars showing cosine and sine"
        >
            <defs>
                <filter id="walking-dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Axes, quadrant labels and the circle */}
            <g opacity={dimOthers} style={ease}>
                <line x1={28} y1={CENTRE.y} x2={278} y2={CENTRE.y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={CENTRE.x} y1={300} x2={CENTRE.x} y2={50} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx={CENTRE.x} cy={CENTRE.y} r={RADIUS} fill="none" stroke={INK_QUIET} strokeWidth="1.5" />
                <text x={CENTRE.x + 66} y={CENTRE.y - 58} fill="#CBD5E1" fontSize="11" textAnchor="middle">I</text>
                <text x={CENTRE.x - 66} y={CENTRE.y - 58} fill="#CBD5E1" fontSize="11" textAnchor="middle">II</text>
                <text x={CENTRE.x - 66} y={CENTRE.y + 66} fill="#CBD5E1" fontSize="11" textAnchor="middle">III</text>
                <text x={CENTRE.x + 66} y={CENTRE.y + 66} fill="#CBD5E1" fontSize="11" textAnchor="middle">IV</text>
            </g>

            {/* The trail the dot has left behind */}
            <g opacity={dimOthers} style={ease}>
                <path d={trailPath(trailMax)} fill="none" stroke={HANDLE_HUE} strokeWidth="6" opacity={0.22} strokeLinecap="round" />
                <path d={trailPath(angle)} fill="none" stroke={HANDLE_HUE} strokeWidth="2.5" opacity={0.75} strokeLinecap="round" />
            </g>

            {/* Radius */}
            <g opacity={dimOthers} style={ease}>
                <line x1={CENTRE.x} y1={CENTRE.y} x2={pointX} y2={pointY} stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Horizontal coordinate — cos θ — in the circle and as a bar */}
            <g opacity={dim("cos")} style={ease} {...hoverProps("cos")}>
                {isActive("cos") && (
                    <>
                        <line x1={CENTRE.x} y1={CENTRE.y} x2={pointX} y2={CENTRE.y} stroke={COS_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                        <rect x={COS_BAR_X - 3} y={cosBar.y - 3} width={BAR_WIDTH + 6} height={cosBar.height + 6} fill="none" stroke={COS_HUE} strokeWidth="9" opacity={0.28} rx={3} />
                    </>
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
                <rect
                    x={COS_BAR_X}
                    y={cosBar.y}
                    width={BAR_WIDTH}
                    height={cosBar.height}
                    fill={COS_HUE}
                    fillOpacity={0.3}
                    stroke={COS_HUE}
                    strokeWidth={isActive("cos") ? 3.5 : 2}
                    rx={2}
                    style={ease}
                />
                <text
                    x={COS_BAR_X + BAR_WIDTH / 2}
                    y={cosValue >= 0 ? barTip(cosValue) - 8 : barTip(cosValue) + 16}
                    fill={COS_HUE}
                    fontSize="12"
                    textAnchor="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {fmtRatio(cosValue)}
                </text>
                <text x={COS_BAR_X + BAR_WIDTH / 2} y={324} fill={COS_HUE} fontSize="12" textAnchor="middle">cos θ</text>
            </g>

            {/* Vertical coordinate — sin θ — in the circle and as a bar */}
            <g opacity={dim("sin")} style={ease} {...hoverProps("sin")}>
                {isActive("sin") && (
                    <>
                        <line x1={pointX} y1={CENTRE.y} x2={pointX} y2={pointY} stroke={SIN_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                        <rect x={SIN_BAR_X - 3} y={sinBar.y - 3} width={BAR_WIDTH + 6} height={sinBar.height + 6} fill="none" stroke={SIN_HUE} strokeWidth="9" opacity={0.28} rx={3} />
                    </>
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
                <rect
                    x={SIN_BAR_X}
                    y={sinBar.y}
                    width={BAR_WIDTH}
                    height={sinBar.height}
                    fill={SIN_HUE}
                    fillOpacity={0.3}
                    stroke={SIN_HUE}
                    strokeWidth={isActive("sin") ? 3.5 : 2}
                    rx={2}
                    style={ease}
                />
                <text
                    x={SIN_BAR_X + BAR_WIDTH / 2}
                    y={sinValue >= 0 ? barTip(sinValue) - 8 : barTip(sinValue) + 16}
                    fill={SIN_HUE}
                    fontSize="12"
                    textAnchor="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {fmtRatio(sinValue)}
                </text>
                <text x={SIN_BAR_X + BAR_WIDTH / 2} y={324} fill={SIN_HUE} fontSize="12" textAnchor="middle">sin θ</text>
            </g>

            {/* The bars' scale and zero line */}
            <g opacity={dimOthers} style={ease}>
                <line x1={330} y1={BAR_ZERO_Y} x2={508} y2={BAR_ZERO_Y} stroke={INK_STRUCTURE} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={330} y1={BAR_ZERO_Y - RADIUS} x2={508} y2={BAR_ZERO_Y - RADIUS} stroke={INK_QUIET} strokeWidth="1" strokeDasharray="4 4" />
                <line x1={330} y1={BAR_ZERO_Y + RADIUS} x2={508} y2={BAR_ZERO_Y + RADIUS} stroke={INK_QUIET} strokeWidth="1" strokeDasharray="4 4" />
                <text x={SCALE_X} y={BAR_ZERO_Y - RADIUS + 4} fill={INK_STRUCTURE} fontSize="11" textAnchor="end">1</text>
                <text x={SCALE_X} y={BAR_ZERO_Y + 4} fill={INK_STRUCTURE} fontSize="11" textAnchor="end">0</text>
                <text x={SCALE_X} y={BAR_ZERO_Y + RADIUS + 4} fill={INK_STRUCTURE} fontSize="11" textAnchor="end">-1</text>
            </g>

            {/* The walking dot */}
            <g opacity={dimOthers} style={ease}>
                <g transform={`translate(${pointX} ${pointY}) scale(${handleScale})`}>
                    <circle r="9" fill={HANDLE_HUE} filter="url(#walking-dot-shadow)" />
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
                        setVar("quadrantPlaying", false);
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

            {/* Readouts */}
            <g opacity={dimOthers} style={ease}>
                <text x={PAD} y={42} fill={INK} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`θ = ${Math.round(angle)}°`}
                </text>
                <text x={PAD} y={334} fill={INK} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`sin²θ + cos²θ = ${fmtRatio(sinValue * sinValue + cosValue * cosValue)}`}
                </text>
            </g>
        </svg>
    );
}

function WalkingDotFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="quadrant-walking-dot"
            playable
            playVarName="quadrantPlaying"
            onReset={() => {
                setVar("quadrantAngle", 40);
                setVar("quadrantTrailMax", 40);
                setVar("quadrantPlaying", false);
                setVar("quadrantHighlight", "");
            }}
            caption="Walk the teal dot round the whole circle, or press play. Each bar drops below its zero line the moment the dot crosses an axis, yet the total underneath never budges from 1."
        >
            <WalkingDotDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="quadrantAngle"
                    label="Angle θ"
                    {...numberPropsFromDefinition(getVariableInfo("quadrantAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
            </div>
            <InteractionHintSequence
                hintKey="quadrant-walking-dot-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Walk the teal dot right round past 90°",
                        position: { x: "34%", y: "36%" },
                        dragPath: { type: "arc", startAngle: -40, endAngle: -160, radius: 40 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const turningPastNinetyBlocks: ReactElement[] = [
    <StackLayout key="layout-quadrants-heading" maxWidth="xl">
        <Block id="quadrants-heading" padding="md">
            <EditableH2 id="h2-quadrants-heading" blockId="quadrants-heading">
                Turning Past 90°
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-setup" maxWidth="xl">
        <Block id="quadrants-setup" padding="sm">
            <EditableParagraph id="para-quadrants-setup" blockId="quadrants-setup">
                A right-angled triangle runs out of angles at 90°, but a turntable does not. Walk the
                teal dot on past the top of the circle and into the second quadrant, where the
                horizontal distance is now measured to the left.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-visual" maxWidth="xl">
        <Block id="quadrants-visual" padding="sm" hasVisualization>
            <WalkingDotFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-signs" maxWidth="xl">
        <Block id="quadrants-signs" padding="sm">
            <EditableParagraph id="para-quadrants-signs" blockId="quadrants-signs">
                Sine and cosine are coordinates, not lengths, so they are quite happy being negative,
                and the{" "}
                <InlineLinkedHighlight
                    varName="quadrantHighlight"
                    highlightId="cos"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("quadrantHighlight"))}
                >
                    cosine bar
                </InlineLinkedHighlight>
                {" "}dips below its zero line as soon as the dot crosses the top. Squaring, though,
                wipes the sign out completely. Whichever quadrant the dot wanders into, sin²θ + cos²θ
                still comes to exactly 1.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-range" maxWidth="xl">
        <Block id="quadrants-range" padding="sm">
            <EditableParagraph id="para-quadrants-range" blockId="quadrants-range">
                At θ ={" "}
                <InlineScrubbleNumber
                    varName="quadrantAngle"
                    {...numberPropsFromDefinition(getVariableInfo("quadrantAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
                {" "}or any other angle you like, neither coordinate can escape the range −1 to 1,
                because the radius is pinned at 1.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-question-sign" maxWidth="xl">
        <Block id="quadrants-question-sign" padding="sm">
            <EditableParagraph id="para-quadrants-question-sign" blockId="quadrants-question-sign">
                <RevealOnInteraction varName="quadrantExplored">
                    An angle of 210° puts the dot in the third quadrant, below and to the left of the
                    centre. Its cosine is therefore{" "}
                    <InlineFeedback
                        varName="answerQuadrantCosSign"
                        correctValue="negative"
                        position="terminal"
                        successMessage="— correct, the dot is left of the centre, so its across coordinate carries a minus sign"
                        failureMessage="— have another look."
                        hint="Cosine is the across coordinate, and left of the centre counts as negative"
                        visualizationHint={{
                            blockId: "quadrants-visual",
                            hintKey: "feedback-quadrant-sign-hint",
                            steps: [
                                {
                                    gesture: "drag-circular",
                                    label: "Walk the dot round to 210° and watch the cosine bar",
                                    position: { x: "34%", y: "36%" },
                                    dragPath: { type: "arc", startAngle: -40, endAngle: 150, radius: 40 },
                                    completionVar: "quadrantAngle",
                                    completionValue: 210,
                                    completionTolerance: 12,
                                },
                            ],
                            label: "Discover it yourself",
                            resetVars: { quadrantAngle: 40, quadrantPlaying: false },
                        }}
                    >
                        <InlineClozeChoice
                            varName="answerQuadrantCosSign"
                            correctAnswer="negative"
                            options={["positive", "negative", "zero"]}
                            {...choicePropsFromDefinition(getVariableInfo("answerQuadrantCosSign"))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quadrants-question-identity" maxWidth="xl">
        <Block id="quadrants-question-identity" padding="sm">
            <EditableParagraph id="para-quadrants-question-identity" blockId="quadrants-question-identity">
                <RevealOnInteraction varName="quadrantExplored">
                    At that same 210°, both coordinates are negative. The value of sin²θ + cos²θ there
                    is{" "}
                    <InlineFeedback
                        varName="answerQuadrantIdentity"
                        correctValue={["1", "1.0", "one"]}
                        position="terminal"
                        successMessage="— yes, two negatives squared turn positive, so the total is 1 in every quadrant"
                        failureMessage="— not quite."
                        hint="A negative number squared comes out positive, so the signs never survive the squaring"
                        visualizationHint={{
                            blockId: "quadrants-visual",
                            hintKey: "feedback-quadrant-identity-hint",
                            steps: [
                                {
                                    gesture: "drag-circular",
                                    label: "Walk the dot to 210° and read the total on the right",
                                    position: { x: "34%", y: "36%" },
                                    dragPath: { type: "arc", startAngle: -40, endAngle: 150, radius: 40 },
                                    completionVar: "quadrantAngle",
                                    completionValue: 210,
                                    completionTolerance: 12,
                                },
                            ],
                            label: "Discover it yourself",
                            resetVars: { quadrantAngle: 40, quadrantPlaying: false },
                        }}
                    >
                        <InlineClozeInput
                            varName="answerQuadrantIdentity"
                            correctAnswer={["1", "1.0", "one"]}
                            {...clozePropsFromDefinition(getVariableInfo("answerQuadrantIdentity"))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
