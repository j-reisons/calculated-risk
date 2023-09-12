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
    return (r: number) => { return 0.5 * (1 + erf((r - mu) / (1.41421356237 * sigma))) }
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