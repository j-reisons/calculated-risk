import matrixProduct from "ndarray-gemm";
import unpack from "ndarray-unpack";
import unsqueeze from "ndarray-unsqueeze";

import { TrajectoriesInputs } from "./main";
import { zeros, zerosND } from "./utils";


export function computeTrajectories(inputs: TrajectoriesInputs, periodIndex: number, startingWealth: number): number[][] {
    const transitionValues = inputs.optimalTransitionTensor.values;
    const transitionBands = inputs.optimalTransitionTensor.supportBandIndices;
    const periods = transitionValues.shape[0];
    const wealthIndexSize = transitionValues.shape[1];
    // Set-up the distribution and propagate it forward

    const trajectories = zerosND([periods + 1, wealthIndexSize]);
    const wealthIndex = inputs.values.findIndex((num) => num >= startingWealth);

    trajectories.set(periodIndex, wealthIndex, 1.0)

    let bottom_this = wealthIndex;
    let top_this = wealthIndex + 1;
    let bottom_next, top_next;

    for (let p = periodIndex; p < periods; p++) {
        bottom_next = Infinity;
        top_next = 0;
        for (let i = bottom_this; i < top_this; i++) {
            bottom_next = Math.min(bottom_next, transitionBands.get(p, i, 0))
            top_next = Math.max(top_next, transitionBands.get(p, i, 1))
        }

        const trajectoriesThisSlice = unsqueeze(trajectories.pick(p, null).hi(top_this).lo(bottom_this));

        const transitionSlice = transitionValues.pick(p, null, null)
            .hi(top_next, top_this)
            .lo(bottom_next, bottom_this);

        const trajectoriesNextSlice = unsqueeze(trajectories.pick(p + 1, null).hi(top_next).lo(bottom_next));

        matrixProduct(trajectoriesNextSlice, transitionSlice, trajectoriesThisSlice);

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
