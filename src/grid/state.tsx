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

export interface TrajectoriesState {
    readonly startPeriod: number;
    readonly startWealthIndex: number;
    readonly trajectories: number[][];
}

export function logRange(min: number, max: number, step: number): number[] {
    return (range(Math.log(min), Math.log(max), Math.log(1 + step), true).valueOf() as number[]).map(Math.exp)
}

