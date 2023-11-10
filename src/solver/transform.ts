import { range } from "mathjs";
import { TransitionTensor } from "./coreCPU";
import { Problem } from "./main";
import { zeros } from "./utils";

// Pre and post-processing steps around the core solver.

// Extend the original bins to create suitable boundary conditions.
// Assign wealth values and utilities to all bins.
// Provide index range of original bins in the extended ones.

export interface ExtendedBins {
    boundaries: number[],
    values: number[],
    originalRange: [number, number]
}
export function extendWealthBins(problem: Problem): ExtendedBins {
    const coarseMin = problem.wealthBoundaries[problem.wealthBoundaries.length - 1];
    const coarseMax = computeCoarseMax(problem);
    const coarseStep = computeCoarseStep(problem);
    const coarseBoundaries = (range(Math.log(coarseMin), Math.log(coarseMax), Math.log(1 + coarseStep), true).valueOf() as number[]).map(Math.exp);
    const coarseValues = [...coarseBoundaries.keys()].slice(0, -1).map(i => (coarseBoundaries[i] + coarseBoundaries[i + 1]) / 2);

    const boundaries = [-Number.MAX_VALUE, ...problem.wealthBoundaries, ...coarseBoundaries.slice(1), Number.MAX_VALUE];
    const values = [problem.wealthValues[0], ...problem.wealthValues, ...coarseValues, coarseValues[coarseValues.length - 1]];

    return { boundaries, values, originalRange: [1, problem.wealthBoundaries.length + 1] };
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
    supports: [number, number][],
    cashflows: number[],
): TransitionTensor {
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

    const cashflowTransitionValues = new Array<number[][][]>(uniqueCashflowIndices.size);
    const cashflowBandIndices = new Array<[number, number][][]>(uniqueCashflowIndices.size);

    for (const [cashflow, c] of uniqueCashflowIndices) {

        cashflowTransitionValues[c] = zeros([values.length, strategyCDFs.length, values.length]);
        cashflowBandIndices[c] = zeros([values.length, strategyCDFs.length, 2]) as [number, number][][];
        // Bankruptcy treatment, i.e. i=0
        for (let s = 0; s < strategyCDFs.length; s++) {
            cashflowTransitionValues[c][0][s][0] = 1;
            cashflowBandIndices[c][0][s][1] = 1;
            cashflowBandIndices[c][0][s][0] = 0;
        }
        for (let i = 1; i < values.length; i++) {
            for (let s = 0; s < strategyCDFs.length; s++) {
                const CDF = strategyCDFs[s];

                const support = supports[s];
                const wealthBottom = ((support[0] + 1) * values[i]) + cashflow;
                const wealthTop = ((support[1] + 1) * values[i]) + cashflow;
                const indexBottom = Math.max(binarySearch(boundaries, v => v > wealthBottom) - 2, 0); // I don't trust myself with the off-by-ones
                const indexTop = Math.min(binarySearch(boundaries, v => v > wealthTop) + 1, values.length);
                cashflowBandIndices[c][i][s][0] = indexBottom;
                cashflowBandIndices[c][i][s][1] = indexTop;

                let CDFbottom;
                let CDFtop = CDF(((boundaries[indexBottom] - cashflow) / values[i]) - 1);

                for (let j = indexBottom; j < indexTop; j++) {
                    CDFbottom = CDFtop;
                    CDFtop = CDF(((boundaries[j + 1] - cashflow) / values[i]) - 1);
                    cashflowTransitionValues[c][i][s][j] = CDFtop - CDFbottom;
                }
            }
        }
    }

    const periodTransitionValues = new Array<number[][][]>(periods);
    const periodBandIndices = new Array<[number, number][][]>(periods);

    for (let p = 0; p < periods; p++) {
        const cashflowIndex = periodsToCashflowIndices.get(p)!
        periodTransitionValues[p] = cashflowTransitionValues[cashflowIndex];
        periodBandIndices[p] = cashflowBandIndices[cashflowIndex];
    }

    return { values: periodTransitionValues, supportBandIndices: periodBandIndices };
}

// NaN indices are output by the solver when multiple maxima are found.
// This function overwrites NaN areas with values found either above or below them.
// If values are present both above and below a NaN area they must match to be used for overwriting.
export function replaceUnknownStrategies(optimalStrategies: number[][]): void {
    for (let i = 0; i < optimalStrategies.length; i++) {
        const periodArray = optimalStrategies[i];
        let j = 0;
        let strategyBelow = NaN;
        let defaultStrategy = NaN;
        let strategyAbove = NaN;
        while (j < periodArray.length) {
            if (isNaN(periodArray[j])) {
                const start = j;
                while (j < periodArray.length && isNaN(periodArray[j])) j++;
                strategyAbove = j == periodArray.length ? NaN : periodArray[j];

                if (isNaN(strategyBelow)) {
                    defaultStrategy = strategyAbove;
                } else if (isNaN(strategyAbove)) {
                    defaultStrategy = strategyBelow
                } else if (strategyBelow == strategyAbove) {
                    defaultStrategy = strategyBelow
                } else {
                    defaultStrategy = NaN;
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

function binarySearch(arr: number[], predicate: (v: number) => boolean): number {
    let low = 0;
    let high = arr.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        if (predicate(arr[mid])) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    return low < arr.length ? low : -1;
}