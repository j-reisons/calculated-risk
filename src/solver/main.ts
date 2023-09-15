import { Matrix, index, range, transpose, zeros } from "mathjs";
import { coreSolve } from "./solve";
import { computeWealthBins, replaceUnknownStrategies } from "./transform";

export interface Problem {
    readonly strategyCDFs: ((r: number) => number)[],
    readonly wealthBoundaries: number[],
    readonly periods: number,
    readonly cashflows: number[],
    readonly utilityFunction: (w: number) => number,
}

export interface Solution {
    readonly optimalStrategies: number[][];
    readonly utilities: number[][];
}

export function solve({ strategyCDFs, wealthBoundaries, periods, cashflows, utilityFunction }: Problem): Solution {

    // Add boundary bins
    const { boundaries, values, finalUtilities, resultRange } = computeWealthBins(wealthBoundaries, utilityFunction);

    const transitionTensor = zeros([periods, values.length, strategyCDFs.length, values.length], 'dense') as Matrix;
    for (let p = 0; p < periods; p++) {
        for (let i = 0; i < values.length; i++) {
            for (let s = 0; s < strategyCDFs.length; s++) {
                const CDF = strategyCDFs[s];
                for (let j = 0; j < values.length; j++) {
                    // Guard clause for boundary bins: they only transition to themselves
                    // This is not ideal.
                    // Top should be able to go down
                    // Bottom should not be able to go up
                    if (i == 0 || i == values.length - 1) {
                        transitionTensor.set([p, i, s, j], i == j ? 1 : 0);
                        continue;
                    }
                    // 0-centered returns
                    const ijtop = ((boundaries[j + 1] - (cashflows[p] || 0)) / values[i]) - 1;
                    const ijbottom = ((boundaries[j] - (cashflows[p] || 0)) / values[i]) - 1;
                    const value = CDF(ijtop) - CDF(ijbottom);
                    transitionTensor.set([p, i, s, j], value);
                }
            }
        }
    }

    let { optimalStrategies, expectedUtilities } = coreSolve({ transitionTensor, finalUtilities });

    // Remove boundary bins
    optimalStrategies = optimalStrategies.subset(index(range(0, periods), resultRange));
    expectedUtilities = expectedUtilities.subset(index(range(0, periods + 1), resultRange));

    replaceUnknownStrategies(optimalStrategies);

    return {
        optimalStrategies: (transpose(optimalStrategies).valueOf() as number[][]),
        utilities: (transpose(expectedUtilities).valueOf() as number[][])
    }
}
