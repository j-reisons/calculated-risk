import { range } from "mathjs";

export const GRID_PARAM = "grid";
export interface GridFormState {
    readonly wealthMax: string;
    readonly logStep: string;
    readonly linStep: string;
    readonly periods: string;
}
export interface GridState {
    readonly wealthMax: number;
    readonly logStep: number;
    readonly linStep: number;
    readonly periods: number;

    readonly wealthBoundaries: number[];
    readonly wealthValues: number[];
}

export const START_PARAM = "start";
export interface TrajectoriesStartFormState {
    readonly startingWealth: string;
    readonly startingPeriod: string;
}
export interface TrajectoriesStartState {
    readonly startingWealth: number | null,
    readonly startingPeriod: number | null,
}
export const CIs_PARAM = "CIs";

export interface TrajectoriesState {
    readonly startPeriod: number;
    readonly extendedBoundaries: number[]
    readonly extendedValues: number[]
    readonly extendedTrajectories: number[][];
}

export function linLogGrid(linStep: number, wealthMax: number, logStep: number, periods: number): GridState {
    const linLogBoundary = linStep / logStep;
    const linRange = range(0, linLogBoundary, linStep, true).valueOf() as number[];
    const logRange = (range(Math.log(linRange[linRange.length - 1]), Math.log(wealthMax), Math.log(1 + logStep), true).valueOf() as number[]).map(Math.exp);
    const wealthBoundaries = linRange.slice(0, -1).concat(logRange);
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);
    return { linStep, wealthMax, logStep, wealthBoundaries, wealthValues, periods }
}
