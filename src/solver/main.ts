import { GridState } from "../grid/gridform";
import { Strategy } from "../input/strategies";

interface Problem {
    readonly gridState: GridState,
    readonly strategies: Strategy[],
    readonly cashflows: number[],
    readonly utilityFunction: (wealth: number) => number,
}

interface Solution {
    readonly utilities: number[][];
    readonly strategies: number[][];
}