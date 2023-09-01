import { GridSize } from "../grid/gridform";
import { Strategy } from "../input/strategies";

interface Problem {
    readonly gridSize: GridSize,
    readonly strategies: Strategy[],
    readonly cashflows: number[],
    readonly utilityFunction: (wealth: number) => number,
}

interface Solution {
    readonly utilities: number[][];
    readonly strategies: number[][];

}