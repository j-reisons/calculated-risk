import ndarray, { NdArray } from "ndarray";
import { assign } from "ndarray-ops";
import { CoreProblem, CoreSolution } from "./core";
import { zerosND } from "./utils";


export function solveCoreCPU({ transitionTensor, finalUtilities }: CoreProblem): CoreSolution {
    const periods = transitionTensor.values.length;
    const wealthSize = transitionTensor.values[0].shape[0];

    const optimalStrategies = zerosND([periods, wealthSize]);
    const expectedUtilities = zerosND([periods + 1, wealthSize]);

    assign(expectedUtilities.pick(periods, null), ndarray(finalUtilities));

    for (let p = periods - 1; p >= 0; p--) {
        const strategyUtilities = contract(transitionTensor.values[p],
            transitionTensor.supportBandIndices[p],
            expectedUtilities.pick(p + 1, null));


        for (let i = 0; i < strategyUtilities.shape[0]; i++) {
            const wealthStrategyUtilities = strategyUtilities.pick(i, null);
            const m = max(wealthStrategyUtilities);
            optimalStrategies.set(p, i, m.argmax);
            expectedUtilities.set(p, i, m.max);
        }
    }

    return { optimalStrategies, expectedUtilities };
}

function contract(transitionValues: NdArray,
    transitionBandIndices: NdArray,
    nextUtility: NdArray): NdArray {

    const result = zerosND(transitionValues.shape.slice(0, -1));

    for (let i = 0; i < result.shape[0]; i++) {
        for (let j = 0; j < result.shape[1]; j++) {
            const bottom = transitionBandIndices.get(i, j, 0);
            const top = transitionBandIndices.get(i, j, 1);
            let resultValue = 0;
            for (let k = bottom; k < top; k++) {
                resultValue += transitionValues.get(i, j, k) * nextUtility.get(k);
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
