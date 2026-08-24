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
import { Figure, FigureSlider, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { lerp, useSpring } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 540;
const VIEW_HEIGHT = 400;
const PAD = 24;
const UNIT = 92; // pixels for one unit of length
const CORNER = { x: 110, y: 215 }; // right-angle corner of the triangle
const UNIT_SQUARE = { x: 370, y: 123, size: UNIT }; // the empty square of side 1

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const COS_HUE = "#8E90F5";
const SIN_HUE = "#AC8BF9";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const fmtArea = (value: number) => value.toFixed(2);

type Rect = { x: number; y: number; w: number; h: number };

const labelSpot = (rect: Rect) =>
    rect.w >= 46 && rect.h >= 20
        ? { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 + 4, anchor: "middle" as const }
        : {
              x: Math.min(rect.x + rect.w + 8, VIEW_WIDTH - PAD - 40),
              y: rect.y + rect.h / 2 + 4,
              anchor: "start" as const,
          };

// ── One packable square ──────────────────────────────────────────────────────

interface PackableSquareProps {
    home: Rect;
    dock: Rect;
    placed: boolean;
    hue: string;
    patternId: string;
    label: string;
    dimmed: number;
    highlighted: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
    onDrop: (insideDock: boolean) => void;
    onHover: (entering: boolean) => void;
}

function PackableSquare({
    home,
    dock,
    placed,
    hue,
    patternId,
    label,
    dimmed,
    highlighted,
    svgRef,
    onDrop,
    onHover,
}: PackableSquareProps) {
    const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
    const startRef = useRef<{ clientX: number; clientY: number } | null>(null);

    const t = useSpring(placed ? 1 : 0, { stiffness: 150, damping: 19 });
    const springX = useSpring(drag ? drag.x : 0, { stiffness: 240, damping: 26 });
    const springY = useSpring(drag ? drag.y : 0, { stiffness: 240, damping: 26 });

    const offsetX = drag ? drag.x : springX;
    const offsetY = drag ? drag.y : springY;

    const rect: Rect = {
        x: lerp(home.x, dock.x, t) + offsetX,
        y: lerp(home.y, dock.y, t) + offsetY,
        w: lerp(home.w, dock.w, t),
        h: lerp(home.h, dock.h, t),
    };

    const toViewBox = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const bounds = svg.getBoundingClientRect();
        return {
            x: ((clientX - bounds.left) / bounds.width) * VIEW_WIDTH,
            y: ((clientY - bounds.top) / bounds.height) * VIEW_HEIGHT,
        };
    };

    const spot = labelSpot(rect);

    return (
        <g
            opacity={dimmed}
            style={{ transition: "opacity 150ms ease-out" }}
            onPointerEnter={() => onHover(true)}
            onPointerLeave={() => onHover(false)}
        >
            {highlighted && (
                <rect
                    x={rect.x - 3}
                    y={rect.y - 3}
                    width={Math.max(rect.w + 6, 0)}
                    height={Math.max(rect.h + 6, 0)}
                    fill="none"
                    stroke={hue}
                    strokeWidth={9}
                    opacity={0.28}
                    rx={4}
                />
            )}
            <rect
                x={rect.x}
                y={rect.y}
                width={Math.max(rect.w, 0)}
                height={Math.max(rect.h, 0)}
                fill={`url(#${patternId})`}
                stroke={hue}
                strokeWidth={highlighted ? 3.5 : 2}
                strokeLinejoin="round"
                rx={2}
                style={{ cursor: drag ? "grabbing" : "grab", touchAction: "none", transition: "stroke-width 150ms ease-out" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    startRef.current = { clientX: event.clientX, clientY: event.clientY };
                    setDrag({ x: 0, y: 0 });
                }}
                onPointerMove={(event) => {
                    if (!startRef.current || !svgRef.current) return;
                    const bounds = svgRef.current.getBoundingClientRect();
                    const scale = VIEW_WIDTH / bounds.width;
                    setDrag({
                        x: (event.clientX - startRef.current.clientX) * scale,
                        y: (event.clientY - startRef.current.clientY) * scale,
                    });
                }}
                onPointerUp={(event) => {
                    const point = toViewBox(event.clientX, event.clientY);
                    const inside =
                        point.x > UNIT_SQUARE.x - 30 &&
                        point.x < UNIT_SQUARE.x + UNIT_SQUARE.size + 30 &&
                        point.y > UNIT_SQUARE.y - 30 &&
                        point.y < UNIT_SQUARE.y + UNIT_SQUARE.size + 30;
                    startRef.current = null;
                    setDrag(null);
                    onDrop(inside);
                }}
                onPointerCancel={() => {
                    startRef.current = null;
                    setDrag(null);
                }}
            />
            <text
                x={spot.x}
                y={spot.y}
                fill={hue}
                fontSize="12"
                textAnchor={spot.anchor}
                style={{ pointerEvents: "none" }}
            >
                {label}
            </text>
        </g>
    );
}

