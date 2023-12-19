import unpack from "ndarray-unpack";

import { NdArray } from "ndarray";
import { TransitionTensor } from "./core";
import { zeros, zerosND } from "./utils";


export function computeTrajectories(
    { values, supportBandIndices, supportBandWidths, uniquePeriodIndices }: TransitionTensor,
    optimalStrategies: NdArray,
    periodIndex: number,
    wealthIndex: number): number[][] {
    const periods = uniquePeriodIndices.length;
    const wealthIndexSize = values[0].shape[0];

    const trajectories = zerosND([periods + 1, wealthIndexSize]);
    trajectories.set(periodIndex, wealthIndex, 1.0)

    let bottom_this = wealthIndex;
    let top_this = wealthIndex + 1;
    let bottom_next, top_next;

    for (let p = periodIndex; p < periods; p++) {
        bottom_next = Infinity;
        top_next = 0;
        const u = uniquePeriodIndices[p];

        const periodValues = values[u];
        const periodBandIndices = supportBandIndices[u];
        const periodBandWidths = supportBandWidths[u];

        for (let i = bottom_this; i < top_this; i++) {
            const s = optimalStrategies.get(p, i);
            const bandIndex = periodBandIndices.get(i, s);
            const bandWidth = periodBandWidths.get(i, s)

            bottom_next = Math.min(bottom_next, bandIndex)
            top_next = Math.max(top_next, bandIndex + bandWidth)

            const probability_here = trajectories.get(p, i);
            for (let j = 0; j < bandWidth; j++) {
                const updated = trajectories.get(p + 1, bandIndex + j) + probability_here * periodValues.get(i, s, j);
                trajectories.set(p + 1, bandIndex + j, updated);
            }
        }

        bottom_this = bottom_next;
        top_this = top_next;
    }

    return unpack(trajectories) as number[][];
}

export interface CILocations {
    readonly probability: number
    readonly x: number[]
    readonly y_bottom: number[]
    readonly y_top: number[]
}

export function findCIs(trajectories: number[][], CIs: number[], startPeriod: number): CILocations[] {
    const sortedProbabilities = CIs.slice().sort().reverse();
    const sortedTails = sortedProbabilities.map(p => (1 - p) / 2.0);

    const x = new Array<number>(trajectories.length - startPeriod);
    const y_bottom = zeros([CIs.length, trajectories.length - startPeriod]);
    const y_top = zeros([CIs.length, trajectories.length - startPeriod]);

    for (let p = 0; p < trajectories.length - startPeriod; p++) {
        x[p] = startPeriod + p;
        const periodDistribution = trajectories[startPeriod + p];

        let sum = 0;
        let w = 0;
        for (let i = 0; i < CIs.length; i++) {
            while (sum < sortedTails[i] && w < periodDistribution.length) {
                sum += periodDistribution[w++];
            }
            y_bottom[i][p] = w;
        }

        sum = 0;
        w = periodDistribution.length - 1;
        for (let i = 0; i < CIs.length; i++) {
            while (sum < sortedTails[i] && w > 0) {
                sum += periodDistribution[w--];
            }
            y_top[i][p] = w;
        }
    }

    const result = new Array<CILocations>();
    for (let i = 0; i < CIs.length; i++) {
        result.push({
            probability: sortedProbabilities[i],
            x: x,
            y_bottom: y_bottom[i],
            y_top: y_top[i]
        })
    }
    return result;
}
