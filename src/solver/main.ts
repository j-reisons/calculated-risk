import { Matrix, index, range, transpose } from "mathjs";
import { Strategy } from "../input/state";
import { CoreSolution, coreSolveCPU, coreSolveGPU } from "./core";
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
    extendedSolution: ExtendedSolution | null;
}

export interface ExtendedSolution {
    readonly extendedBoundaries: number[];
    readonly originalRange: Matrix;

    readonly extendedOptimalStrategies: Matrix;
    readonly extendedExpectedUtilities: Matrix;
    readonly extendedTransitionTensor: Matrix[];
}

export async function solve(problem: Problem, useGPU = false): Promise<Solution> {
    const { boundaries, values, finalUtilities, originalRange } = extendWealthBins(problem);
    const transitionTensor = computeTransitionTensor(problem.periods, boundaries, values, problem.strategies.map(s => s.CDF), problem.cashflows);

    let coreSolution: CoreSolution;
    if (useGPU) {
        coreSolution = await coreSolveGPU({ transitionTensor, finalUtilities });
    } else {
        coreSolution = coreSolveCPU({ transitionTensor, finalUtilities });
    }
    const { optimalStrategies, expectedUtilities } = coreSolution;

    replaceUnknownStrategies(optimalStrategies);

    // Recover original bins from the extended ones
    const clippedStrategies = optimalStrategies.subset(index(range(0, problem.periods), originalRange));
    const clippedExpectedUtilities = expectedUtilities.subset(index(range(0, problem.periods + 1), originalRange));

    replaceUnknownStrategies(optimalStrategies);

    return {
        optimalStrategies: (transpose(clippedStrategies).valueOf() as number[][]),
        expectedUtilities: (transpose(clippedExpectedUtilities).valueOf() as number[][]),
        extendedSolution:
        {
            extendedBoundaries: boundaries,
            originalRange: originalRange,
            extendedOptimalStrategies: optimalStrategies,
            extendedExpectedUtilities: expectedUtilities,
            extendedTransitionTensor: transitionTensor,
        },
    }
}
