import { range } from "mathjs";

export interface GridFormState {
    readonly wealthMin: string;
    readonly wealthMax: string;
    readonly wealthStep: string;
    readonly periods: string;
}

export interface GridState {
    readonly wealthMin: number;
    readonly wealthMax: number;
    readonly wealthStep: number;
    readonly periods: number;

    readonly wealthBoundaries: number[];
    readonly wealthValues: number[];
}

export interface TrajectoriesInputFormState {
    readonly startingWealth: string;
    readonly startingPeriod: string;
    readonly quantiles: string;
    readonly pickOnClick: boolean;
}

export interface TrajectoriesInputState {
    readonly startingWealth: number | null,
    readonly startingPeriod: number | null,
    readonly quantiles: number[],
    readonly pickOnClick: boolean;
}

export interface TrajectoriesState {
    readonly startPeriod: number;
    readonly extendedBoundaries: number[]
    readonly extendedValues: number[]
    readonly extendedTrajectories: number[][];
}

export function logGrid(wealthMin: number, wealthMax: number, wealthStep: number, periods: number): GridState {
    const wealthBoundaries = (range(Math.log(wealthMin), Math.log(wealthMax), Math.log(1 + wealthStep), true).valueOf() as number[]).map(Math.exp);
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);
    return { wealthMin, wealthMax, wealthStep, wealthBoundaries, wealthValues, periods }
}

