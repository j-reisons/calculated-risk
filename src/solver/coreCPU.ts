import { zeros } from "./utils";

// A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
// Contains transition probabilities from starting_wealth to next_wealth 
// for a given period and strategy
// The (starting_wealth, next_wealth) slices of the tensor are band matrices.
export interface TransitionTensor {
    // A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
    values: number[][][][];
    // A tensor of dimensions (periods, starting_wealth, strategy, 2)
    // Contains next_wealth indices between which the values are non-zero
    supportBandIndices: [number, number][][][];
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
    readonly optimalStrategies: number[][];
    // Matrix of dimensions (periods, wealth) containing expected utilities
    readonly expectedUtilities: number[][];
}


export function coreSolveCPU({ transitionTensor, finalUtilities }: CoreProblem): CoreSolution {
    const periods = transitionTensor.values.length;
    const wealth_size = transitionTensor.values[0].length;

    const optimalStrategies = zeros([periods, wealth_size]);
    const expectedUtilities = zeros([periods + 1, wealth_size]);
    expectedUtilities[periods] = finalUtilities;

    for (let p = periods - 1; p >= 0; p--) {
        const strategyUtilities = contract(transitionTensor.values[p],
            transitionTensor.supportBandIndices[p],
            expectedUtilities[p + 1]);

        const periodStrategies = strategyUtilities.map(max);

        optimalStrategies[p] = periodStrategies.map(item => item.argmax);
        expectedUtilities[p] = periodStrategies.map(item => item.max);
    }

    return { optimalStrategies, expectedUtilities };
}

function contract(transitionValues: number[][][],
    transitionBandIndices: [number, number][][],
    nextUtility: number[]): number[][] {

    const result = zeros([transitionValues.length, transitionValues[0].length]);

    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[0].length; j++) {
            const [bottom, top] = transitionBandIndices[i][j];
            for (let k = bottom; k < top; k++) {
                result[i][j] += transitionValues[i][j][k] * nextUtility[k];
            }
        }
    }

    return result;
}

const EPSILON = 1E-10;
function max(array: number[]): { max: number, argmax: number } {
    return array.reduce(
        (value, x, i) => {
            return x > value.max + EPSILON ?
                { max: x, argmax: i }
                : x === value.max
                    ? { max: x, argmax: NaN } // NaN indicates multiple maxima
                    : value
        },
        { max: 0, argmax: 0 });
}
