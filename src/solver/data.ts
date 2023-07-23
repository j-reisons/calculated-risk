class Problem {
    constructor(
        // Number of periods
        public readonly periods: number,
        // Cashflows occuring at each period
        public readonly cashflows: number[],
        // Wealth grid boundaries
        // Monotonically increasing, with -Infinity and +Infininty at the edges.
        public readonly wealthGrid: number[],
        // The investable strategies
        public readonly strategies: Strategy[],
        // The utility function at the end of the periods.
        public readonly utility: Utility,
    ) {
        assert(Number.isInteger(periods) && periods > 0, "periods must be a positive integer");
        assert(cashflows.length == periods, "Cashflows array length must match periods");
        assert(checkWealthGrid(wealthGrid), "Invalid wealth grid. Should be monotonically increasing with -/+ Infinity at the edges");

    }
}

class Strategy {
    constructor(
        public readonly name: string,
        // The Cummulative Distribution Function for returns of the strategy.
        // Returns are 0-centered: a return of 0 means you have the same ammount as when you started.
        public readonly returnCDF: (input: number) => number
    ) { }
}

type Utility = (input: number) => number;

function checkWealthGrid(wealthGrid: number[]): boolean {
    if (wealthGrid[0] != -Infinity) { return false }
    if (wealthGrid[wealthGrid.length - 1] != Infinity) { return false }
    for (let i = 1; i < wealthGrid.length; i++) {
        if (wealthGrid[i] <= wealthGrid[i - 1]) {
            return false;
        }
    }
    return true;
}

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

class Solution {
    constructor(
        public readonly problem: Problem,
        public readonly strategies: number[][],
        public readonly probabilities: number[][],
        public readonly utilities: number[][],
    ) { 
        // TODO: write some validation
    }
}