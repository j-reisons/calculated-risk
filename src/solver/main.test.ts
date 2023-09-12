/**
 * @jest-environment jsdom
 */

import Plotly from "plotly.js";
import { initCashflows, initGridState, initStrategies, initUtility } from "../InitState";
import { Problem, Solution, solve } from "./main";

test('The init problem is solved sensibly', async () => {
    const initProblem: Problem =
    {
        strategyCDFs: initStrategies.strategies.map(s => s.CDF),
        wealthBoundaries: initGridState.wealthBoundaries,
        cashflows: initCashflows.cashflows,
        utilityFunction: initUtility.utilityFunction
    }

    const solution: Solution = solve(initProblem);
    const image = await strategyImage(solution);
    expect(image).toMatchSnapshot();
});

// The test relies on comparison of serialized Solution objects.
// For easier, visual diffing, images and interactive plots are also generated
// Use plotly to generate a PNG, and use jest-snapshot-diff
// Also generate an interactive HTML plot, maybe snapshot too?

// function snapshotArtifacts(solution: Solution) {

// }

async function strategyImage(solution: Solution): Promise<string> {
    const data: Plotly.Data[] = [
        {
            z: solution.optimalStrategies,
            type: 'heatmap',
        },
    ];
    return Plotly.toImage({ data });
}