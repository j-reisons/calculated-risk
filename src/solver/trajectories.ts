import unpack from "ndarray-unpack";

import { OptimalTransitionTensor } from "./optimal-transition";
import { zeros, zerosND } from "./utils";


export function computeTrajectories({ values, supportBandIndices, supportBandWidths }: OptimalTransitionTensor, periodIndex: number, wealthIndex: number): number[][] {
    const periods = values.length;
    const wealthIndexSize = values[0].shape[0];
    
    const trajectories = zerosND([periods + 1, wealthIndexSize]);
    trajectories.set(periodIndex, wealthIndex, 1.0)

    let bottom_this = wealthIndex;
    let top_this = wealthIndex + 1;
    let bottom_next, top_next;

    for (let p = periodIndex; p < periods; p++) {
        bottom_next = Infinity;
        top_next = 0;

        for (let i = bottom_this; i < top_this; i++) {
            const bandIndex = supportBandIndices[p].get(i);
            const bandWidth = supportBandWidths[p].get(i)
            
            bottom_next = Math.min(bottom_next, bandIndex)
            top_next = Math.max(top_next, bandIndex + bandWidth)

            const probability_here = trajectories.get(p, i);
            for (let j = 0; j < bandWidth; j++) {
                const updated = trajectories.get(p + 1, bandIndex + j) + probability_here * values[p].get(i, j);
                trajectories.set(p + 1, bandIndex + j, updated);
            }
        }

        bottom_this = bottom_next;
        top_this = top_next;
    }

    return unpack(trajectories) as number[][];
}

export interface QuantileTraces {
    readonly probability: number
    readonly x: number[]
    readonly y_bottom: number[]
    readonly y_top: number[]
}

export function findQuantiles(trajectories: number[][], probabilities: number[], startPeriod: number): QuantileTraces[] {
    const sortedProbabilities = probabilities.slice().sort().reverse();
    const sortedTails = sortedProbabilities.map(p => (1 - p) / 2.0);

    const x = new Array<number>(trajectories.length - startPeriod);
    const y_bottom = zeros([probabilities.length, trajectories.length - startPeriod]);
    const y_top = zeros([probabilities.length, trajectories.length - startPeriod]);

    for (let p = 0; p < trajectories.length - startPeriod; p++) {
        x[p] = startPeriod + p;
        const periodDistribution = trajectories[startPeriod + p];

        let sum = 0;
        let w = 0;
        for (let i = 0; i < probabilities.length; i++) {
            while (sum < sortedTails[i] && w < periodDistribution.length) {
                sum += periodDistribution[w++];
            }
            y_bottom[i][p] = w;
        }

        sum = 0;
        w = periodDistribution.length - 1;
        for (let i = 0; i < probabilities.length; i++) {
            while (sum < sortedTails[i] && w > 0) {
                sum += periodDistribution[w--];
            }
            y_top[i][p] = w;
        }
    }

    const result = new Array<QuantileTraces>();
    for (let i = 0; i < probabilities.length; i++) {
        result.push({
            probability: sortedProbabilities[i],
            x: x,
            y_bottom: y_bottom[i],
            y_top: y_top[i]
        })
    }
    return result;
}
