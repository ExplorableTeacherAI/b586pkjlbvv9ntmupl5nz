/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // SECTION — A Triangle Hidden in a Circle
    // ========================================

    unitCircleAngle: {
        defaultValue: 35,
        type: 'number',
        label: 'Angle on the unit circle',
        description: 'Angle theta of the point on the unit circle, measured from the positive x-axis',
        unit: '\u00b0',
        min: 15,
        max: 80,
        step: 1,
        color: '#62D0AD',
    },

    unitCircleHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Unit circle highlight',
        description: 'Which part of the unit circle figure is highlighted on hover',
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.20)',
    },

    unitCircleCosHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Unit circle cosine highlight',
        description: 'Highlight trigger coloured for the horizontal (cosine) side',
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.20)',
    },

    unitCircleSinHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Unit circle sine highlight',
        description: 'Highlight trigger coloured for the vertical (sine) side',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.20)',
    },

    unitCircleCosValue: {
        defaultValue: 0.82,
        type: 'number',
        label: 'Cosine readout',
        description: 'Live cos theta of the point on the unit circle, shown read-only inside the formula',
        min: -1, max: 1, step: 0.01,
        color: '#8E90F5',
    },

    unitCircleSinValue: {
        defaultValue: 0.57,
        type: 'number',
        label: 'Sine readout',
        description: 'Live sin theta of the point on the unit circle, shown read-only inside the formula',
        min: -1, max: 1, step: 0.01,
        color: '#AC8BF9',
    },

    unitCircleRadiusHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Unit circle radius highlight',
        description: 'Highlight trigger coloured for the slanted side, the radius of length one',
        color: '#62CCF9',
        bgColor: 'rgba(98, 204, 249, 0.20)',
    },

    triangleExplored: {
        defaultValue: false,
        type: 'boolean',
        label: 'Unit circle triangle explored',
        description: 'Set to true the first time the student drags the point around the rim',
    },

    answerTriangleCos: {
        defaultValue: '',
        type: 'select',
        label: 'Cosine from coordinates',
        description: 'Student answer: which coordinate is cos theta',
        placeholder: '???',
        correctAnswer: '0.28',
        options: ['0.28', '0.96', '1', '3.43'],
        color: '#8E90F5',
    },

    // ========================================
    // ========================================
    // SECTION — What sin squared theta Really Means
    // ========================================

    notationAngle: {
        defaultValue: 35,
        type: 'number',
        label: 'Angle for the notation line',
        description: 'Angle theta used on the number line where the two markers are dropped',
        unit: '\u00b0',
        min: 15,
        max: 80,
        step: 1,
        color: '#62D0AD',
    },

    notationGuessSinSquared: {
        defaultValue: 0,
        type: 'number',
        label: 'Guess for sin squared theta',
        description: 'Where the student dropped the sin squared theta marker on the number line',
        min: -1,
        max: 1,
        step: 0.01,
        color: '#AC8BF9',
    },

    notationGuessSinOfSquared: {
        defaultValue: 0,
        type: 'number',
        label: 'Guess for sine of theta squared',
        description: 'Where the student dropped the sine of theta squared marker on the number line',
        min: -1,
        max: 1,
        step: 0.01,
        color: '#94A3B8',
    },

    notationSinSquaredPlaced: {
        defaultValue: false,
        type: 'boolean',
        label: 'sin squared marker placed',
        description: 'Whether the sin squared theta marker has been dropped on the line',
    },

    notationSinOfSquaredPlaced: {
        defaultValue: false,
        type: 'boolean',
        label: 'sine of theta squared marker placed',
        description: 'Whether the sine of theta squared marker has been dropped on the line',
    },

    notationExplored: {
        defaultValue: false,
        type: 'boolean',
        label: 'Both markers placed',
        description: 'Set to true once both markers have been dropped onto the number line',
    },

    notationHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Notation figure highlight',
        description: 'Which marker on the number line is highlighted on hover',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.20)',
    },

    notationImpostorHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Notation impostor highlight',
        description: 'Highlight trigger coloured for the sine of theta squared impostor',
        color: '#94A3B8',
        bgColor: 'rgba(148, 163, 184, 0.20)',
    },

    answerNotationSinSquared: {
        defaultValue: '',
        type: 'select',
        label: 'Value of sin squared 45',
        description: 'Student answer: sin squared of 45 degrees',
        placeholder: '???',
        correctAnswer: '0.5',
        options: ['0', '0.25', '0.5', '1'],
        color: '#AC8BF9',
    },

    // ========================================
    // SECTION — Squares That Add to One
    // ========================================

    squaresCosPlaced: {
        defaultValue: false,
        type: 'boolean',
        label: 'Cosine square packed',
        description: 'Whether the square built on the flat side has been packed into the unit square',
    },

    squaresSinPlaced: {
        defaultValue: false,
        type: 'boolean',
        label: 'Sine square packed',
        description: 'Whether the square built on the upright side has been packed into the unit square',
    },

    squaresExplored: {
        defaultValue: false,
        type: 'boolean',
        label: 'Both squares packed',
        description: 'Set to true once both squares have been packed into the unit square',
    },

    answerSquaresTotal: {
        defaultValue: '',
        type: 'text',
        label: 'Total the two squares fill',
        description: 'Student answer typed inside the identity formula: what the two squares add up to',
        placeholder: '???',
        correctAnswer: ['1', '1.0', 'one'],
        color: '#F8A0CD',
        bgColor: 'rgba(248, 160, 205, 0.20)',
    },

    squaresHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Squares figure highlight',
        description: 'Which square in the packing figure is highlighted on hover',
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.20)',
    },

    answerSquaresIdentity: {
        defaultValue: '',
        type: 'text',
        label: 'Sine squared from cosine',
        description: 'Student answer: sin squared theta when cos theta is 0.6',
        placeholder: '???',
        correctAnswer: ['0.64', '.64', '16/25'],
        color: '#AC8BF9',
    },

    // SECTION — Turning Past 90 degrees
    // ========================================

    quadrantAngle: {
        defaultValue: 40,
        type: 'number',
        label: 'Angle around the whole circle',
        description: 'Angle theta of the walking dot, measured anticlockwise from the positive x-axis',
        unit: '\u00b0',
        min: 0,
        max: 360,
        step: 1,
        color: '#62D0AD',
    },

    quadrantTrailMax: {
        defaultValue: 40,
        type: 'number',
        label: 'Furthest angle reached',
        description: 'The furthest the dot has walked, used to draw the trail it leaves behind',
        min: 0,
        max: 360,
        step: 1,
    },

    quadrantPlaying: {
        defaultValue: false,
        type: 'boolean',
        label: 'Walk playing',
        description: 'Whether the dot is walking round the circle on its own',
    },

    quadrantExplored: {
        defaultValue: false,
        type: 'boolean',
        label: 'Walked past 90 degrees',
        description: 'Set to true once the dot has been walked well past the first quadrant',
    },

    quadrantHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Quadrant figure highlight',
        description: 'Which quantity in the walking-dot figure is highlighted on hover',
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.20)',
    },

    quadrantSinHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Quadrant sine highlight',
        description: 'Highlight trigger coloured for the sine bar in the walking-dot figure',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.20)',
    },

    answerQuadrantCosSign: {
        defaultValue: '',
        type: 'select',
        label: 'Sign of cosine at 210 degrees',
        description: 'Student answer: whether cos theta is positive or negative at 210 degrees',
        placeholder: '???',
        correctAnswer: 'negative',
        options: ['positive', 'negative', 'zero'],
        color: '#8E90F5',
    },

    answerQuadrantIdentity: {
        defaultValue: '',
        type: 'text',
        label: 'Identity total at 210 degrees',
        description: 'Student answer: value of sin squared plus cos squared at 210 degrees',
        placeholder: '???',
        correctAnswer: ['1', '1.0', 'one'],
        color: '#334155',
    },

    // ========================================
    // SECTION — One Ratio Gives You the Other
    // ========================================

    applyAngle: {
        defaultValue: 20,
        type: 'number',
        label: 'Steered angle',
        description: 'Angle of the dot the student steers around the rim',
        unit: '\u00b0',
        min: 0,
        max: 360,
        step: 1,
        color: '#62D0AD',
    },

    applyTargetCos: {
        defaultValue: 0.6,
        type: 'number',
        label: 'Target cosine',
        description: 'The cosine value the student is aiming to hit',
        min: -0.95,
        max: 0.95,
        step: 0.01,
        color: '#F7B23B',
    },

    applyFoundUpper: {
        defaultValue: false,
        type: 'boolean',
        label: 'Upper solution found',
        description: 'Whether the student has landed on the crossing above the x-axis',
    },

    applyFoundLower: {
        defaultValue: false,
        type: 'boolean',
        label: 'Lower solution found',
        description: 'Whether the student has landed on the crossing below the x-axis',
    },

    applyExplored: {
        defaultValue: false,
        type: 'boolean',
        label: 'Target hit at least once',
        description: 'Set to true once the student has hit the target cosine',
    },

    applySinMagnitude: {
        defaultValue: 0.8,
        type: 'number',
        label: 'Sine size from the target cosine',
        description: 'Live square root of one minus the target cosine squared, shown read-only in the formula',
        min: 0, max: 1, step: 0.01,
        color: '#AC8BF9',
    },

    answerApplySign: {
        defaultValue: '',
        type: 'select',
        label: 'Sign in front of the square root',
        description: 'Student answer inside the formula: which sign belongs in front of the square root',
        placeholder: '???',
        correctAnswer: '\u00b1',
        options: ['+', '\u2212', '\u00b1'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.20)',
    },

    applyHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Target figure highlight',
        description: 'Which quantity in the target figure is highlighted on hover',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.20)',
    },

    answerApplySin: {
        defaultValue: '',
        type: 'text',
        label: 'Sine from cosine',
        description: 'Student answer: sin theta for an acute angle with cos theta of 0.28',
        placeholder: '???',
        correctAnswer: ['0.96', '.96'],
        color: '#AC8BF9',
    },

    answerApplyCount: {
        defaultValue: '',
        type: 'select',
        label: 'Number of angles with the same cosine',
        description: 'Student answer: how many angles between 0 and 360 share one cosine value',
        placeholder: '???',
        correctAnswer: '2',
        options: ['1', '2', '4', 'infinitely many'],
        color: '#F7B23B',
    },

    // ========================================
    // SECTION — Where This Shows Up
    // ========================================

    sledAngle: {
        defaultValue: 35,
        type: 'number',
        label: 'Rope angle',
        description: 'Angle of the sled rope above the ground',
        unit: '\u00b0',
        min: 15,
        max: 80,
        step: 1,
        color: '#62D0AD',
    },

    sledHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Sled figure highlight',
        description: 'Which part of the rope pull is highlighted on hover',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.20)',
    },

    sledForwardHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Sled forward highlight',
        description: 'Highlight trigger coloured for the forward (cosine) part of the pull',
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.20)',
    },

    sledLiftTarget: {
        defaultValue: 0.57,
        type: 'number',
        label: 'Lift you will put up with',
        description: 'Scrub the lifting share you accept; the rope angle follows from it, which is the identity used backwards',
        min: 0.26,
        max: 0.98,
        step: 0.01,
        color: '#AC8BF9',
    },

    joystickAngle: {
        defaultValue: 35,
        type: 'number',
        label: 'Joystick direction',
        description: 'Direction the joystick is pushed, measured from the positive x-axis',
        unit: '\u00b0',
        min: 0,
        max: 360,
        step: 1,
        color: '#62D0AD',
    },

    answerTriangleCompare: {
        defaultValue: '',
        type: 'select',
        label: 'Larger ratio at 70 degrees',
        description: 'Student answer: which of cos or sin is larger at 70 degrees',
        placeholder: '???',
        correctAnswer: 'sin \u03b8',
        options: ['cos \u03b8', 'sin \u03b8', 'they are equal'],
        color: '#AC8BF9',
    },


    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
