import { NdArray } from "ndarray";
import unpack from "ndarray-unpack";
import { Strategy } from "../input/state";
import { TransitionTensor } from "./core";
import { solveCore } from "./coreGPU";
import { computeTransitionTensor, extendWealthBins, replaceUnknownStrategies } from "./transform";

export interface Problem {
    readonly wealthBoundaries: number[],
    readonly wealthValues: number[],
    readonly wealthStep: number,
    readonly periods: number,
    readonly strategies: Strategy[]
    readonly cashflows: number[],
    readonly utilityFunction: (w: number) => number,
}

export interface Solution {
    readonly optimalStrategies: number[][];
    readonly expectedUtilities: number[][];
    trajectoriesInput: TrajectoriesInputs | null;
}

export interface TrajectoriesInputs {
    readonly boundaries: number[];
    readonly values: number[];
    readonly transitionTensor: TransitionTensor,
    readonly optimalStrategies: NdArray,
}

export async function solve(problem: Problem): Promise<Solution> {
    const { boundaries, values, originalRange } = extendWealthBins(problem);

    const finalUtilities = values.map(problem.utilityFunction);
    finalUtilities[0] = 0;

    const transitionTensor = computeTransitionTensor(problem.periods, boundaries, values, problem.strategies.map(s => s.CDF), problem.strategies.map(s => s.support), problem.cashflows);

    // let hasGPU = false;
    // try {
    //     const adapter = await navigator.gpu?.requestAdapter();
    //     const device = await adapter?.requestDevice();
    //     if (device) {
    //         hasGPU = true;
    //     }
    // } catch (e) { e; }

    const { optimalStrategies, expectedUtilities } = await solveCore({ transitionTensor, finalUtilities });
    replaceUnknownStrategies(optimalStrategies);

    // Recover original bins from the extended ones
    const clippedStrategies = optimalStrategies.hi(-1, originalRange[1]).lo(-1, originalRange[0]).transpose(1, 0);
    const clippedExpectedUtilities = expectedUtilities.hi(-1, originalRange[1]).lo(-1, originalRange[0]).transpose(1, 0);

    return {
        optimalStrategies: unpack(clippedStrategies) as number[][],
        expectedUtilities: unpack(clippedExpectedUtilities) as number[][],
        trajectoriesInput: { boundaries, values, transitionTensor, optimalStrategies },
    }
}

