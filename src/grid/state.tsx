import { range } from "mathjs";

export interface GridFormState {
    readonly wealthMin: string;
    readonly wealthMax: string;
    readonly wealthStep: string;
    readonly periods: string;
}

export interface GridState {
    readonly wealthBoundaries: number[];
    readonly wealthMin: number;
    readonly wealthStep: number;
    readonly wealthMax: number;
    readonly periods: number;
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

export function logRange(min: number, max: number, step: number): number[] {
    return (range(Math.log(min), Math.log(max), Math.log(1 + step), true).valueOf() as number[]).map(Math.exp)
}

