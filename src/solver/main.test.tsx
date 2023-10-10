import { writeFileSync } from 'fs';
import { join } from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import { initCashflows, initGridState, initStrategies, initUtility } from "../InitState";
import { Problem, Solution, solveCPU } from "./main";

test('The init problem is solved sensibly', async () => {
    const initProblem: Problem =
    {
        strategies: initStrategies.strategies,
        wealthBoundaries: initGridState.wealthBoundaries,
        periods: initGridState.periods,
        cashflows: initCashflows.cashflows,
        utilityFunction: initUtility.utilityFunction
    }

    const solution: Solution = await solveCPU(initProblem);

    saveDebugPage(initProblem, solution, "initProblem_debug.html");
    expect(solution).toMatchSnapshot();
});

// Save a debug page alongside the snapshots
function saveDebugPage(problem: Problem, solution: Solution, filename: string) {
    const debugPageHtml = renderToStaticMarkup(<DebugPage problem={problem} solution={solution} />);
    const tempPath = join(__dirname, "__snapshots__", "__newsnap__." + filename);
    const path = join(__dirname, "__snapshots__", filename);

    if (process.argv.includes('--updateSnapshot') || process.argv.includes('-u')) {
        writeFileSync(path, debugPageHtml);
    } else {
        writeFileSync(tempPath, debugPageHtml);
    }
}

interface DebugProps {
    problem: Problem
    solution: Solution
}

function DebugPage({ solution, problem }: DebugProps): JSX.Element {

    const scriptContent = `
      problem = ${JSON.stringify(problem)};
      solution = ${JSON.stringify(solution)};
  
      wealthBoundaries = problem.wealthBoundaries;
      wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);
      timeRange = range(0.5, problem.periods + 0.5);
  
      Plotly.newPlot(document.getElementById('strategies'),[{
              x: timeRange,
              y: wealthValues,
              z: solution.optimalStrategies,
              type: 'heatmap',
              showscale: false
            }],
               {margin: {t: 0 } } 
              );
  
      timeRange_utilities = range(0.5, problem.periods + 1.5);
      Plotly.newPlot(document.getElementById('utilities'),[{
               x: timeRange_utilities,
               y: wealthValues,
               z: solution.expectedUtilities,
               type: 'heatmap',
               showscale: false
             }],
                {margin: {t: 0 } } 
               );            
  
      function range (start, end) {
        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
      }
    `;

    return (
        <html>
            <head>
                <title>Debug Page</title>
                <script src="https://cdn.plot.ly/plotly-2.25.2.min.js"></script>
            </head>
            <body>
                <h1> Strategies </h1>
                <div id="strategies" style={{
                    width: "1100px",
                    height: "500px",
                }} />
                <h1> Utilities </h1>
                <div id="utilities" style={{
                    width: "1100px",
                    height: "500px",
                }} />
                <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
            </body>
        </html >
    );
}