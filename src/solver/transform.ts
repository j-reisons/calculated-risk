import { Matrix, range, zeros } from "mathjs";
import { Problem } from "./main";

// Pre and post-processing steps around the core solver.

// Extend bins defined by the original wealthBoundaries to include suitable boundary conditions.
// Assign wealth values and utilities to all bins.
// Provide index range of original bins in the extended ones.

export interface WealthBins {
    boundaries: number[],
    values: number[],
    finalUtilities: number[],
    originalRange: Matrix
}
export function extendWealthBins(problem: Problem): WealthBins {
    const boundaries = [-Number.MAX_VALUE, ...problem.wealthBoundaries, Number.MAX_VALUE];
    const values = [...boundaries.keys()].slice(0, -1).map(i => (boundaries[i] + boundaries[i + 1]) / 2);

    const finalUtilities = values.map(problem.utilityFunction);
    finalUtilities[0] = finalUtilities[1];
    finalUtilities[finalUtilities.length - 1] = finalUtilities[finalUtilities.length - 2];

    const originalRange = range(1, values.length - 1)

    return { boundaries, values, finalUtilities, originalRange };
}

function computeCoarseGrid(problem: Problem): number[] {
    const minStrategySize = problem.strategies.reduce(
        (minSize, strategy) => {
            return Math.min(minSize, (Math.abs(strategy.mean) + strategy.vola));
        }
        , Infinity);

    const minAbsoluteCashflow = problem.cashflows.reduce(
        (minAbsoluteCashflow, num) => {
            return Math.min(minAbsoluteCashflow, Math.abs(num));
        }, 0);

    // Below this value, use a linear coarse grid to capture all cashflows accurately
    // Above this value, use a log coarse grid to save memory
    const linToLogWealth = minAbsoluteCashflow / minStrategySize;

    const coarseMin = problem.wealthBoundaries[problem.wealthBoundaries.length - 1];
    const coarseMax = computeCoarseMax(problem);

    const coarseGrid = new Array<number>();
    let prevValue = coarseMin;

    while (prevValue < coarseMax) {
        if (prevValue < linToLogWealth) {
            prevValue = prevValue + minAbsoluteCashflow;
            coarseGrid.push(prevValue);
        }
        else {
            prevValue = prevValue * (1 + minStrategySize);
            coarseGrid.push(prevValue);
        }
    }
    return coarseGrid;
}

function computeCoarseMax(problem: Problem): number {
    const gridMax = problem.wealthBoundaries[problem.wealthBoundaries.length - 1];

    const cashflowRunningSumMax = problem.cashflows.reduce(
        (value, num) => {
            return { max: Math.max(value.max, value.sum + num), sum: value.sum + num }
        }
        , { max: 0, sum: 0 }).max;

    const maxStrategySize = problem.strategies.reduce(
        (maxSize, strategy) => {
            return Math.max(maxSize, (strategy.mean + strategy.vola));
        }
        , 0
    );

    return (gridMax + cashflowRunningSumMax) * (1 + (maxStrategySize * problem.periods));
}

export function computeTransitionTensor(
    periods: number,
    boundaries: number[],
    values: number[],
    strategyCDFs: ((r: number) => number)[],
    cashflows: number[],
): Matrix {
    const transitionTensor = zeros([periods, values.length, strategyCDFs.length, values.length], 'dense') as Matrix;
    for (let p = 0; p < periods; p++) {
        for (let i = 0; i < values.length; i++) {
            for (let s = 0; s < strategyCDFs.length; s++) {
                const CDF = strategyCDFs[s];
                for (let j = 0; j < values.length; j++) {
                    // 0-centered returns
                    const ijtop = ((boundaries[j + 1] - (cashflows[p] || 0)) / values[i]) - 1;
                    const ijbottom = ((boundaries[j] - (cashflows[p] || 0)) / values[i]) - 1;
                    const value = CDF(ijtop) - CDF(ijbottom);
                    transitionTensor.set([p, i, s, j], value);
                }
            }
        }
    }
    return transitionTensor;
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