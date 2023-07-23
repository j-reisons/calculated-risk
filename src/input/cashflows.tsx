import React, { useEffect } from 'react';

import { InputDataProps } from "./types";
import Plotly from 'plotly.js-cartesian-dist'


export const CashflowsForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

        const cashflowString = event.target.value;
        const cashflows = parseCashflowString(cashflowString);

        setInputData(
            {
                ...inputData,
                cashflowString: cashflowString,
                cashflows: cashflows
            }
        );
    };

    useEffect(() => {
        // Sample data
        const xData: number[] = [1, 2, 3, 4, 5];
        const yData: number[] = [10, 6, 3, 8, 12];
    
        // Create the trace for the scatter plot
        const trace: Partial<Plotly.ScatterData> = {
          x: xData,
          y: yData,
          mode: 'markers',
          type: 'scatter'
        };
    
        // Layout configuration
        const layout: Partial<Plotly.Layout> = {
          title: 'Scatter Plot',
          xaxis: { title: 'X Axis' },
          yaxis: { title: 'Y Axis' }
        };
    
        // Create the plot
        Plotly.newPlot('plot-container', [trace], layout);
    
        // Clean up on component unmount
        return () => {
          Plotly.purge('plot-container');
        };
      }, []);

    return (
        <div>
            Cashflows:
            <input
                type="text"
                value={inputData.cashflowString}
                onChange={handleChange}
            />
            {validateCashFlows(inputData.cashflows, inputData.periods) || <p> Bad cashflow </p>}

            <div id="plot-container" style={{ width: '600px', height: '400px' }}></div>

        </div>
        // TODO: Add plot of the current cashflows vector
    )

}

// Check that cashflowString evaluates to a number[]
// Return the number[], else null
function parseCashflowString(cashflowString: string): (null | number[]) {
    let cashFlow: number[];
    try {
        // TODO: worry about safety
        cashFlow = new Function(`return ${cashflowString}`)();
    } catch (error) {
        return null;
    }

    if (!Array.isArray(cashFlow) ||
        !cashFlow.every((item) => typeof item === 'number')
    ) { return null }

    return cashFlow;
}

function validateCashFlows(cashflows: (number[] | null), expectedLength: number) {
    return cashflows != null && cashflows.length == expectedLength
}
