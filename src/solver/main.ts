import { index, range, transpose } from "mathjs";
import { Strategy } from "../input/state";
import { coreSolve } from "./core";
import { computeTransitionTensor, extendWealthBins, replaceUnknownStrategies } from "./transform";

export interface Problem {
    readonly strategies: Strategy[]
    readonly wealthBoundaries: number[],
    readonly periods: number,
    readonly cashflows: number[],
    readonly utilityFunction: (w: number) => number,
}

export interface Solution {
    readonly optimalStrategies: number[][];
    readonly expectedUtilities: number[][];
}

export function solve(problem: Problem): Solution {

    const { boundaries, values, finalUtilities, originalRange } = extendWealthBins(problem);
    const transitionTensor = computeTransitionTensor(problem.periods, boundaries, values, problem.strategies.map(s => s.CDF), problem.cashflows);

    let { optimalStrategies, expectedUtilities } = coreSolve({ transitionTensor, finalUtilities });

    // Recover original bins from the extended ones
    optimalStrategies = optimalStrategies.subset(index(range(0, problem.periods), originalRange));
    expectedUtilities = expectedUtilities.subset(index(range(0, problem.periods + 1), originalRange));

    replaceUnknownStrategies(optimalStrategies);

    return {
        optimalStrategies: (transpose(optimalStrategies).valueOf() as number[][]),
        expectedUtilities: (transpose(expectedUtilities).valueOf() as number[][])
    }
}
