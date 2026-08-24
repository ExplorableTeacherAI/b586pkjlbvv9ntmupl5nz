import { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";
import { Point, POINT_LIST_CLASS } from "./pointList";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 340;
const PAD = 24;
const LINE_Y = 150;
const LINE_LEFT = 60;
const LINE_RIGHT = 500;
const LINE_CENTRE = (LINE_LEFT + LINE_RIGHT) / 2;
const PIXELS_PER_UNIT = (LINE_RIGHT - LINE_LEFT) / 2;

const CHIP_WIDTH = 100;
const CHIP_HEIGHT = 30;
const PLACED_Y = 222; // centre of a chip resting under the line
const TRAY_Y = 285; // centre of a chip waiting in the tray
const DROP_THRESHOLD = 244; // release above this line and the marker is placed

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const SIN_HUE = "#AC8BF9";
const IMPOSTOR_HUE = "#94A3B8";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const fmtRatio = (value: number) => value.toFixed(2);
const valueToX = (value: number) => LINE_CENTRE + PIXELS_PER_UNIT * value;
const xToValue = (x: number) => clamp((x - LINE_CENTRE) / PIXELS_PER_UNIT, -1, 1);

// ── One draggable marker ─────────────────────────────────────────────────────

interface GuessMarkerProps {
    label: string;
    hue: string;
    placed: boolean;
    guess: number;
    trayX: number;
    dimmed: number;
    highlighted: boolean;
    svgRef: React.RefObject<SVGSVGElement>;
    onDrop: (x: number, y: number) => void;
    onHover: (entering: boolean) => void;
}

function GuessMarker({
    label,
    hue,
    placed,
    guess,
    trayX,
    dimmed,
    highlighted,
    svgRef,
    onDrop,
    onHover,
}: GuessMarkerProps) {
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

    const targetX = placed ? clamp(valueToX(guess), PAD + CHIP_WIDTH / 2, VIEW_WIDTH - PAD - CHIP_WIDTH / 2) : trayX;
    const targetY = placed ? PLACED_Y : TRAY_Y;
    const springX = useSpring(dragPos ? dragPos.x : targetX, { stiffness: 220, damping: 24 });
    const springY = useSpring(dragPos ? dragPos.y : targetY, { stiffness: 220, damping: 24 });

    const centre = dragPos ?? { x: springX, y: springY };

    const toViewBox = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return { x: centre.x, y: centre.y };
        const bounds = svg.getBoundingClientRect();
        return {
            x: ((clientX - bounds.left) / bounds.width) * VIEW_WIDTH,
            y: ((clientY - bounds.top) / bounds.height) * VIEW_HEIGHT,
        };
    };

    return (
        <g
            opacity={dimmed}
            style={{ transition: "opacity 150ms ease-out" }}
            onPointerEnter={() => onHover(true)}
            onPointerLeave={() => onHover(false)}
        >
            {placed && !dragPos && (
                <line
                    x1={centre.x}
                    y1={centre.y - CHIP_HEIGHT / 2}
                    x2={valueToX(guess)}
                    y2={LINE_Y}
                    stroke={hue}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                />
            )}
            {highlighted && (
                <rect
                    x={centre.x - CHIP_WIDTH / 2 - 3}
                    y={centre.y - CHIP_HEIGHT / 2 - 3}
                    width={CHIP_WIDTH + 6}
                    height={CHIP_HEIGHT + 6}
                    rx={9}
                    fill="none"
                    stroke={hue}
                    strokeWidth="9"
                    opacity={0.28}
                />
            )}
            <rect
                x={centre.x - CHIP_WIDTH / 2}
                y={centre.y - CHIP_HEIGHT / 2}
                width={CHIP_WIDTH}
                height={CHIP_HEIGHT}
                rx={6}
                fill={hue}
                fillOpacity={0.18}
                stroke={hue}
                strokeWidth={highlighted ? 3.5 : 2}
                style={{ cursor: dragPos ? "grabbing" : "grab", touchAction: "none", transition: "stroke-width 150ms ease-out" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragPos(toViewBox(event.clientX, event.clientY));
                }}
                onPointerMove={(event) => {
                    if (!dragPos) return;
                    setDragPos(toViewBox(event.clientX, event.clientY));
                }}
                onPointerUp={(event) => {
                    const point = toViewBox(event.clientX, event.clientY);
                    setDragPos(null);
                    onDrop(point.x, point.y);
                }}
                onPointerCancel={() => setDragPos(null)}
            />
            <text
                x={centre.x}
                y={centre.y + 5}
                fill={hue}
                fontSize="14"
                textAnchor="middle"
                style={{ pointerEvents: "none" }}
            >
                {label}
            </text>
        </g>
    );
}

