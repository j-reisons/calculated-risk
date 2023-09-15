import { Matrix, index, multiply, range, reshape, size, squeeze, zeros } from "mathjs";

export interface CoreProblem {
    // A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
    // Contains transition probabilities from starting_wealth to next_wealth 
    // for a given period and strategy
    transitionTensor: Matrix;
    // An array of dimension (next_wealth) containing the value of the utility
    // function for each wealth value.
    finalUtilities: number[];
}

export interface CoreSolution {
    // Matrix of dimensions (periods, wealth) containing the indices of optimal strategies
    // -1 values indicate multiple optimal strategies
    readonly optimalStrategies: Matrix;
    // Matrix of dimensions (periods, wealth) containing expected utilities
    readonly expectedUtilities: Matrix;
}


export function coreSolve({ transitionTensor, finalUtilities }: CoreProblem): CoreSolution {

    const [periods, wealth_size, strategies_size,] = size(transitionTensor).valueOf() as number[];

    const allStrategies = range(0, strategies_size);
    const allWealths = range(0, wealth_size);

    const optimalStrategies = zeros([periods, wealth_size], 'dense') as Matrix;
    const expectedUtilities = zeros([periods + 1, wealth_size], 'dense') as Matrix;
    expectedUtilities.subset(index(periods, allWealths), finalUtilities);

    for (let p = periods - 1; p >= 0; p--) {
        const nextUtility = squeeze(expectedUtilities.subset(index(p + 1, allWealths)));
        const periodTransition = squeeze(transitionTensor.subset(index(p, allWealths, allStrategies, allWealths)));
        const strategyUtilities = contract(periodTransition, nextUtility);
        const periodStrategies = (strategyUtilities.valueOf() as number[][]).map(max);

        optimalStrategies.subset(index(p, allWealths), periodStrategies.map(item => item.argmax));
        expectedUtilities.subset(index(p, allWealths), periodStrategies.map(item => item.max));
    }

    return { optimalStrategies, expectedUtilities };
}

// Wrapper around reshape-multiply to contract 3+ dimensional tensors.
// Contraction occurs between the last dimension of tensor1 with the first dimension of tensor2
function contract(tensor1: Matrix, tensor2: Matrix): Matrix {
    const reshaped1 = reshape(tensor1, [-1, tensor1.size()[tensor1.size().length - 1]]);
    const reshaped2 = reshape(tensor2, [tensor2.size()[0], -1]);

    const resultMatrix = multiply(reshaped1, reshaped2);

    const resultSize = [...tensor1.size().slice(0, -1), ...tensor2.size().slice(1)];
    return reshape(resultMatrix, resultSize);
}

function max(array: number[]): { max: number, argmax: number } {
    return array.reduce(
        (value, x, i) => {
            return x > value.max ?
                { max: x, argmax: i }
                : x === value.max
                    ? { max: x, argmax: -1 } // -1 indicates multiple maxima
                    : value
        },
        { max: 0, argmax: 0 });
}