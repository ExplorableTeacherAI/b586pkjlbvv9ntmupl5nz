import { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    ImageDisplay,
    InteractionHintSequence,
    VideoDisplay,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useRafLoop, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const COS_HUE = "#8E90F5";
const SIN_HUE = "#AC8BF9";
const HANDLE_HUE = "#62D0AD";
const TARGET_HUE = "#F7B23B";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const fmtRatio = (value: number) => value.toFixed(2);

// ── Application 1: pulling a weight sled ─────────────────────────────────────

const SLED_WIDTH = 520;
const SLED_HEIGHT = 360;
const SLED_PAD = 24;
const ROPE_ORIGIN = { x: 180, y: 240 };
const ROPE_LENGTH = 140;
const GROUND_Y = 272;

function SledPullDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("sledAngle", 35);
    const highlight = useVar<string>("sledHighlight", "");
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const handleScale = useSpring(dragging || hovered ? 1.25 : 1, { stiffness: 400, damping: 26 });

    const radians = toRadians(angle);
    const cosValue = Math.cos(radians);
    const sinValue = Math.sin(radians);
    const cornerX = ROPE_ORIGIN.x + ROPE_LENGTH * cosValue;
    const handle = { x: cornerX, y: ROPE_ORIGIN.y - ROPE_LENGTH * sinValue };

    const isActive = (id: string) => highlight === id;
    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const dimOthers = highlight ? 0.35 : 1;
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("sledHighlight", id),
        onPointerLeave: () => setVar("sledHighlight", ""),
    });

    const updateFromPointer = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return;
        const bounds = svg.getBoundingClientRect();
        const x = ((clientX - bounds.left) / bounds.width) * SLED_WIDTH - ROPE_ORIGIN.x;
        const y = ROPE_ORIGIN.y - ((clientY - bounds.top) / bounds.height) * SLED_HEIGHT;
        const degrees = (Math.atan2(y, x) * 180) / Math.PI;
        setVar("sledAngle", Math.round(clamp(degrees, 15, 80)));
    };

    const bisector = toRadians(angle / 2);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${SLED_WIDTH} ${SLED_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A weight sled pulled by a rope at an angle, with the forward and lifting parts of the pull drawn"
        >
            <defs>
                <marker id="sled-arrow-ink" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={INK_STRUCTURE} />
                </marker>
                <marker id="sled-arrow-cos" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={COS_HUE} />
                </marker>
                <marker id="sled-arrow-sin" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={SIN_HUE} />
                </marker>
                <filter id="sled-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Ground and sled */}
            <g opacity={dimOthers} style={ease}>
                <line x1={40} y1={GROUND_Y} x2={480} y2={GROUND_Y} stroke={INK_QUIET} strokeWidth="2" strokeLinecap="round" />
                <rect x={100} y={240} width={80} height={32} rx={5} fill="#F1F5F9" stroke={INK_STRUCTURE} strokeWidth="2" />
                <circle cx={140} cy={224} r={17} fill="#E2E8F0" stroke={INK_STRUCTURE} strokeWidth="2" />
                <text x={140} y={228} fill={INK_STRUCTURE} fontSize="11" textAnchor="middle">20</text>
                <path
                    d={`M ${ROPE_ORIGIN.x + 42} ${ROPE_ORIGIN.y} A 42 42 0 0 0 ${ROPE_ORIGIN.x + 42 * cosValue} ${ROPE_ORIGIN.y - 42 * sinValue}`}
                    fill="none"
                    stroke={INK_STRUCTURE}
                    strokeWidth="1.5"
                />
                <text
                    x={ROPE_ORIGIN.x + 54 * Math.cos(bisector)}
                    y={ROPE_ORIGIN.y - 54 * Math.sin(bisector) + 4}
                    fill={INK}
                    fontSize="13"
                    textAnchor="middle"
                >
                    θ
                </text>
            </g>

            {/* The whole pull along the rope */}
            <g opacity={dim("pull")} style={ease} {...hoverProps("pull")}>
                {isActive("pull") && (
                    <line x1={ROPE_ORIGIN.x} y1={ROPE_ORIGIN.y} x2={handle.x} y2={handle.y} stroke={INK_STRUCTURE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={ROPE_ORIGIN.x}
                    y1={ROPE_ORIGIN.y}
                    x2={handle.x}
                    y2={handle.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth={isActive("pull") ? 4 : 2.5}
                    strokeLinecap="round"
                    markerEnd="url(#sled-arrow-ink)"
                    style={ease}
                />
                <text
                    x={ROPE_ORIGIN.x + (ROPE_LENGTH / 2) * cosValue - 18 * sinValue}
                    y={ROPE_ORIGIN.y - (ROPE_LENGTH / 2) * sinValue - 16 * cosValue}
                    fill={INK_STRUCTURE}
                    fontSize="12"
                    textAnchor="middle"
                >
                    pull = 1
                </text>
            </g>

            {/* Forward part of the pull */}
            <g opacity={dim("forward")} style={ease} {...hoverProps("forward")}>
                {isActive("forward") && (
                    <line x1={ROPE_ORIGIN.x} y1={ROPE_ORIGIN.y} x2={cornerX} y2={ROPE_ORIGIN.y} stroke={COS_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={ROPE_ORIGIN.x}
                    y1={ROPE_ORIGIN.y}
                    x2={cornerX}
                    y2={ROPE_ORIGIN.y}
                    stroke={COS_HUE}
                    strokeWidth={isActive("forward") ? 5 : 3.2}
                    strokeLinecap="round"
                    markerEnd="url(#sled-arrow-cos)"
                    style={ease}
                />
                <text
                    x={ROPE_ORIGIN.x + (ROPE_LENGTH / 2) * cosValue}
                    y={296}
                    fill={COS_HUE}
                    fontSize="12"
                    textAnchor="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`forward = cos θ = ${fmtRatio(cosValue)}`}
                </text>
            </g>

            {/* Lifting part of the pull */}
            <g opacity={dim("lift")} style={ease} {...hoverProps("lift")}>
                {isActive("lift") && (
                    <line x1={cornerX} y1={ROPE_ORIGIN.y} x2={cornerX} y2={handle.y} stroke={SIN_HUE} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={cornerX}
                    y1={ROPE_ORIGIN.y}
                    x2={cornerX}
                    y2={handle.y}
                    stroke={SIN_HUE}
                    strokeWidth={isActive("lift") ? 5 : 3.2}
                    strokeLinecap="round"
                    markerEnd="url(#sled-arrow-sin)"
                    style={ease}
                />
                <text
                    x={cornerX + 10}
                    y={ROPE_ORIGIN.y - (ROPE_LENGTH / 2) * sinValue + 4}
                    fill={SIN_HUE}
                    fontSize="12"
                    textAnchor="start"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`lift = sin θ = ${fmtRatio(sinValue)}`}
                </text>
            </g>

            {/* The draggable handle */}
            <g opacity={dimOthers} style={ease}>
                <g transform={`translate(${handle.x} ${handle.y}) scale(${handleScale})`}>
                    <circle r="9" fill={HANDLE_HUE} filter="url(#sled-handle-shadow)" />
                </g>
                <circle
                    cx={handle.x}
                    cy={handle.y}
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

            <g opacity={dimOthers} style={ease}>
                <text x={SLED_PAD} y={332} fill={INK} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`θ = ${Math.round(angle)}°`}
                </text>
                <text x={SLED_WIDTH - SLED_PAD} y={332} fill={INK} fontSize="13" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`forward² + lift² = ${fmtRatio(cosValue * cosValue + sinValue * sinValue)}`}
                </text>
            </g>
        </svg>
    );
}

function SledPullFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="sled-pull-components"
            onReset={() => {
                setVar("sledAngle", 35);
                setVar("sledHighlight", "");
            }}
            caption="Drag the teal handle to change the rope angle. A steeper rope lifts more and drags less, but the two parts squared always rebuild the same pull of 1."
        >
            <SledPullDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="sledAngle"
                    label="Rope angle θ"
                    {...numberPropsFromDefinition(getVariableInfo("sledAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
            </div>
            <InteractionHintSequence
                hintKey="sled-pull-handle-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Drag the teal handle to raise the rope",
                        position: { x: "60%", y: "44%" },
                        dragPath: { type: "arc", startAngle: -35, endAngle: -70, radius: 36 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Application 2: a game joystick ───────────────────────────────────────────

const STICK_WIDTH = 540;
const STICK_HEIGHT = 340;
const STICK_PAD = 24;
const GATE = { x: 140, y: 165 };
const GATE_RADIUS = 100;
const ARENA = { x: 400, y: 165 };
const ARENA_RADIUS = 95;

function JoystickDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("joystickAngle", 35);
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [trail, setTrail] = useState<number[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);
    const angleRef = useRef(angle);
    angleRef.current = angle;

    const handleScale = useSpring(dragging || hovered ? 1.25 : 1, { stiffness: 400, damping: 26 });

    useRafLoop((dt) => {
        setProgress((previous) => {
            const next = previous + dt * 0.45;
            if (next >= 1) {
                setTrail((rays) => [...rays.slice(-4), angleRef.current]);
                return 0;
            }
            return next;
        });
    });

    const radians = toRadians(angle);
    const cosValue = Math.cos(radians);
    const sinValue = Math.sin(radians);
    const knob = { x: GATE.x + GATE_RADIUS * cosValue, y: GATE.y - GATE_RADIUS * sinValue };
    const runner = {
        x: ARENA.x + ARENA_RADIUS * progress * cosValue,
        y: ARENA.y - ARENA_RADIUS * progress * sinValue,
    };

    const updateFromPointer = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return;
        const bounds = svg.getBoundingClientRect();
        const x = ((clientX - bounds.left) / bounds.width) * STICK_WIDTH - GATE.x;
        const y = GATE.y - ((clientY - bounds.top) / bounds.height) * STICK_HEIGHT;
        setVar("joystickAngle", Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360));
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${STICK_WIDTH} ${STICK_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A joystick pushed in one direction, beside an arena where a brick travels the same distance whatever the direction"
        >
            <defs>
                <filter id="joystick-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* The joystick gate */}
            <circle cx={GATE.x} cy={GATE.y} r={GATE_RADIUS} fill="none" stroke={INK_QUIET} strokeWidth="1.5" />
            <line x1={GATE.x - GATE_RADIUS - 14} y1={GATE.y} x2={GATE.x + GATE_RADIUS + 14} y2={GATE.y} stroke={INK_QUIET} strokeWidth="1" />
            <line x1={GATE.x} y1={GATE.y + GATE_RADIUS + 14} x2={GATE.x} y2={GATE.y - GATE_RADIUS - 14} stroke={INK_QUIET} strokeWidth="1" />

            {/* The two parts of the speed */}
            <line x1={GATE.x} y1={GATE.y} x2={knob.x} y2={GATE.y} stroke={COS_HUE} strokeWidth="3.2" strokeLinecap="round" />
            <line x1={knob.x} y1={GATE.y} x2={knob.x} y2={knob.y} stroke={SIN_HUE} strokeWidth="3.2" strokeLinecap="round" />
            <line x1={GATE.x} y1={GATE.y} x2={knob.x} y2={knob.y} stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />

            {/* The stick knob */}
            <g transform={`translate(${knob.x} ${knob.y}) scale(${handleScale})`}>
                <circle r="11" fill={HANDLE_HUE} filter="url(#joystick-shadow)" />
            </g>
            <circle
                cx={knob.x}
                cy={knob.y}
                r="24"
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

            {/* The arena: every run reaches the ring at the same moment */}
            <circle cx={ARENA.x} cy={ARENA.y} r={ARENA_RADIUS} fill="none" stroke={TARGET_HUE} strokeWidth="1.5" strokeDasharray="5 5" opacity={0.7} />
            {trail.map((rayAngle, index) => (
                <line
                    key={`${rayAngle}-${index}`}
                    x1={ARENA.x}
                    y1={ARENA.y}
                    x2={ARENA.x + ARENA_RADIUS * Math.cos(toRadians(rayAngle))}
                    y2={ARENA.y - ARENA_RADIUS * Math.sin(toRadians(rayAngle))}
                    stroke={HANDLE_HUE}
                    strokeWidth="2"
                    opacity={0.2}
                    strokeLinecap="round"
                />
            ))}
            <line
                x1={ARENA.x}
                y1={ARENA.y}
                x2={runner.x}
                y2={runner.y}
                stroke={HANDLE_HUE}
                strokeWidth="2.5"
                opacity={0.6}
                strokeLinecap="round"
            />
            <g transform={`translate(${runner.x - 9} ${runner.y - 9})`}>
                <rect width="18" height="18" rx="3" fill={HANDLE_HUE} />
                <circle cx="5.5" cy="5.5" r="2" fill="#FFFFFF" fillOpacity="0.7" />
                <circle cx="12.5" cy="5.5" r="2" fill="#FFFFFF" fillOpacity="0.7" />
            </g>

            {/* Labels and readouts */}
            <text x={GATE.x} y={284} fill={INK_STRUCTURE} fontSize="12" textAnchor="middle">joystick</text>
            <text x={ARENA.x} y={284} fill={INK_STRUCTURE} fontSize="12" textAnchor="middle">same distance, every time</text>
            <text x={STICK_PAD} y={310} fill={COS_HUE} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                {`across = ${fmtRatio(cosValue)}`}
            </text>
            <text x={200} y={310} fill={SIN_HUE} fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                {`up = ${fmtRatio(sinValue)}`}
            </text>
            <text x={STICK_WIDTH - STICK_PAD} y={310} fill={INK} fontSize="13" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                {`speed = ${fmtRatio(Math.sqrt(cosValue * cosValue + sinValue * sinValue))}`}
            </text>
        </svg>
    );
}

function JoystickFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="joystick-speed-components"
            onReset={() => setVar("joystickAngle", 35)}
            caption="Swing the teal knob to any direction. The across part and the up part keep swapping, yet the brick always reaches the amber ring in the same time, because the speed is always 1."
        >
            <JoystickDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="joystickAngle"
                    label="Direction"
                    {...numberPropsFromDefinition(getVariableInfo("joystickAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
            </div>
            <InteractionHintSequence
                hintKey="joystick-knob-swing"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Swing the teal knob around the gate",
                        position: { x: "41%", y: "37%" },
                        dragPath: { type: "arc", startAngle: -35, endAngle: -140, radius: 40 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── A light panel about the classic slip ─────────────────────────────────────

function NotationJokePanel() {
    return (
        <svg viewBox="0 0 540 210" className="block w-full" role="img" aria-label="A two panel cartoon about the sin squared theta notation slip">
            <rect x={16} y={16} width={240} height={178} rx={10} fill="#F8FAFC" />
            <rect x={284} y={16} width={240} height={178} rx={10} fill="#F8FAFC" />

            {/* Left panel — the slip */}
            <circle cx={82} cy={92} r={26} fill="#FFFFFF" stroke={INK_STRUCTURE} strokeWidth="2" />
            <circle cx={73} cy={86} r="2.6" fill={INK_STRUCTURE} />
            <circle cx={91} cy={86} r="2.6" fill={INK_STRUCTURE} />
            <path d="M 71 105 Q 82 96 93 105" fill="none" stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
            <text x={196} y={82} fill={INK} fontSize="16" textAnchor="middle">sin²θ = sin(θ²)</text>
            <line x1={130} y1={77} x2={262} y2={77} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <text x={196} y={112} fill="#ef4444" fontSize="12" textAnchor="middle">two marks, gone</text>
            <text x={136} y={168} fill={INK_STRUCTURE} fontSize="12" textAnchor="middle">squaring the angle</text>

            {/* Right panel — the fix */}
            <circle cx={350} cy={92} r={26} fill="#FFFFFF" stroke={INK_STRUCTURE} strokeWidth="2" />
            <circle cx={341} cy={86} r="2.6" fill={INK_STRUCTURE} />
            <circle cx={359} cy={86} r="2.6" fill={INK_STRUCTURE} />
            <path d="M 339 98 Q 350 110 361 98" fill="none" stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
            <text x={452} y={82} fill={INK} fontSize="16" textAnchor="middle">sin²θ = (sin θ)²</text>
            <rect x={424} y={98} width={30} height={30} rx={3} fill={SIN_HUE} fillOpacity="0.25" stroke={SIN_HUE} strokeWidth="2" />
            <text x={468} y={118} fill={SIN_HUE} fontSize="12" textAnchor="start">side sin θ</text>
            <text x={404} y={168} fill={INK_STRUCTURE} fontSize="12" textAnchor="middle">squaring the answer</text>
        </svg>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const whereThisShowsUpBlocks: ReactElement[] = [
    <StackLayout key="layout-applications-heading" maxWidth="xl">
        <Block id="applications-heading" padding="md">
            <EditableH2 id="h2-applications-heading" blockId="applications-heading">
                Where This Shows Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-sled" maxWidth="xl">
        <Block id="applications-sled" padding="sm">
            <EditableParagraph id="para-applications-sled" blockId="applications-sled">
                None of this is stuck inside a maths lesson. Drag a weight sled with the rope at θ ={" "}
                <InlineScrubbleNumber
                    varName="sledAngle"
                    {...numberPropsFromDefinition(getVariableInfo("sledAngle"))}
                    formatValue={(v) => `${Math.round(v)}°`}
                />
                {" "}and the pull splits in two: some of it drags the sled forward, the rest just{" "}
                <InlineLinkedHighlight
                    varName="sledHighlight"
                    highlightId="lift"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("sledHighlight"))}
                >
                    lifts it
                </InlineLinkedHighlight>
                . Raise the handle and watch the two parts trade size.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-sled-photo" maxWidth="xl">
        <Block id="applications-sled-photo" padding="sm">
            <ImageDisplay
                id="image-sled-pull-real"
                src="/images/sled-pull-real.jpg"
                alt="A student running while pulling a weighted sled behind her on a strap"
                caption="A real sled pull. The strap runs up from the sled to her shoulders, so part of every step drags the sled forward and part of it lifts. Photo: Chuck Cannon, U.S. Army, public domain."
                zoomable
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-sled-figure" maxWidth="xl">
        <Block id="applications-sled-figure" padding="sm" hasVisualization>
            <SledPullFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-joystick" maxWidth="xl">
        <Block id="applications-joystick" padding="sm">
            <EditableParagraph id="para-applications-joystick" blockId="applications-joystick">
                A game controller runs the same maths thousands of times a second. Swing the knob and
                your character's speed is shared out between across and up, yet the brick reaches the
                ring in the same time whichever way you point.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-joystick-photo" maxWidth="xl">
        <Block id="applications-joystick-photo" padding="sm">
            <ImageDisplay
                id="image-analog-stick-real"
                src="/images/analog-stick-real.jpg"
                alt="Close-up of a game controller analog stick sitting in its round gate"
                caption="A real analog stick. The round gate stops it going any further out, so whichever way it is pushed it ends up the same distance from the centre. Photo: Evan-Amos, CC0."
                zoomable
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-joystick-figure" maxWidth="xl">
        <Block id="applications-joystick-figure" padding="sm" hasVisualization>
            <JoystickFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-joke" maxWidth="xl">
        <Block id="applications-joke" padding="sm">
            <NotationJokePanel />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-applications-video" maxWidth="xl">
        <Block id="applications-video" padding="sm">
            <VideoDisplay
                id="video-unit-circle-intro"
                src="https://www.youtube.com/watch?v=1m9p9iubMLU"
                alt="Introduction to the unit circle"
                caption="Sal Khan walks through the same idea from scratch, in case you would like to hear it explained out loud."
                aspectRatio="16/9"
            />
        </Block>
    </StackLayout>,
];
