import { Matrix, index, multiply, range, reshape, squeeze, transpose, zeros } from "mathjs";

export interface Problem {
    readonly strategyCDFs: ((r: number) => number)[],
    readonly wealthBoundaries: number[],
    readonly cashflows: number[],
    readonly utilityFunction: (w: number) => number,
}

export interface Solution {
    readonly optimalStrategies: number[][];
    readonly utilities: number[][];
}

export function solve(problem: Problem): Solution {

    const cashflowToIndex: Map<number, number> = new Map<number, number>();
    const indexToCashflow: Map<number, number> = new Map<number, number>();
    let cashflowIndex = 0;
    for (const num of problem.cashflows) {
        if (!(num in cashflowToIndex)) {
            cashflowToIndex.set(num, cashflowIndex);
            indexToCashflow.set(cashflowIndex++, num);
        }
    }

    const wealthBoundaries = problem.wealthBoundaries;
    const periods = problem.cashflows.length;
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);

    const transition = zeros([cashflowToIndex.size, wealthValues.length, problem.strategyCDFs.length, wealthValues.length], 'dense') as Matrix;
    for (const c of indexToCashflow.keys()) {
        const cashflow = indexToCashflow.get(c) as number;
        for (let i = 0; i < wealthValues.length; i++) {
            for (let s = 0; s < problem.strategyCDFs.length; s++) {
                const CDF = problem.strategyCDFs[s];
                for (let j = 0; j < wealthValues.length; j++) {
                    const ijtop = ((wealthBoundaries[j + 1] - cashflow) / wealthValues[i]) - 1; // 0-centered returns
                    const ijbottom = ((wealthBoundaries[j] - cashflow) / wealthValues[i]) - 1;
                    const value = CDF(ijtop) - CDF(ijbottom);
                    transition.set([c, i, s, j], value);
                }
            }
        }
    }

    const allStrategies = range(0, problem.strategyCDFs.length);
    const allWealths = range(0, wealthValues.length);

    const strategies = zeros([periods, wealthValues.length], 'dense') as Matrix;
    const utilities = zeros([periods + 1, wealthValues.length], 'dense') as Matrix;
    utilities.subset(index(periods, allWealths), wealthValues.map(problem.utilityFunction));

    for (let p = periods - 1; p >= 0; p--) {
        const nextUtility = squeeze(utilities.subset(index(p + 1, allWealths)));
        const cashflowIndex = cashflowToIndex.get(problem.cashflows[p]);
        const thisTransition = squeeze(transition.subset(index(cashflowIndex, allWealths, allStrategies, allWealths)));
        const strategyUtilities = contract(thisTransition, nextUtility);

        const optimalStrategies = (strategyUtilities.valueOf() as number[][]).map(max);
        strategies.subset(index(p, allWealths), optimalStrategies.map(item => item.argmax));
        utilities.subset(index(p, allWealths), optimalStrategies.map(item => item.max));
    }

    return {
        optimalStrategies: (transpose(strategies).valueOf() as number[][]),
        utilities: (transpose(utilities).valueOf() as number[][])
    }
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

// Wrapper around reshape-multiply to multiply Matrices 3+ dimensional matrices.
function contract(tensor1: Matrix, tensor2: Matrix): Matrix {
    if (tensor1.size()[tensor1.size().length - 1] !== tensor2.size()[0]) {
        throw new Error('Cannot contract tensors: Incompatible dimensions');
    }

    const reshaped1 = reshape(tensor1, [-1, tensor1.size()[tensor1.size().length - 1]]);
    const reshaped2 = reshape(tensor2, [tensor2.size()[0], -1]);

    const resultMatrix = multiply(reshaped1, reshaped2);

    const resultSize = [...tensor1.size().slice(0, -1), ...tensor2.size().slice(1)];
    return reshape(resultMatrix, resultSize);
}
