import { writeFileSync } from 'fs';
import { join } from 'path';
import { initCashflows, initGridState, initStrategies, initUtility } from "../InitState";
import { debugPageHtml } from "../testutils/debugpage";
import { setupGPU } from '../testutils/gpu';
import { toBeApproxEqual2dArray } from '../testutils/toBeApproxEqual2dArray';
import { Problem, Solution, solve } from "./main";
import { logGrid } from '../grid/state';

beforeAll(setupGPU)

expect.extend({ toBeApproxEqual2dArray })

test('The init problem is solved sensibly', async () => {
    const initProblem: Problem =
    {
        strategies: initStrategies.strategies,
        wealthBoundaries: initGridState.wealthBoundaries,
        wealthValues: initGridState.wealthValues,
        wealthStep: initGridState.wealthStep,
        periods: initGridState.periods,
        cashflows: initCashflows.cashflows,
        utilityFunction: initUtility.utilityFunction
    }

    const solutionCPU: Solution = await solve(initProblem);
    solutionCPU.extendedSolution = null;

    saveDebugPage(initProblem, solutionCPU, "initProblem_CPU.html");

    // TODO: debug intermittent test crashes when calling into GPU code
    // const solutionGPU: Solution = await solveGPU(initProblem);
    // saveDebugPage(initProblem, solutionGPU, "initProblem_debug_GPU.html");
    // expect(solutionCPU.expectedUtilities).toBeApproxEqual2dArray(solutionGPU.expectedUtilities, 1E-6);
    // expect(solutionCPU.optimalStrategies).toBeApproxEqual2dArray(solutionGPU.optimalStrategies, 1E-6);

    expect(solutionCPU).toMatchSnapshot();
}, 1000000);

test('Init with periods shorter than cashflows', async () => {
    const initProblem: Problem =
    {
        strategies: initStrategies.strategies,
        wealthBoundaries: initGridState.wealthBoundaries,
        wealthValues: initGridState.wealthValues,
        wealthStep: initGridState.wealthStep,
        periods: 9,
        cashflows: initCashflows.cashflows,
        utilityFunction: initUtility.utilityFunction
    }

    const solutionCPU: Solution = await solve(initProblem);
    solutionCPU.extendedSolution = null;

    saveDebugPage(initProblem, solutionCPU, "shorter_CPU.html");

    expect(solutionCPU).toMatchSnapshot();
});

test('Init with periods longer than cashflows', async () => {
    const initProblem: Problem =
    {
        strategies: initStrategies.strategies,
        wealthBoundaries: initGridState.wealthBoundaries,
        wealthValues: initGridState.wealthValues,
        wealthStep: initGridState.wealthStep,
        periods: 12,
        cashflows: initCashflows.cashflows,
        utilityFunction: initUtility.utilityFunction
    }

    const solutionCPU: Solution = await solve(initProblem);
    solutionCPU.extendedSolution = null;

    saveDebugPage(initProblem, solutionCPU, "longer_CPU.html");

    expect(solutionCPU).toMatchSnapshot();
});

test('Log no cashflows', async () => {
    const initProblem: Problem =
    {
        strategies: initStrategies.strategies,
        wealthBoundaries: initGridState.wealthBoundaries,
        wealthValues: initGridState.wealthValues,
        wealthStep: initGridState.wealthStep,
        periods: initGridState.periods,
        cashflows: [0],
        utilityFunction: Math.log
    }

    const solutionCPU: Solution = await solve(initProblem);
    solutionCPU.extendedSolution = null;

    saveDebugPage(initProblem, solutionCPU, "log_CPU.html");

    expect(solutionCPU).toMatchSnapshot();
});

test('Log cashflows', async () => {
    const gridState = logGrid(1000,2400000, 0.01, 10);
    const initProblem: Problem =
    {
        strategies: initStrategies.strategies,
        wealthBoundaries: gridState.wealthBoundaries,
        wealthValues: gridState.wealthValues,
        wealthStep: gridState.wealthStep,
        periods: gridState.periods,
        cashflows: initCashflows.cashflows,
        utilityFunction: Math.log
    }

    const solutionCPU: Solution = await solve(initProblem);
    solutionCPU.extendedSolution = null;

    saveDebugPage(initProblem, solutionCPU, "log_cashflows_CPU.html");
    expect(solutionCPU).toMatchSnapshot();
}, 1000000);

function saveDebugPage(problem: Problem, solution: Solution, filename: string) {
    const html = debugPageHtml(problem, solution.optimalStrategies, solution.expectedUtilities);
    const tempPath = join(__dirname, "__snapshots__", "__newsnap__." + filename);
    const path = join(__dirname, "__snapshots__", filename);

    if (process.argv.includes('--updateSnapshot') || process.argv.includes('-u')) {
        writeFileSync(path, html);
    } else {
        writeFileSync(tempPath, html);
    }
}