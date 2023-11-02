import { Matrix, range, zeros } from "mathjs";
import { Problem } from "./main";

// Pre and post-processing steps around the core solver.

// Extend the original bins to create suitable boundary conditions.
// Assign wealth values and utilities to all bins.
// Provide index range of original bins in the extended ones.

export interface ExtendedBins {
    boundaries: number[],
    values: number[],
    originalRange: Matrix
}
export function extendWealthBins(problem: Problem): ExtendedBins {
    const coarseMin = problem.wealthBoundaries[problem.wealthBoundaries.length - 1];
    const coarseMax = computeCoarseMax(problem);
    const coarseStep = computeCoarseStep(problem);
    const coarseBoundaries = (range(Math.log(coarseMin), Math.log(coarseMax), Math.log(1 + coarseStep), true).valueOf() as number[]).map(Math.exp);
    const coarseValues = [...coarseBoundaries.keys()].slice(0, -1).map(i => (coarseBoundaries[i] + coarseBoundaries[i + 1]) / 2);

    const boundaries = [-Number.MAX_VALUE, ...problem.wealthBoundaries, ...coarseBoundaries.slice(1), Number.MAX_VALUE];
    const values = [problem.wealthValues[0], ...problem.wealthValues, ...coarseValues, coarseValues[coarseValues.length - 1]];

    const originalRange = range(1, problem.wealthBoundaries.length + 1)

    return { boundaries, values, originalRange };
}

function computeCoarseStep(problem: Problem): number {
    const minStrategySize = problem.strategies.reduce(
        (minSize, strategy) => {
            return Math.min(minSize, (Math.abs(strategy.location) + strategy.scale));
        }
        , Infinity);
    return Math.max(minStrategySize, problem.wealthStep);
}

function computeCoarseMax(problem: Problem): number {
    const originalMax = problem.wealthBoundaries[problem.wealthBoundaries.length - 1];

    const cashflowRunningSumMax = problem.cashflows.reduce(
        (value, num) => {
            return { max: Math.max(value.max, value.sum + num), sum: value.sum + num }
        }
        , { max: 0, sum: 0 }).max;

    const maxStrategySize = problem.strategies.reduce(
        (maxSize, strategy) => {
            return Math.max(maxSize, (strategy.location + strategy.scale));
        }
        , 0
    );

    return (originalMax + cashflowRunningSumMax) * (1 + (maxStrategySize * problem.periods));
}

export function computeTransitionTensor(
    periods: number,
    boundaries: number[],
    values: number[],
    strategyCDFs: ((r: number) => number)[],
    cashflows: number[],
): Matrix[] {
    const uniqueCashflowIndices = new Map<number, number>()
    const periodsToCashflowIndices = new Map<number, number>()
    let u = 0;
    for (let i = 0; i < periods; i++) {
        const cashflow = cashflows[i] || 0;
        if (!uniqueCashflowIndices.has(cashflow)) {
            uniqueCashflowIndices.set(cashflow, u++);
        }
        periodsToCashflowIndices.set(i, uniqueCashflowIndices.get(cashflow)!);
    }

    const cashflowTransitionMatrices = new Array<Matrix>(uniqueCashflowIndices.size);

    for (const [cashflow, c] of uniqueCashflowIndices) {
        cashflowTransitionMatrices[c] = zeros([values.length, strategyCDFs.length, values.length], 'dense') as Matrix;
        const array = (cashflowTransitionMatrices[c].valueOf() as unknown) as number[][][];
        // Bankruptcy treatment, i.e. i=0
        for (let s = 0; s < strategyCDFs.length; s++) {
            array[0][s][0] = 1;
        }
        for (let i = 1; i < values.length; i++) {
            for (let s = 0; s < strategyCDFs.length; s++) {
                const CDF = strategyCDFs[s];
                for (let j = 0; j < values.length; j++) {
                    // 0-centered returns
                    const ijtop = ((boundaries[j + 1] - cashflow) / values[i]) - 1;
                    const ijbottom = ((boundaries[j] - cashflow) / values[i]) - 1;
                    const value = CDF(ijtop) - CDF(ijbottom);
                    array[i][s][j] = value;
                }
            }
        }
    }

    const transitionMatrices = new Array<Matrix>(periods);

    for (let p = 0; p < periods; p++) {
        transitionMatrices[p] = cashflowTransitionMatrices[periodsToCashflowIndices.get(p)!];
    }

    return transitionMatrices;
}

// -1 indices are output by the solver when multiple maxima are found.
// This function overwrites -1 areas with values found either above or below them.
// If values are present both above and below a -1 area they must match to be used for overwriting.
export function replaceUnknownStrategies(optimalStrategies: Matrix): void {
    const strategiesArray = optimalStrategies.valueOf() as number[][];
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