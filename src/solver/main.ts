import { Matrix, index, zeros } from "mathjs";


export interface Problem {
    readonly strategyCDFs: ((r: number) => number)[],
    readonly wealthBoundaries: number[],
    readonly cashflows: number[],
    readonly utilityFunction: (w: number) => number,
}

export interface Solution {
    readonly optimalStrategies: number[][];
    readonly utilities: number[][];
}

// Formulate the problem as matrix multiplications
// Find a fast matrix multiplicaiton
export function solve(problem: Problem): Solution | null {

    const cashflowToIndex: Map<number, number> = new Map<number, number>();
    const indexToCashflow: Map<number, number> = new Map<number, number>();
    let cashflowIndex = 0;
    for (const num of problem.cashflows) {
        if (!(num in cashflowToIndex)) {
            cashflowToIndex.set(num, cashflowIndex);
            indexToCashflow.set(cashflowIndex++, num);
        }
    }

    const wealthBoundaries = problem.wealthBoundaries;
    const periods = problem.cashflows.length;
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);

    const transition = zeros([cashflowToIndex.size, problem.strategyCDFs.length, wealthValues.length, wealthValues.length]) as Matrix;
    for (const c of indexToCashflow.keys()) {
        const cashflow = indexToCashflow.get(c) as number;
        for (let s = 0; s < problem.strategyCDFs.length; s++) {
            const CDF = problem.strategyCDFs[s];
            for (let i = 0; i < wealthValues.length; i++) {
                for (let j = 0; i < wealthValues.length; j++) {
                    const ijtop = (wealthBoundaries[j + 1] / (wealthValues[i] + cashflow)) - 1; // 0-centered returns
                    const ijbottom = (wealthBoundaries[j] / (wealthValues[i] + cashflow)) - 1;
                    const value = CDF(ijtop) - CDF(ijbottom);
                    transition.set([c, s, i, j], value);
                }
            }
        }
    }

    const optimalStrategies = zeros([periods, wealthValues.length]) as Matrix;
    const utilities = zeros([periods + 1, wealthValues.length]) as Matrix;

    utilities.subset(index(periods, wealthValues.keys), wealthValues.map(problem.utilityFunction));
    for (let p = periods - 1; p >= 0; p--) {
        const nextUtility = utilities.subset(index(p, wealthValues.keys));
        const cashflowIndex = cashflowToIndex.get(problem.cashflows[p]);
        const thisTransition = transition.subset(index(cashflowIndex, problem.strategyCDFs.keys, wealthValues.keys, wealthValues.keys));
        // Check matrix sizes/orientation
        //
    }

    return null;
}
