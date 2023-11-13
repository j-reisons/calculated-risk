import matrixVectorProduct from 'ndarray-matrix-vector-product';
import unpack from "ndarray-unpack";
import { ExtendedSolution } from "./main";
import { zeros, zerosND } from "./utils";


export function computeTrajectories(extendedSolution: ExtendedSolution, periodIndex: number, startingWealth: number): number[][] {
    const transitionTensor = extendedSolution.extendedOptimalTransitionTensor;
    const periods = transitionTensor.shape[0];
    const wealthIndexSize = transitionTensor.shape[1];
    // Set-up the distribution and propagate it forward

    const trajectories = zerosND([periods + 1, wealthIndexSize]);
    const wealthIndex = extendedSolution.extendedValues.findIndex((num) => num >= startingWealth);

    trajectories.set(periodIndex, wealthIndex, 1.0)

    for (let p = periodIndex; p < periods; p++) {
        const transitionMatrix = transitionTensor.pick(p, null, null);
        matrixVectorProduct(trajectories.pick(p + 1, null), transitionMatrix, trajectories.pick(p, null))
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
