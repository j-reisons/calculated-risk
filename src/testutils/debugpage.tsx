import { renderToStaticMarkup } from 'react-dom/server';
import { Problem } from "../solver/main";

export function debugPageHtml(problem: Problem,
    optimalStrategies: number[][],
    expectedUtilities: number[][]): string {
    return renderToStaticMarkup(<DebugPage problem={problem}
        optimalStrategies={optimalStrategies}
        expectedUtilities={expectedUtilities} />);
}

interface DebugProps {
    problem: Problem
    optimalStrategies: number[][]
    expectedUtilities: number[][]
}

export function DebugPage({ problem, optimalStrategies, expectedUtilities }: DebugProps): JSX.Element {

    const scriptContent = `
      problem = ${JSON.stringify(problem)};
      optimalStrategies = ${JSON.stringify(optimalStrategies)};
      expectedUtilities = ${JSON.stringify(expectedUtilities)};
  
      wealthBoundaries = problem.wealthBoundaries;
      wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);
      timeRange = range(0.5, problem.periods + 0.5);
  
      Plotly.newPlot(document.getElementById('strategies'),[{
              x: timeRange,
              y: wealthValues,
              z: optimalStrategies,
              type: 'heatmap',
              showscale: false
            }],
               {margin: {t: 0 } } 
              );
  
      timeRange_utilities = range(0.5, problem.periods + 1.5);
      Plotly.newPlot(document.getElementById('utilities'),[{
               x: timeRange_utilities,
               y: wealthValues,
               z: expectedUtilities,
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
