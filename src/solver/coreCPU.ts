import ndarray, { NdArray } from "ndarray";
import { assign } from "ndarray-ops";
import { CoreProblem, CoreSolution, TransitionTensor } from "./core";
import { zerosND } from "./utils";


export function solveCore({ transitionTensor, finalUtilities }: CoreProblem): CoreSolution {
    const periods = transitionTensor.uniquePeriodIndices.length;
    const wealthSize = finalUtilities.length;

    const optimalStrategies = zerosND([periods, wealthSize]);
    const expectedUtilities = zerosND([periods + 1, wealthSize]);

    assign(expectedUtilities.pick(periods, null), ndarray(finalUtilities));

    for (let p = periods - 1; p >= 0; p--) {
        const strategyUtilities = contract(transitionTensor,
            expectedUtilities.pick(p + 1, null), p);

        for (let i = 0; i < strategyUtilities.shape[0]; i++) {
            const wealthStrategyUtilities = strategyUtilities.pick(i, null);
            const m = max(wealthStrategyUtilities);
            optimalStrategies.set(p, i, m.argmax);
            expectedUtilities.set(p, i, m.max);
        }
    }

    return { optimalStrategies, expectedUtilities };
}

function contract(transitionTensor: TransitionTensor,
    nextUtility: NdArray,
    period: number): NdArray {
    const uniqueIndex = transitionTensor.uniquePeriodIndices[period];
    const values = transitionTensor.values[uniqueIndex];
    const supportBandIndices = transitionTensor.supportBandIndices[uniqueIndex];
    const supportBandWidths = transitionTensor.supportBandWidths[uniqueIndex];

    const result = zerosND(values.shape.slice(0, -1));

    for (let i = 0; i < result.shape[0]; i++) {
        for (let j = 0; j < result.shape[1]; j++) {
            const bandIndex = supportBandIndices.get(i, j);
            const bandWidth = supportBandWidths.get(i, j);
            let resultValue = 0;
            for (let k = 0; k < bandWidth; k++) {
                resultValue += values.get(i, j, k) * nextUtility.get(bandIndex + k);
            }
            result.set(i, j, resultValue);
        }
    }

    return result;
}

const EPSILON = 1E-10;
function max(array: NdArray): { max: number, argmax: number } {
    let max = 0;
    let argmax = 0;

    for (let i = 0; i < array.shape[0]; i++) {
        const value = array.get(i);
        if (value > max + EPSILON) {
            max = value;
            argmax = i;
        } else if (value === max) {
            argmax = NaN;
        }
    }
    return { max, argmax };
}
