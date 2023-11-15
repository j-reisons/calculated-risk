import { NdArray } from "ndarray";

// A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
// Contains transition probabilities from starting_wealth to next_wealth 
// for a given period and strategy
// The (starting_wealth, next_wealth) slices of the tensor are band matrices.
export interface TransitionTensor {
    // An array of dimension (periods) of NdArrays of dimensions (starting_wealth, strategy, next_wealth)
    values: NdArray[];
    // An array of dimension (periods) of NdArrays of dimensions (starting_wealth, strategy, 2)
    // Contains next_wealth indices between which the values are non-zero
    supportBandIndices: NdArray[];
    // An array of dimension (periods) indicating which periods share identical transition tensor slices
    // e.g. for periods=10 , uniqueValueIndices=[0,0,0,0,0,1,1,1,1,1] indicates that the transition tensor
    // stays identical for periods 0->4 and 5->9.
    uniqueValueIndices: number[];
}

export interface CoreProblem {
    transitionTensor: TransitionTensor;
    // An array of dimension (next_wealth) containing the value of the utility
    // function for each wealth value.
    finalUtilities: number[];
}

export interface CoreSolution {
    // NdArray of dimensions (periods, wealth) containing the indices of optimal strategies
    // NaN values indicate multiple optimal strategies
    readonly optimalStrategies: NdArray;
    // NdArray of dimensions (periods + 1, wealth) containing expected utilities
    readonly expectedUtilities: NdArray;
}