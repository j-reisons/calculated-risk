import { Matrix, evaluate, isMatrix } from "mathjs";

export const CASHFLOWS_PARAM = "cashflows";
export interface CashflowsFormState {
    // Contents of the textarea
    readonly cashflowString: string;
    // Set on blur, reset on focus
    readonly cashflowStringValid: boolean;
}
export function parseCashflows(cashflowString: string): (number[] | null) {
    const scope = { cashflows: null };
    try {
        evaluate(cashflowString, scope);
    } catch (error) { return null; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = scope.cashflows as any;
    if (isMatrix(result) && result.size().length === 1) {
        return (result as Matrix).valueOf() as number[];
    }
    return null;
}
export interface CashflowsState {
    readonly cashflows: number[];
}

export const STRATEGIES_PARAM = "strategies";

export interface StrategiesState {
    readonly strategies: Strategy[];
}

export interface Strategy {
    readonly name: string,
    readonly location: number; // mean when defined
    readonly scale: number; // std when defined

    readonly CDF: (r: number) => number;
    // A range of input values which accounts for at least 99.9999% of the ditribution.
    // The CDF should be normalized to 0/1 at the extremities (< 1E-6 tails are cut off).
    readonly support: [number, number];

    // These fields used for plotting only
    readonly PDF: (r: number) => number;
    readonly pointsOfInterest: number[];
    readonly deltas: Delta[];
    readonly colorIndex: number;
}
export interface Delta {
    readonly location: number;
    readonly weight: number
}

export interface StrategiesFormState {
    // Contents of the textarea
    readonly strategiesString: string;
    // Set on blur, reset on focus
    readonly strategiesStringValid: boolean;
}

export const UTILITY_PARAM = "utility";
export interface UtilityFormState {
    readonly utilityString: string;
    readonly textAreaFocused: boolean;
    readonly utilityStringParses: boolean;
}
export function parseUtility(utilityString: string): ((i: number) => number) | null {
    const scope = { Utility: null, step: step };
    try {
        evaluate(utilityString, scope);
        const parsed = scope.Utility as unknown as ((i: number) => number);
        const test = parsed(10);
        if (!isPositiveFiniteNumber(test)) return null;
        return (i: number) => { return parsed(i) };
    } catch (e) {
        return null
    }
}
export function isPositiveFiniteNumber(x: unknown) {
    return typeof x === 'number' && isFinite(x) && x >=0
}
export function step(x: number): number {
    return x > 0 ? 1 : 0;
}
export interface UtilityState {
    readonly utilityFunction: (wealth: number) => number;
}
