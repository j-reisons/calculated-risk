import { writeFileSync } from 'fs';
import { join } from 'path';
import { defaultCashflows, defaultGridState, defaultStrategies, defaultUtility } from "../DefaultState";
import { logGrid } from '../grid/state';
import { debugPageHtml } from "../testutils/debugpage";
import { toBeApproxEqual2dArray } from '../testutils/toBeApproxEqual2dArray';
import { Problem, Solution, solve } from "./main";

// TODO: debug intermittent test crashes when calling into GPU code
// beforeAll(setupGPU)

expect.extend({ toBeApproxEqual2dArray })

test('The default problem is solved sensibly', async () => {
    const defaultProblem: Problem =
    {
        strategies: defaultStrategies.strategies,
        wealthBoundaries: defaultGridState.wealthBoundaries,
        wealthValues: defaultGridState.wealthValues,
        wealthStep: defaultGridState.wealthStep,
        periods: defaultGridState.periods,
        cashflows: defaultCashflows.cashflows,
        utilityFunction: defaultUtility.utilityFunction
    }

    const solutionCPU: Solution = await solve(defaultProblem);
    solutionCPU.trajectoriesInput = null;

    saveDebugPage(defaultProblem, solutionCPU, "defaultProblem_CPU.html");

    // const solutionGPU: Solution = await solveGPU(defaultProblem);
    // saveDebugPage(defaultProblem, solutionGPU, "defaultProblem_debug_GPU.html");
    // expect(solutionCPU.expectedUtilities).toBeApproxEqual2dArray(solutionGPU.expectedUtilities, 1E-6);
    // expect(solutionCPU.optimalStrategies).toBeApproxEqual2dArray(solutionGPU.optimalStrategies, 1E-6);

    expect(solutionCPU).toMatchSnapshot();
}, 1000000);

test('Init with periods shorter than cashflows', async () => {
    const defaultProblem: Problem =
    {
        strategies: defaultStrategies.strategies,
        wealthBoundaries: defaultGridState.wealthBoundaries,
        wealthValues: defaultGridState.wealthValues,
        wealthStep: defaultGridState.wealthStep,
        periods: 9,
        cashflows: defaultCashflows.cashflows,
        utilityFunction: defaultUtility.utilityFunction
    }

    const solutionCPU: Solution = await solve(defaultProblem);
    solutionCPU.trajectoriesInput = null;

    saveDebugPage(defaultProblem, solutionCPU, "shorter_CPU.html");

    expect(solutionCPU).toMatchSnapshot();
});

test('Init with periods longer than cashflows', async () => {
    const defaultProblem: Problem =
    {
        strategies: defaultStrategies.strategies,
        wealthBoundaries: defaultGridState.wealthBoundaries,
        wealthValues: defaultGridState.wealthValues,
        wealthStep: defaultGridState.wealthStep,
        periods: 12,
        cashflows: defaultCashflows.cashflows,
        utilityFunction: defaultUtility.utilityFunction
    }

    const solutionCPU: Solution = await solve(defaultProblem);
    solutionCPU.trajectoriesInput = null;

    saveDebugPage(defaultProblem, solutionCPU, "longer_CPU.html");

    expect(solutionCPU).toMatchSnapshot();
});

test('Log no cashflows', async () => {
    const defaultProblem: Problem =
    {
        strategies: defaultStrategies.strategies,
        wealthBoundaries: defaultGridState.wealthBoundaries,
        wealthValues: defaultGridState.wealthValues,
        wealthStep: 0.05,
        periods: 150,
        cashflows: [0],
        utilityFunction: Math.log
    }

    const solutionCPU: Solution = await solve(defaultProblem);
    solutionCPU.trajectoriesInput = null;

    saveDebugPage(defaultProblem, solutionCPU, "log_CPU.html");

    expect(solutionCPU).toMatchSnapshot();
});

test('Log cashflows', async () => {
    const gridState = logGrid(1000, 2400000, 0.01, 10);
    const defaultProblem: Problem =
    {
        strategies: defaultStrategies.strategies,
        wealthBoundaries: gridState.wealthBoundaries,
        wealthValues: gridState.wealthValues,
        wealthStep: gridState.wealthStep,
        periods: gridState.periods,
        cashflows: defaultCashflows.cashflows,
        utilityFunction: Math.log
    }

    const solutionCPU: Solution = await solve(defaultProblem);
    solutionCPU.trajectoriesInput = null;

    saveDebugPage(defaultProblem, solutionCPU, "log_cashflows_CPU.html");
    expect(solutionCPU).toMatchSnapshot();
}, 1000000);

function saveDebugPage(problem: Problem, solution: Solution, filename: string) {
    const html = debugPageHtml(problem, solution.optimalStrategies, solution.expectedUtilities);
    const tempPath = join(__dirname, "__snapshots__", "__newsnap__." + filename);
    writeFileSync(tempPath, html);
}