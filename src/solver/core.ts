import { NdArray } from "ndarray";

// A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
// Contains transition probabilities from starting_wealth to next_wealth 
// for a given period and strategy
// Two properties of the tensor are exploited to reduce memory footprint and speed up calculations.
// * Period slices of the tensor only differ if the period cashflows differ. 
//   Only unique slices are stored.
// * The tensor has a rough band structure in the (starting_wealth, next_wealth) indices.
//   More specifically for any (periods,starting_wealth,strategy) slice there is a single 
//   next_wealth interval over which the transition tensor can take non-zero values.
//   Locations and widths of these intervals are stored, and values are stored 
//   in an NdArray sized (starting_wealth, strategy, max_bandwidth) instead of (starting_wealth, strategy, next_wealth).
//   This could be further compacted to store only non-zero values ( as-is bands narrower than max_bandwidth include zeroes ) but I haven't felt the need yet yet.
export interface TransitionTensor {
    // [unique_periods](starting_wealth, strategy, max_bandwidth)
    values: NdArray[];
    // Contains next_wealth indices marking the start of the band.
    // [unique_periods](starting_wealth, strategy)
    supportBandIndices: NdArray[];
    // Contains bandwidths.
    // [unique_periods](starting_wealth, strategy)
    supportBandWidths: NdArray[];
    // An array of dimension [periods] allowing to map from unique_periods to periods.
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