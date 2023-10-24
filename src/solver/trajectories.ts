import { Matrix, zeros } from "mathjs";
import { ExtendedSolution } from "./main";


export function computeTrajectories(extendedSolution: ExtendedSolution, periodIndex: number, wealthIndex: number): Matrix {
    // Index the needed periods of the optimal transition tensor
    // (periods, final_wealth, starting_wealth)
    const periods = extendedSolution.extendedTransitionTensor.length;
    const wealthIndexSize = extendedSolution.extendedTransitionTensor[0].size()[0];
    const optimalStrategiesArray = extendedSolution.extendedOptimalStrategies.valueOf() as number[][];

    const optimalTransitionTensor = new Array<Matrix>(periods);
    for (let p = periodIndex; p < periods; p++) {
        const transitionTensorArray = (extendedSolution.extendedTransitionTensor[p].valueOf() as unknown) as number[][][];

        const optimalTransitionMatrix = zeros([wealthIndexSize, wealthIndexSize]) as Matrix;
        const optimalTransitionMatrixArray = optimalTransitionMatrix.valueOf() as number[][];

        for (let i = 0; i < wealthIndexSize; i++) {
            for (let j = 0; j < wealthIndexSize; j++) {
                optimalTransitionMatrixArray[j][i] = transitionTensorArray[i][optimalStrategiesArray[p][i] || 0][j];
            }
        }

        optimalTransitionTensor[p] = optimalTransitionMatrix;
    }

    // Set-up the distribution and propagate it forward
    const trajectoriesSize = extendedSolution.extendedOptimalStrategies.size();
    trajectoriesSize[0]++;
    const trajectories = zeros(trajectoriesSize, 'dense') as Matrix;
    const shiftedWealthindex = extendedSolution.originalRange.get([0]) + wealthIndex;
    const trajectoriesArray = trajectories.valueOf() as number[][];
    trajectoriesArray[periodIndex][shiftedWealthindex] = 1.0;

    for (let p = periodIndex; p < periods; p++) {
        const transitionMatrixArray = optimalTransitionTensor[p].valueOf() as number[][];
        for (let i = 0; i < wealthIndexSize; i++) {
            for (let j = 0; j < wealthIndexSize; j++) {
                trajectoriesArray[p + 1][i] += trajectoriesArray[p][j] * transitionMatrixArray[i][j];
            }
        }
    }
    return trajectories;
}

export interface QuantileTraces {
    readonly probability: number
    readonly x: number[]
    readonly y_bottom: number[]
    readonly y_top: number[]
}

export function findQuantiles(trajectories: Matrix, probabilities: number[], startPeriod: number): QuantileTraces[] {
    return probabilities.map(probability => findQuantile(trajectories, probability, startPeriod));
}

export function findQuantile(trajectories: Matrix, probability: number, startPeriod: number): QuantileTraces {
    const trajectoriesArray = trajectories.toArray() as number[][];
    const tail = (1.0 - probability) / 2.0;
    const x = new Array<number>(trajectoriesArray.length - startPeriod);
    const y_bottom = new Array<number>(trajectoriesArray.length - startPeriod);
    const y_top = new Array<number>(trajectoriesArray.length - startPeriod);

    for (let i = 0; i < trajectoriesArray.length - startPeriod; i++) {
        x[i] = startPeriod + i;
        const periodDistribution = trajectoriesArray[startPeriod + i];

        let sum = 0;
        let j = 0;
        while (sum < tail && j < periodDistribution.length) {
            sum += periodDistribution[j++];
        }
        y_bottom[i] = j;

        sum = 0;
        j = periodDistribution.length - 1;
        while (sum < tail && j > - 1) {
            sum += periodDistribution[j--];
        }
        y_top[i] = j;
    }

    return {
        probability: probability,
        x: x,
        y_bottom: y_bottom,
        y_top: y_top
    }
}