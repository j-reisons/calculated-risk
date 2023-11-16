import { NdArray } from "ndarray";

// A tensor of dimensions (periods, starting_wealth, next_wealth)
// Contains transition probabilities from starting_wealth to next_wealth 
// for the optimal strategies.
export interface OptimalTransitionTensor {
    // [periods](starting_wealth, max_bandwidth)
    values: NdArray[];
    // [periods](starting_wealth)
    supportBandIndices: NdArray[];
    // [periods](starting_wealth)
    supportBandWidths: NdArray[];
}
