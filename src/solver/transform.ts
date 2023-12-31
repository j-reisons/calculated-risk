import { NdArray } from "ndarray";
import { TransitionTensor } from "./core";
import { Problem } from "./main";
import { zerosND } from "./utils";

// Pre and post-processing steps around the core solver.

// Extend the original wealth range to create suitable boundary conditions.
export interface ExtendedProblem {
    problem: Problem,
    originalWealthRange: [number, number]
}
export function extendWealthRange(originalProblem: Problem): ExtendedProblem {
    const coarseBoundaries = computeCoarseBoundaries(originalProblem);
    const coarseValues = [...coarseBoundaries.keys()].slice(0, -1).map(i => (coarseBoundaries[i] + coarseBoundaries[i + 1]) / 2);

    const wealthBoundaries = [-Number.MAX_VALUE, ...originalProblem.wealthBoundaries, ...coarseBoundaries.slice(1), Number.MAX_VALUE];
    const wealthValues = [originalProblem.wealthValues[0], ...originalProblem.wealthValues, ...coarseValues, coarseValues[coarseValues.length - 1]];

    return {
        problem: {
            ...originalProblem,
            wealthBoundaries,
            wealthValues
        },
        originalWealthRange: [1, originalProblem.wealthBoundaries.length + 1]
    };
}

function computeCoarseBoundaries(problem: Problem): number[] {
    const originalMax = problem.wealthBoundaries[problem.wealthBoundaries.length - 1];
    const cashflowRunningSumMax = problem.cashflows.reduce(
        (value, num) => {
            return { max: Math.max(value.max, value.sum + num), sum: value.sum + num }
        }
        , { max: 0, sum: 0 }).max;

    const coarseNeeds = problem.strategies.map(
        s => {
            const multiplier = Math.exp(Math.log(1 + s.location) * problem.periods + Math.log(1 + s.scale) * Math.sqrt(problem.periods));
            return {
                coarseStep: Math.max(s.scale / 2, problem.logStep),
                coarseMax: (originalMax + cashflowRunningSumMax) * multiplier
            }
        }
    ).sort((a, b) => a.coarseStep - b.coarseStep);

    const logRange = [Math.log(problem.wealthBoundaries[problem.wealthBoundaries.length - 1])];
    for (let i = 0; i < coarseNeeds.length; i++) {
        const logStep = Math.log(1 + coarseNeeds[i].coarseStep);
        const logMax = Math.log(coarseNeeds[i].coarseMax);
        while (logRange[logRange.length - 1] < logMax) {
            logRange.push(logRange[logRange.length - 1] + logStep);
        }
    }
    return logRange.map(Math.exp);
}

