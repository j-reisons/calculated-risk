import { Matrix, index, multiply, range, reshape, squeeze, transpose, zeros } from "mathjs";

export interface Problem {
    readonly strategyCDFs: ((r: number) => number)[],
    readonly wealthBoundaries: number[],
    readonly periods: number,
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

    // Add boundary bins
    const wealthBoundaries = [-Infinity, ...problem.wealthBoundaries, Infinity];
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);
    const initUtilities = wealthValues.map(problem.utilityFunction);
    initUtilities[0] = initUtilities[1];
    initUtilities[initUtilities.length - 1] = initUtilities[initUtilities.length - 2];

    const periods = problem.periods;

    const transition = zeros([cashflowToIndex.size, wealthValues.length, problem.strategyCDFs.length, wealthValues.length], 'dense') as Matrix;
    for (const c of indexToCashflow.keys()) {
        const cashflow = indexToCashflow.get(c) as number;
        for (let i = 0; i < wealthValues.length; i++) {
            for (let s = 0; s < problem.strategyCDFs.length; s++) {
                const CDF = problem.strategyCDFs[s];
                for (let j = 0; j < wealthValues.length; j++) {
                    // Guard clause for boundary bins: they only transition to themselves
                    if (i == 0 || i == wealthValues.length - 1) {
                        transition.set([c, i, s, j], i == j ? 1 : 0);
                        continue;
                    }
                    // 0-centered returns
                    const ijtop = ((wealthBoundaries[j + 1] - cashflow) / wealthValues[i]) - 1;
                    const ijbottom = ((wealthBoundaries[j] - cashflow) / wealthValues[i]) - 1;
                    const value = CDF(ijtop) - CDF(ijbottom);
                    transition.set([c, i, s, j], value);
                }
            }
        }
    }

    const allStrategies = range(0, problem.strategyCDFs.length);
    const allWealths = range(0, wealthValues.length);

    let strategies = zeros([periods, wealthValues.length], 'dense') as Matrix;
    let utilities = zeros([periods + 1, wealthValues.length], 'dense') as Matrix;
    utilities.subset(index(periods, allWealths), initUtilities);

    for (let p = periods - 1; p >= 0; p--) {
        const nextUtility = squeeze(utilities.subset(index(p + 1, allWealths)));
        const cashflowIndex = cashflowToIndex.get(problem.cashflows[p]);
        const thisTransition = squeeze(transition.subset(index(cashflowIndex, allWealths, allStrategies, allWealths)));
        const strategyUtilities = contract(thisTransition, nextUtility);

        const optimalStrategies = (strategyUtilities.valueOf() as number[][]).map(max);
        strategies.subset(index(p, allWealths), optimalStrategies.map(item => item.argmax));
        utilities.subset(index(p, allWealths), optimalStrategies.map(item => item.max));
    }

    // Remove boundary bins
    strategies = strategies.subset(index(range(0, periods), range(1, wealthValues.length - 1)));
    utilities = utilities.subset(index(range(0, periods + 1), range(1, wealthValues.length - 1)));

    postProcessStrategies(strategies);

    return {
        optimalStrategies: (transpose(strategies).valueOf() as number[][]),
        utilities: (transpose(utilities).valueOf() as number[][])
    }
}

// -1 strategy indices are output by max when multiple maxima are found.
// This function overwrites -1 areas with values found either above or below them.
// If values are present both above and below a -1 area they must match to be used for overwriting.
function postProcessStrategies(strategies: Matrix): void {
    const strategiesArray = strategies.valueOf() as number[][];
    for (let i = 0; i < strategiesArray.length; i++) {
        const periodArray = strategiesArray[i];
        let j = 0;
        let strategyBelow = -1;
        let defaultStrategy = -1;
        let strategyAbove = -1;
        while (j < periodArray.length) {
            if (periodArray[j] == -1) {
                const start = j;
                while (j < periodArray.length && periodArray[j] == -1) j++;
                strategyAbove = j == periodArray.length ? -1 : periodArray[j];

                if (strategyBelow == -1) {
                    defaultStrategy = strategyAbove;
                } else if (strategyAbove == -1) {
                    defaultStrategy = strategyBelow
                } else if (strategyBelow == strategyAbove) {
                    defaultStrategy = strategyBelow
                } else {
                    defaultStrategy = -1;
                }

                for (let index = start; index < j; index++) {
                    periodArray[index] = defaultStrategy;
                }
                strategyBelow = strategyAbove;
            } else {
                strategyBelow = periodArray[j];
                j++;
            }
        }
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