// ── The bespoke drawing ──────────────────────────────────────────────────────

function GuessTheSquareDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("notationAngle", 35);
    const guessSquare = useVar<number>("notationGuessSinSquared", 0);
    const guessImpostor = useVar<number>("notationGuessSinOfSquared", 0);
    const squarePlaced = useVar<boolean>("notationSinSquaredPlaced", false);
    const impostorPlaced = useVar<boolean>("notationSinOfSquaredPlaced", false);
    const highlight = useVar<string>("notationHighlight", "");
    const svgRef = useRef<SVGSVGElement>(null);
    const previousAngle = useRef(angle);

    // A new angle is a fresh prediction.
    useEffect(() => {
        if (previousAngle.current !== angle) {
            previousAngle.current = angle;
            setVar("notationSinSquaredPlaced", false);
            setVar("notationSinOfSquaredPlaced", false);
        }
    }, [angle, setVar]);

    useEffect(() => {
        if (squarePlaced && impostorPlaced) setVar("notationExplored", true);
    }, [squarePlaced, impostorPlaced, setVar]);

    const sinValue = Math.sin(toRadians(angle));
    const trueSquare = sinValue * sinValue;
    const trueImpostor = Math.sin(toRadians(angle * angle));

    const isActive = (id: string) => highlight === id;
    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const dimOthers = highlight ? 0.35 : 1;
    const ease = { transition: "opacity 150ms ease-out" };

    const handleDrop = (which: "square" | "impostor") => (x: number, y: number) => {
        const placedVar = which === "square" ? "notationSinSquaredPlaced" : "notationSinOfSquaredPlaced";
        if (y > DROP_THRESHOLD) {
            setVar(placedVar, false);
            return;
        }
        setVar(which === "square" ? "notationGuessSinSquared" : "notationGuessSinOfSquared", xToValue(x));
        setVar(placedVar, true);
    };

    // Keep the two truth labels apart when the values sit close together.
    const truthLabelY = Math.abs(valueToX(trueSquare) - valueToX(trueImpostor)) < 110 ? 194 : 176;
    const clampLabel = (x: number) => clamp(x, PAD + 58, VIEW_WIDTH - PAD - 58);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A number line from minus one to one with two markers to drop onto it"
        >
            {/* The line itself */}
            <g opacity={dimOthers} style={ease}>
                <line x1={LINE_LEFT} y1={LINE_Y} x2={LINE_RIGHT} y2={LINE_Y} stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                {[-1, -0.5, 0, 0.5, 1].map((tick) => (
                    <line
                        key={tick}
                        x1={valueToX(tick)}
                        y1={LINE_Y - 6}
                        x2={valueToX(tick)}
                        y2={LINE_Y + 6}
                        stroke={INK_QUIET}
                        strokeWidth="1.5"
                    />
                ))}
                <text x={valueToX(-1)} y={LINE_Y - 14} fill={INK_STRUCTURE} fontSize="11" textAnchor="middle">-1</text>
                <text x={valueToX(0)} y={LINE_Y - 14} fill={INK_STRUCTURE} fontSize="11" textAnchor="middle">0</text>
                <text x={valueToX(1)} y={LINE_Y - 14} fill={INK_STRUCTURE} fontSize="11" textAnchor="middle">1</text>
            </g>

            {/* Where sin θ itself sits */}
            <g opacity={dimOthers} style={ease}>
                <line x1={valueToX(sinValue)} y1={LINE_Y - 26} x2={valueToX(sinValue)} y2={LINE_Y + 8} stroke={SIN_HUE} strokeWidth="2.5" strokeLinecap="round" />
                <text
                    x={clampLabel(valueToX(sinValue))}
                    y={LINE_Y - 36}
                    fill={SIN_HUE}
                    fontSize="13"
                    textAnchor="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`sin θ = ${fmtRatio(sinValue)}`}
                </text>
            </g>

            {/* The truth, revealed once a marker has been committed */}
            <g opacity={dim("sinSquared")} style={ease}>
                {squarePlaced && (
                    <>
                        <circle cx={valueToX(trueSquare)} cy={LINE_Y} r="9" fill="none" stroke={SIN_HUE} strokeWidth="2.5" />
                        <text
                            x={clampLabel(valueToX(trueSquare))}
                            y={176}
                            fill={SIN_HUE}
                            fontSize="12"
                            textAnchor="middle"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {`sin²θ = ${fmtRatio(trueSquare)}`}
                        </text>
                    </>
                )}
            </g>
            <g opacity={dim("sinOfSquared")} style={ease}>
                {impostorPlaced && (
                    <>
                        <circle cx={valueToX(trueImpostor)} cy={LINE_Y} r="9" fill="none" stroke={IMPOSTOR_HUE} strokeWidth="2.5" />
                        <text
                            x={clampLabel(valueToX(trueImpostor))}
                            y={truthLabelY}
                            fill={IMPOSTOR_HUE}
                            fontSize="12"
                            textAnchor="middle"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {`sin(θ²) = ${fmtRatio(trueImpostor)}`}
                        </text>
                    </>
                )}
            </g>

            <GuessMarker
                label="sin²θ"
                hue={SIN_HUE}
                placed={squarePlaced}
                guess={guessSquare}
                trayX={170}
                dimmed={dim("sinSquared")}
                highlighted={isActive("sinSquared")}
                svgRef={svgRef}
                onDrop={handleDrop("square")}
                onHover={(entering) => setVar("notationHighlight", entering ? "sinSquared" : "")}
            />
            <GuessMarker
                label="sin(θ²)"
                hue={IMPOSTOR_HUE}
                placed={impostorPlaced}
                guess={guessImpostor}
                trayX={390}
                dimmed={dim("sinOfSquared")}
                highlighted={isActive("sinOfSquared")}
                svgRef={svgRef}
                onDrop={handleDrop("impostor")}
                onHover={(entering) => setVar("notationHighlight", entering ? "sinOfSquared" : "")}
            />

            <g opacity={dimOthers} style={ease}>
                <text x={PAD} y={42} fill={INK} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`θ = ${Math.round(angle)}°`}
                </text>
                <text x={VIEW_WIDTH - PAD} y={42} fill={INK_STRUCTURE} fontSize="12" textAnchor="end">
                    drop each marker where you think it lands
                </text>
            </g>
        </svg>
    );
}

function GuessTheSquareFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="guess-the-square-line"
            onReset={() => {
                setVar("notationSinSquaredPlaced", false);
                setVar("notationSinOfSquaredPlaced", false);
                setVar("notationAngle", 35);
                setVar("notationHighlight", "");
            }}
            caption="Drag each marker up onto the line and let go. A hollow ring shows where the value truly sits, so you can see how close the guess was. Change the angle and the markers come back for another go."
        >
            <GuessTheSquareDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="notationAngle"
                    label="Angle θ"
                    {...numberPropsFromDefinition(getVariableInfo("notationAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
            </div>
            <InteractionHintSequence
                hintKey="guess-the-square-drop"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the sin²θ marker up onto the line",
                        position: { x: "30%", y: "72%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: 18 }, endOffset: { x: 20, y: -30 } },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const whatSinSquaredMeansBlocks: ReactElement[] = [
    <StackLayout key="layout-notation-heading" maxWidth="xl">
        <Block id="notation-heading" padding="md">
            <EditableH2 id="h2-notation-heading" blockId="notation-heading">
                What sin²θ Really Means
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-notation-setup" maxWidth="xl">
        <Block id="notation-setup" padding="sm">
            <EditableParagraph id="para-notation-setup" blockId="notation-setup" className={POINT_LIST_CLASS}>
                <Point>One piece of shorthand trips almost everyone up: sin²θ and sin(θ²).</Point>
                <Point>
                    At θ ={" "}
                    <InlineScrubbleNumber
                        varName="notationAngle"
                        {...numberPropsFromDefinition(getVariableInfo("notationAngle"))}
                        formatValue={(v) => `${Math.round(v)}°`}
                    />
                    , both of them land somewhere on the number line below.
                </Point>
                <Point>Drop each marker where you think its value sits.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-notation-visual" maxWidth="xl">
        <Block id="notation-visual" padding="sm" hasVisualization>
            <GuessTheSquareFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-notation-explanation" maxWidth="xl">
        <Block id="notation-explanation" padding="sm">
            <EditableParagraph id="para-notation-explanation" blockId="notation-explanation" className={POINT_LIST_CLASS}>
                <Point>
                    <InlineLinkedHighlight
                        varName="notationHighlight"
                        highlightId="sinSquared"
                        {...linkedHighlightPropsFromDefinition(getVariableInfo("notationHighlight"))}
                    >
                        sin²θ
                    </InlineLinkedHighlight>
                    {" "}takes the sine first, then squares it, so it never escapes the stretch from 0 to 1.
                </Point>
                <Point>sin(θ²) squares the angle first, which sends the answer anywhere on the line, negatives included.</Point>
                <Point>Two brackets are all that separate them.</Point>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