export function computeTransitionTensor({ periods, wealthBoundaries, wealthValues, strategies, cashflows }: Problem): TransitionTensor {
    const strategyCDFs = strategies.map(s => s.CDF);
    const supports = strategies.map(s => s.support);

    const uniqueCashflowIndices = new Map<number, number>()
    const uniquePeriodIndices = new Array<number>(periods);
    let u = 0;
    for (let i = 0; i < periods; i++) {
        const cashflow = cashflows[i] || 0;
        if (!uniqueCashflowIndices.has(cashflow)) {
            uniqueCashflowIndices.set(cashflow, u++);
        }
        uniquePeriodIndices[i] = uniqueCashflowIndices.get(cashflow)!;
    }

    const transitionValues = new Array<NdArray>(uniqueCashflowIndices.size);
    const supportBandIndices = new Array<NdArray>(uniqueCashflowIndices.size);
    const supportBandWidths = new Array<NdArray>(uniqueCashflowIndices.size);

    for (const [cashflow, c] of uniqueCashflowIndices) {
        let maxBandwidth = 0;
        supportBandIndices[c] = zerosND([wealthValues.length, strategyCDFs.length]);
        supportBandWidths[c] = zerosND([wealthValues.length, strategyCDFs.length]);
        // Bankruptcy treatment, i.e. i=0
        for (let s = 0; s < strategyCDFs.length; s++) {
            supportBandIndices[c].set(0, s, 0);
            supportBandWidths[c].set(0, s, 1);
        }
        for (let i = 1; i < wealthValues.length; i++) {
            for (let s = 0; s < strategyCDFs.length; s++) {
                const support = supports[s];
                const wealthBottom = ((support[0] + 1) * wealthValues[i]) + cashflow;
                const wealthTop = ((support[1] + 1) * wealthValues[i]) + cashflow;
                const indexBottom = Math.max(binarySearch(wealthBoundaries, v => v > wealthBottom) - 2, 0); // I don't trust myself with the off-by-ones
                const indexTop = Math.min(binarySearch(wealthBoundaries, v => v > wealthTop) + 1, wealthValues.length);
                const bandWidth = indexTop - indexBottom;
                supportBandIndices[c].set(i, s, indexBottom);
                supportBandWidths[c].set(i, s, bandWidth);
                maxBandwidth = Math.max(maxBandwidth, bandWidth);
            }
        }

        transitionValues[c] = zerosND([wealthValues.length, strategyCDFs.length, maxBandwidth]);
        for (let s = 0; s < strategyCDFs.length; s++) {
            transitionValues[c].set(0, s, 0, 1);
        }
        for (let i = 1; i < wealthValues.length; i++) {
            for (let s = 0; s < strategyCDFs.length; s++) {
                const CDF = strategyCDFs[s];
                const bandIndex = supportBandIndices[c].get(i, s);
                const bandWidth = supportBandWidths[c].get(i, s);

                let CDFbottom;
                let CDFtop = CDF(((wealthBoundaries[bandIndex] - cashflow) / wealthValues[i]) - 1);
                for (let j = 0; j < bandWidth; j++) {
                    CDFbottom = CDFtop;
                    CDFtop = CDF(((wealthBoundaries[bandIndex + j + 1] - cashflow) / wealthValues[i]) - 1);
                    transitionValues[c].set(i, s, j, CDFtop - CDFbottom);
                }
            }
        }
    }

    return { values: transitionValues, supportBandIndices, supportBandWidths, uniquePeriodIndices };
}

// NaN indices are output by the solver when multiple maxima are found.
// This function overwrites NaN areas with values found either above or below them.
// If values are present both above and below a NaN area the value above is picked.
export function replaceUnknownStrategies(optimalStrategies: NdArray): void {
    for (let i = 0; i < optimalStrategies.shape[0]; i++) {
        const periodArray = optimalStrategies.pick(i, null);
        let j = 0;
        let strategyBelow = NaN;
        let defaultStrategy = NaN;
        let strategyAbove = NaN;
        while (j < periodArray.shape[0]) {
            if (isNaN(periodArray.get(j))) {
                const start = j;
                while (j < periodArray.shape[0] && isNaN(periodArray.get(j))) j++;
                strategyAbove = j == periodArray.shape[0] ? NaN : periodArray.get(j);

                if (isNaN(strategyAbove)) {
                    defaultStrategy = strategyBelow;
                } else {
                    defaultStrategy = strategyAbove;
                }

                for (let index = start; index < j; index++) {
                    periodArray.set(index, defaultStrategy);
                }
                strategyBelow = strategyAbove;
            } else {
                strategyBelow = periodArray.get(j);
                j++;
            }
        }
    }
}

export function computeRiskOfRuin({ values, supportBandIndices, supportBandWidths, uniquePeriodIndices }: TransitionTensor, optimalStrategies: NdArray): NdArray {
    const periods = uniquePeriodIndices.length;
    const wealthIndexSize = values[0].shape[0];
    const riskOfRuin = zerosND([periods + 1, wealthIndexSize]);
    riskOfRuin.set(periods, 0, 1.0);

    let top_this = 0;
    let top_next = 1;

    for (let p = periods - 1; p >= 0; p--) {
        const u = uniquePeriodIndices[p];

        const periodValues = values[u];
        const periodBandIndices = supportBandIndices[u];
        const periodBandWidths = supportBandWidths[u];

        for (let i = 0; i < wealthIndexSize; i++) {
            const s = optimalStrategies.get(p, i);
            const bandIndex = periodBandIndices.get(i, s);
            if (bandIndex > top_next) continue;
            const bandWidth = periodBandWidths.get(i, s)
            const top = Math.min(bandWidth, top_next - bandIndex);
            let sum = 0;
            for (let j = 0; j < top; j++) {
                sum += periodValues.get(i, s, j) * riskOfRuin.get(p + 1, bandIndex + j);
            }
            top_this = i;
            riskOfRuin.set(p, i, sum);
        }
        top_next = top_this;
    }

    return riskOfRuin;
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