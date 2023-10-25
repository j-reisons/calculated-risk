import { Matrix, index, range, transpose, zeros } from "mathjs";
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
    // (periods, final_wealth, starting_wealth)
    readonly extendedOptimalTransitionTensor: Matrix[];
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

    return {
        optimalStrategies: (transpose(clippedStrategies).valueOf() as number[][]),
        expectedUtilities: (transpose(clippedExpectedUtilities).valueOf() as number[][]),
        extendedSolution:
        {
            extendedBoundaries: boundaries,
            originalRange: originalRange,
            extendedOptimalTransitionTensor: indexOptimalTransitionTensor(transitionTensor, optimalStrategies)
        },
    }
}

function indexOptimalTransitionTensor(transitionTensor: Matrix[], optimalStrategies: Matrix): Matrix[] {
    const optimalTransitionTensor = new Array<Matrix>(transitionTensor.length);
    const optimalStrategiesArray = optimalStrategies.valueOf() as number[][];
    const wealthIndexSize = transitionTensor[0].size()[0];
    for (let p = 0; p < transitionTensor.length; p++) {
        const transitionTensorArray = transitionTensor[p].valueOf() as unknown as number[][][];
        const optimalTransitionMatrix = zeros([wealthIndexSize, wealthIndexSize], 'dense') as Matrix;
        const optimalTransitionMatrixArray = optimalTransitionMatrix.valueOf() as number[][];
        for (let i = 0; i < wealthIndexSize; i++) {
            for (let j = 0; j < wealthIndexSize; j++) {
                optimalTransitionMatrixArray[j][i] = transitionTensorArray[i][optimalStrategiesArray[p][i] || 0][j];
            }
        }
        optimalTransitionTensor[p] = optimalTransitionMatrix;
    }
    return optimalTransitionTensor;
}
