import { index, range, transpose } from "mathjs";
import { coreSolve } from "./core";
import { computeTransitionTensor, extendWealthBins, replaceUnknownStrategies } from "./transform";

export interface Problem {
    readonly strategyCDFs: ((r: number) => number)[],
    readonly wealthBoundaries: number[],
    readonly periods: number,
    readonly cashflows: number[],
    readonly utilityFunction: (w: number) => number,
}

export interface Solution {
    readonly optimalStrategies: number[][];
    readonly expectedUtilities: number[][];
}

export function solve({ strategyCDFs, wealthBoundaries, periods, cashflows, utilityFunction }: Problem): Solution {

    const { boundaries, values, finalUtilities, originalRange } = extendWealthBins(wealthBoundaries, utilityFunction);
    const transitionTensor = computeTransitionTensor(periods, boundaries, values, strategyCDFs, cashflows);

    let { optimalStrategies, expectedUtilities } = coreSolve({ transitionTensor, finalUtilities });

    // Recover original bins from the extended ones
    optimalStrategies = optimalStrategies.subset(index(range(0, periods), originalRange));
    expectedUtilities = expectedUtilities.subset(index(range(0, periods + 1), originalRange));

    replaceUnknownStrategies(optimalStrategies);

    return {
        optimalStrategies: (transpose(optimalStrategies).valueOf() as number[][]),
        expectedUtilities: (transpose(expectedUtilities).valueOf() as number[][])
    }
}
