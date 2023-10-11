import { erf } from "mathjs";

export interface CashflowsFormState {
    // Contents of the textarea
    readonly cashflowString: string;
    // Set on blur, reset on focus
    readonly cashflowStringValid: boolean;
}

export interface CashflowsState {
    readonly cashflows: number[];
}

export interface StrategiesState {
    readonly strategies: Strategy[];
}

export interface Strategy {
    readonly name: string,
    readonly CDF: (r: number) => number;
    // Easier to pass along than compute from the CDF
    readonly mean: number;
    readonly vola: number;
}

export interface StrategiesFormState {
    // Contents of the textarea
    readonly strategiesString: string;
    // Set on blur, reset on focus
    readonly strategiesStringValid: boolean;
    readonly strategies: Strategy_[];
}

export interface Strategy_ {
    readonly name: string;
    readonly mu: number;
    readonly sigma: number;
}

export function normalCdf(mu: number, sigma: number): (r: number) => number {
    return (r: number) => { return 0.5 * (1 + cachedErf((r - mu) / (1.41421356237 * sigma))) }
}

const CACHE = Array<number>(20001);
const START = -5;
const END = 5;
const STEP = ((END - START) / (CACHE.length - 1));
for (let i = 0; i < CACHE.length; i++) {
    CACHE[i] = erf(START + STEP * i);
}

function cachedErf(x: number): number {
    if (x < START + STEP) return -1;
    if (x > END - STEP) return 1;
    const i = Math.floor((x - START) / STEP);
    const rest = x - START - (STEP * i);
    return (1 - rest) * CACHE[i] + (rest) * CACHE[i + 1];
}

export interface UtilityFormState {
    readonly utilityString: string;
}

export interface UtilityState {
    readonly utilityFunction: (wealth: number) => number;
}

export function step(x: number): number {
    return x > 0 ? 1 : 0;
}