import ndarray, { NdArray } from "ndarray";
import { assign } from "ndarray-ops";
import { zerosND } from "./utils";

// A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
// Contains transition probabilities from starting_wealth to next_wealth 
// for a given period and strategy
// The (starting_wealth, next_wealth) slices of the tensor are band matrices.
export interface TransitionTensor {
    // A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
    values: NdArray[];
    // A tensor of dimensions (periods, starting_wealth, strategy, 2)
    // Contains next_wealth indices between which the values are non-zero
    supportBandIndices: NdArray[];
}

export interface CoreProblem {
    transitionTensor: TransitionTensor;
    // An array of dimension (next_wealth) containing the value of the utility
    // function for each wealth value.
    finalUtilities: number[];
}

export interface CoreSolution {
    // Matrix of dimensions (periods, wealth) containing the indices of optimal strategies
    // -1 values indicate multiple optimal strategies
    readonly optimalStrategies: NdArray;
    // Matrix of dimensions (periods, wealth) containing expected utilities
    readonly expectedUtilities: NdArray;
}


export function coreSolveCPU({ transitionTensor, finalUtilities }: CoreProblem): CoreSolution {
    const periods = transitionTensor.values.length;
    const wealth_size = transitionTensor.values[0].shape[0];

    const optimalStrategies = zerosND([periods, wealth_size]);
    const expectedUtilities = zerosND([periods + 1, wealth_size]);

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
