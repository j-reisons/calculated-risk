import { index, matrix, range, transpose } from "mathjs";
import { Strategy } from "../input/state";
import { TransitionTensor, coreSolveCPU } from "./coreCPU";
import { computeTransitionTensor, extendWealthBins, replaceUnknownStrategies } from "./transform";
import { zeros } from "./utils";

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
    extendedSolution: ExtendedSolution | null;
}

export interface ExtendedSolution {
    readonly extendedBoundaries: number[];
    readonly extendedValues: number[];
    // (periods, final_wealth, starting_wealth)
    readonly extendedOptimalTransitionTensor: number[][][];
}

export async function solve(problem: Problem): Promise<Solution> {
    const { boundaries, values, originalRange } = extendWealthBins(problem);

    const finalUtilities = values.map(problem.utilityFunction);
    finalUtilities[0] = 0;

    const transitionTensor = computeTransitionTensor(problem.periods, boundaries, values, problem.strategies.map(s => s.CDF), problem.strategies.map(s => s.support), problem.cashflows);

    const coreSolution = coreSolveCPU({ transitionTensor, finalUtilities });

    const { optimalStrategies, expectedUtilities } = coreSolution;

    replaceUnknownStrategies(optimalStrategies);

    // Recover original bins from the extended ones
    const clippedStrategies = matrix(optimalStrategies).subset(index(range(0, problem.periods), range(...originalRange)));
    const clippedExpectedUtilities = matrix(expectedUtilities).subset(index(range(0, problem.periods + 1), range(...originalRange)));

    return {
        optimalStrategies: (transpose(clippedStrategies).valueOf() as number[][]),
        expectedUtilities: (transpose(clippedExpectedUtilities).valueOf() as number[][]),
        extendedSolution:
        {
            extendedBoundaries: boundaries,
            extendedValues: values,
            extendedOptimalTransitionTensor: indexOptimalTransitionTensor(transitionTensor, optimalStrategies)
        },
    }
}

function indexOptimalTransitionTensor(transitionTensor: TransitionTensor, optimalStrategies: number[][]): number[][][] {
    const periods = optimalStrategies.length;
    const wealthIndexSize = optimalStrategies[0].length;

    const optimalTransitionTensor = zeros([periods, wealthIndexSize, wealthIndexSize]);
    for (let p = 0; p < periods; p++) {
        for (let i = 0; i < wealthIndexSize; i++) {
            const strategyIndex = optimalStrategies[p][i] > 0 ? optimalStrategies[p][i] : 0;
            const [bottom, top] = transitionTensor.supportBandIndices[p][i][strategyIndex];
            for (let j = bottom; j < top; j++) {
                optimalTransitionTensor[p][j][i] = transitionTensor.values[p][i][strategyIndex][j];
            }
        }
    }

    return optimalTransitionTensor;
}