// ── The bespoke drawing ──────────────────────────────────────────────────────

function BrickSquaresDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("unitCircleAngle", 35);
    const cosPlaced = useVar<boolean>("squaresCosPlaced", false);
    const sinPlaced = useVar<boolean>("squaresSinPlaced", false);
    const highlight = useVar<string>("squaresHighlight", "");
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (cosPlaced && sinPlaced) setVar("squaresExplored", true);
    }, [cosPlaced, sinPlaced, setVar]);

    const radians = toRadians(angle);
    const cosValue = Math.cos(radians);
    const sinValue = Math.sin(radians);
    const cosLength = UNIT * cosValue;
    const sinLength = UNIT * sinValue;

    const apex = { x: CORNER.x + cosLength, y: CORNER.y - sinLength };

    // Home positions: a real square built outward on each shorter side.
    const cosHome: Rect = { x: CORNER.x, y: CORNER.y, w: cosLength, h: cosLength };
    const sinHome: Rect = { x: apex.x, y: apex.y, w: sinLength, h: sinLength };

    // Docked positions: the same area, reshaped into a full-width strip.
    const unitBottom = UNIT_SQUARE.y + UNIT_SQUARE.size;
    const cosStripHeight = UNIT * cosValue * cosValue;
    const sinStripHeight = UNIT * sinValue * sinValue;
    const cosDock: Rect = { x: UNIT_SQUARE.x, y: unitBottom - cosStripHeight, w: UNIT, h: cosStripHeight };
    const sinDock: Rect = {
        x: UNIT_SQUARE.x,
        y: unitBottom - (cosPlaced ? cosStripHeight : 0) - sinStripHeight,
        w: UNIT,
        h: sinStripHeight,
    };

    const isActive = (id: string) => highlight === id;
    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const dimOthers = highlight ? 0.35 : 1;
    const ease = { transition: "opacity 150ms ease-out" };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="Squares built on the two shorter sides of a right triangle, packed into a square of side one"
        >
            <defs>
                <pattern id="cos-studs" patternUnits="userSpaceOnUse" width="12" height="12">
                    <rect width="12" height="12" fill={COS_HUE} fillOpacity="0.16" />
                    <circle cx="6" cy="6" r="2.4" fill={COS_HUE} fillOpacity="0.45" />
                </pattern>
                <pattern id="sin-studs" patternUnits="userSpaceOnUse" width="12" height="12">
                    <rect width="12" height="12" fill={SIN_HUE} fillOpacity="0.16" />
                    <circle cx="6" cy="6" r="2.4" fill={SIN_HUE} fillOpacity="0.45" />
                </pattern>
            </defs>

            {/* The triangle the squares are built on */}
            <g opacity={dimOthers} style={ease}>
                <polygon
                    points={`${CORNER.x},${CORNER.y} ${apex.x},${CORNER.y} ${apex.x},${apex.y}`}
                    fill="#F8FAFC"
                    stroke={INK_STRUCTURE}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <line
                    x1={CORNER.x}
                    y1={CORNER.y}
                    x2={apex.x}
                    y2={apex.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <text
                    x={CORNER.x + cosLength / 2 - 12 * sinValue}
                    y={CORNER.y - sinLength / 2 - 10 * cosValue}
                    fill={INK_STRUCTURE}
                    fontSize="12"
                    textAnchor="middle"
                >
                    1
                </text>
            </g>

            {/* The empty square of side 1 */}
            <g opacity={dimOthers} style={ease}>
                <rect
                    x={UNIT_SQUARE.x}
                    y={UNIT_SQUARE.y}
                    width={UNIT_SQUARE.size}
                    height={UNIT_SQUARE.size}
                    fill="#FFFFFF"
                    stroke={INK_QUIET}
                    strokeWidth="2"
                    strokeDasharray="6 5"
                    rx={2}
                />
                <text x={UNIT_SQUARE.x + UNIT_SQUARE.size / 2} y={UNIT_SQUARE.y - 10} fill={INK_STRUCTURE} fontSize="12" textAnchor="middle">
                    1
                </text>
                <text x={UNIT_SQUARE.x - 10} y={UNIT_SQUARE.y + UNIT_SQUARE.size / 2 + 4} fill={INK_STRUCTURE} fontSize="12" textAnchor="end">
                    1
                </text>
            </g>

            <PackableSquare
                home={cosHome}
                dock={cosDock}
                placed={cosPlaced}
                hue={COS_HUE}
                patternId="cos-studs"
                label="cos²θ"
                dimmed={dim("cos")}
                highlighted={isActive("cos")}
                svgRef={svgRef}
                onDrop={(inside) => setVar("squaresCosPlaced", inside)}
                onHover={(entering) => setVar("squaresHighlight", entering ? "cos" : "")}
            />

            <PackableSquare
                home={sinHome}
                dock={sinDock}
                placed={sinPlaced}
                hue={SIN_HUE}
                patternId="sin-studs"
                label="sin²θ"
                dimmed={dim("sin")}
                highlighted={isActive("sin")}
                svgRef={svgRef}
                onDrop={(inside) => setVar("squaresSinPlaced", inside)}
                onHover={(entering) => setVar("squaresHighlight", entering ? "sin" : "")}
            />

            {/* Readouts, below the drawing */}
            <g opacity={dimOthers} style={ease}>
                <text x={PAD} y={372} fill={INK} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`θ = ${Math.round(angle)}°`}
                </text>
                <text
                    x={VIEW_WIDTH - PAD}
                    y={372}
                    fill={INK}
                    fontSize="13"
                    textAnchor="end"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    cos²θ + sin²θ = <tspan fill={COS_HUE}>{fmtArea(cosValue * cosValue)}</tspan> +{" "}
                    <tspan fill={SIN_HUE}>{fmtArea(sinValue * sinValue)}</tspan> ={" "}
                    {fmtArea(cosValue * cosValue + sinValue * sinValue)}
                </text>
            </g>
        </svg>
    );
}

