import { writeFileSync } from 'fs';
import { join } from 'path';
import { initCashflows, initGridState, initStrategies, initUtility } from "../InitState";
import { debugPageHtml } from "../testutils/debugpage";
import { setupGPU } from '../testutils/gpu';
import { toBeApproxEqual2dArray } from '../testutils/toBeApproxEqual2dArray';
import { Problem, Solution, solveCPU, solveGPU } from "./main";

beforeAll(setupGPU)

expect.extend({ toBeApproxEqual2dArray })

test('The init problem is solved sensibly', async () => {
    const initProblem: Problem =
    {
        strategies: initStrategies.strategies,
        wealthBoundaries: initGridState.wealthBoundaries,
        periods: initGridState.periods,
        cashflows: initCashflows.cashflows,
        utilityFunction: initUtility.utilityFunction
    }

    const solutionCPU: Solution = solveCPU(initProblem);
    const solutionGPU: Solution = await solveGPU(initProblem);

    saveDebugPage(initProblem, solutionCPU, "initProblem_debug_CPU.html");
    saveDebugPage(initProblem, solutionGPU, "initProblem_debug_GPU.html");

    expect(solutionCPU.expectedUtilities).toBeApproxEqual2dArray(solutionGPU.expectedUtilities, 1E-6);
    expect(solutionCPU.optimalStrategies).toBeApproxEqual2dArray(solutionGPU.optimalStrategies, 1E-6);

    expect(solutionCPU).toMatchSnapshot();
}, 1000000);

function saveDebugPage(problem: Problem, solution: Solution, filename: string) {
    const html = debugPageHtml(problem, solution);
    const tempPath = join(__dirname, "__snapshots__", "__newsnap__." + filename);
    const path = join(__dirname, "__snapshots__", filename);

    if (process.argv.includes('--updateSnapshot') || process.argv.includes('-u')) {
        writeFileSync(path, html);
    } else {
        writeFileSync(tempPath, html);
    }
}