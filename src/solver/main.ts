import { NdArray } from "ndarray";
import unpack from "ndarray-unpack";
import { Strategy } from "../input/state";
import { TransitionTensor } from "./core";
import { solveCore as solveCoreCPU } from "./coreCPU";
import { solveCore as solveCoreGPU } from "./coreGPU";
import { computeRiskOfRuin, computeTransitionTensor, extendWealthRange, replaceUnknownStrategies } from "./transform";


export interface Problem {
    readonly wealthBoundaries: number[],
    readonly wealthValues: number[],
    readonly logStep: number,
    readonly periods: number,
    readonly strategies: Strategy[]
    readonly cashflows: number[],
    readonly utilityFunction: (w: number) => number,
}

export interface Solution {
    readonly optimalStrategies: number[][];
    readonly expectedUtilities: number[][];
    readonly riskOfRuin: number[][];
    readonly trajectoriesInputs: TrajectoriesInputs;
}

export interface TrajectoriesInputs {
    readonly boundaries: number[];
    readonly values: number[];
    readonly transitionTensor: TransitionTensor,
    readonly optimalStrategies: NdArray,
}

export async function solve(originalProblem: Problem): Promise<Solution> {
    const { problem, originalWealthRange: originalRange } = extendWealthRange(originalProblem);

    const transitionTensor = computeTransitionTensor(problem);

    const finalUtilities = problem.wealthValues.map(problem.utilityFunction);
    finalUtilities[0] = 0;

    let hasGPU = false;
    try {
        const adapter = await navigator.gpu?.requestAdapter();
        const device = await adapter?.requestDevice();
        if (device) {
            hasGPU = true;
        }
    } catch (e) { e; }

    const { optimalStrategies, expectedUtilities } = hasGPU ?
        await solveCoreGPU({ transitionTensor, finalUtilities }) :
        solveCoreCPU({ transitionTensor, finalUtilities });

    replaceUnknownStrategies(optimalStrategies);
    const riskofRuin = computeRiskOfRuin(transitionTensor, optimalStrategies);

    const clippedStrategies = optimalStrategies.hi(-1, originalRange[1]).lo(-1, originalRange[0]).transpose(1, 0);
    const clippedExpectedUtilities = expectedUtilities.hi(-1, originalRange[1]).lo(-1, originalRange[0]).transpose(1, 0);
    const clippedRiskOfRuin = riskofRuin.hi(-1, originalRange[1]).lo(-1, originalRange[0]).transpose(1, 0);

    return {
        optimalStrategies: unpack(clippedStrategies) as number[][],
        expectedUtilities: unpack(clippedExpectedUtilities) as number[][],
        riskOfRuin: unpack(clippedRiskOfRuin) as number[][],
        trajectoriesInputs: { boundaries: problem.wealthBoundaries, values: problem.wealthValues, transitionTensor, optimalStrategies },
    }
}