function BrickSquaresFigure() {
    const setVar = useSetVar();
    const cosPlaced = useVar<boolean>("squaresCosPlaced", false);
    const sinPlaced = useVar<boolean>("squaresSinPlaced", false);
    const step = (cosPlaced ? 1 : 0) + (sinPlaced ? 1 : 0);

    return (
        <Figure
            id="brick-squares-packing"
            onReset={() => {
                setVar("squaresCosPlaced", false);
                setVar("squaresSinPlaced", false);
                setVar("unitCircleAngle", 35);
                setVar("squaresHighlight", "");
            }}
            caption="Drag each brick-tiled square across into the dashed square of side 1. Whatever the angle, the two of them fill it exactly, with nothing spare and nothing missing."
        >
            <BrickSquaresDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="unitCircleAngle"
                    label="Angle θ"
                    {...numberPropsFromDefinition(getVariableInfo("unitCircleAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
            </div>
            <InteractionHintSequence
                hintKey="brick-squares-pack"
                currentStep={Math.min(step, 1)}
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the indigo square into the dashed square",
                        position: { x: "33%", y: "58%" },
                        dragPath: { type: "line", startOffset: { x: -20, y: 10 }, endOffset: { x: 30, y: -14 } },
                    },
                    {
                        gesture: "drag",
                        label: "Now bring the purple square in too",
                        position: { x: "45%", y: "40%" },
                        dragPath: { type: "line", startOffset: { x: -20, y: 6 }, endOffset: { x: 30, y: -10 } },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const squaresNotDoublesBlocks: ReactElement[] = [
    <StackLayout key="layout-squares-heading" maxWidth="xl">
        <Block id="squares-heading" padding="md">
            <EditableH2 id="h2-squares-heading" blockId="squares-heading">
                Squares, Not Doubles
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-setup" maxWidth="xl">
        <Block id="squares-setup" padding="sm">
            <EditableParagraph id="para-squares-setup" blockId="squares-setup">
                Pythagoras says the two shorter sides of a right triangle, each squared, add up to the
                hypotenuse squared. At θ ={" "}
                <InlineScrubbleNumber
                    varName="unitCircleAngle"
                    {...numberPropsFromDefinition(getVariableInfo("unitCircleAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
                {" "}a real square sits on each shorter side, so drag them both across into the empty
                square of side 1 and see whether they fit.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-block-1787555587803" maxWidth="xl">
        <Block id="block-1787555587803" padding="sm">
            <EditableParagraph id="para-block-1787555587803" blockId="block-1787555587803">/</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-visual" maxWidth="xl">
        <Block id="squares-visual" padding="sm" hasVisualization>
            <BrickSquaresFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-formula" maxWidth="xl">
        <Block id="squares-formula" padding="lg">
            <FormulaBlock
                latex="\clr{sin}{\sin^2\theta} + \clr{cos}{\cos^2\theta} = 1"
                colorMap={{ sin: SIN_HUE, cos: COS_HUE }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-notation" maxWidth="xl">
        <Block id="squares-notation" padding="sm">
            <EditableParagraph id="para-squares-notation" blockId="squares-notation">
                Notice what{" "}
                <InlineLinkedHighlight
                    varName="squaresHighlight"
                    highlightId="sin"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("squaresHighlight"))}
                    color={SIN_HUE}
                    bgColor="rgba(172, 139, 249, 0.20)"
                >
                    sin²θ
                </InlineLinkedHighlight>
                {" "}really is: the area of a square whose side is sin θ. Take the sine first, then
                square the answer, which is nothing like the sine of θ². At 30° those two readings
                give 0.25 and 0, quite a gap for one small slip.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-question-notation" maxWidth="xl">
        <Block id="squares-question-notation" padding="sm">
            <EditableParagraph id="para-squares-question-notation" blockId="squares-question-notation"></EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-squares-question-identity" maxWidth="xl">
        <Block id="squares-question-identity" padding="sm">
            <EditableParagraph id="para-squares-question-identity" blockId="squares-question-identity">
                <RevealOnInteraction varName="squaresExplored">
                    An acute angle has cos θ = 0.6, so the square on its flat side has area 0.36. The
                    square on the upright side must then have area{" "}
                    <InlineFeedback
                        varName="answerSquaresIdentity"
                        correctValue={["0.64", ".64", "16/25"]}
                        position="terminal"
                        successMessage="— yes, the two areas always fill the unit square, so 1 − 0.36 leaves 0.64"
                        failureMessage="— not yet."
                        hint="Between them the two squares fill an area of exactly 1"
                        visualizationHint={{
                            blockId: "squares-visual",
                            hintKey: "feedback-squares-identity-hint",
                            steps: [
                                {
                                    gesture: "drag-horizontal",
                                    label: "Slide the angle to 53°, where the flat side reads 0.6, and read the two areas",
                                    position: { x: "50%", y: "88%" },
                                    dragPath: { type: "line", startOffset: { x: -35, y: 0 }, endOffset: { x: 35, y: 0 } },
                                    completionVar: "unitCircleAngle",
                                    completionValue: 53,
                                    completionTolerance: 3,
                                },
                            ],
                            label: "Discover it yourself",
                            resetVars: { unitCircleAngle: 35, squaresCosPlaced: true, squaresSinPlaced: true },
                        }}
                    >
                        <InlineClozeInput
                            varName="answerSquaresIdentity"
                            correctAnswer={["0.64", ".64", "16/25"]}
                            {...clozePropsFromDefinition(getVariableInfo("answerSquaresIdentity"))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
