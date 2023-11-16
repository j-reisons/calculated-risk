import { NdArray } from "ndarray";

// A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
// Contains transition probabilities from starting_wealth to next_wealth 
// for a given period and strategy
// Two properties of the tensor are exploited to reduce memory footprint
// * Period slices of the tensor only differ if the period cashflows differ. 
//   Only unique slices are stored.
// * The tensor has a band structure in the (starting_wealth, next_wealth) indices
//   Only non-zero elements are stored, along with band locations and widths.
export interface TransitionTensor {
    // An array of dimension (unique_periods) of NdArrays of dimensions (starting_wealth, strategy, max_bandwidth)
    values: NdArray[];
    // An array of dimension (unique_periods) of NdArrays of dimensions (starting_wealth, strategy)
    // Contains next_wealth indices marking the start of the band.
    supportBandIndices: NdArray[];
    // An array of dimension (unique_periods) of NdArrays of dimensions (starting_wealth, strategy)
    // Contains bandwidths.
    supportBandWidths: NdArray[];
    // An array of dimension (periods) allowing to map from unique_periods to periods.
    // e.g. uniqueValueIndices = [0,0,0,0,0,1,1,1,1,1] indicates that the transition tensor
    // stays identical for periods 0->4 and 5->9, with values stored under values[0] and values[1] respectively.
    uniquePeriodIndices: number[];
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