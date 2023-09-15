import { Matrix, index, range, transpose, zeros } from "mathjs";
import { postProcessStrategies } from "./postprocess";
import { coreSolve } from "./solve";

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
    wealthBoundaries = [-Infinity, ...wealthBoundaries, Infinity];
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);
    const finalUtilities = wealthValues.map(utilityFunction);
    finalUtilities[0] = finalUtilities[1];
    finalUtilities[finalUtilities.length - 1] = finalUtilities[finalUtilities.length - 2];

    const transitionTensor = zeros([periods, wealthValues.length, strategyCDFs.length, wealthValues.length], 'dense') as Matrix;
    for (let p = 0; p < periods; p++) {
        for (let i = 0; i < wealthValues.length; i++) {
            for (let s = 0; s < strategyCDFs.length; s++) {
                const CDF = strategyCDFs[s];
                for (let j = 0; j < wealthValues.length; j++) {
                    // Guard clause for boundary bins: they only transition to themselves
                    // This is not ideal.
                    // Top should be able to go down
                    // Bottom should not be able to go up
                    if (i == 0 || i == wealthValues.length - 1) {
                        transitionTensor.set([p, i, s, j], i == j ? 1 : 0);
                        continue;
                    }
                    // 0-centered returns
                    const ijtop = ((wealthBoundaries[j + 1] - (cashflows[p] || 0)) / wealthValues[i]) - 1;
                    const ijbottom = ((wealthBoundaries[j] - (cashflows[p] || 0)) / wealthValues[i]) - 1;
                    const value = CDF(ijtop) - CDF(ijbottom);
                    transitionTensor.set([p, i, s, j], value);
                }
            }
        }
    }

    let { optimalStrategies, expectedUtilities } = coreSolve({ transitionTensor, finalUtilities });

    // Remove boundary bins
    optimalStrategies = optimalStrategies.subset(index(range(0, periods), range(1, wealthValues.length - 1)));
    expectedUtilities = expectedUtilities.subset(index(range(0, periods + 1), range(1, wealthValues.length - 1)));

    postProcessStrategies(optimalStrategies);

    return {
        optimalStrategies: (transpose(optimalStrategies).valueOf() as number[][]),
        utilities: (transpose(expectedUtilities).valueOf() as number[][])
    }
}
