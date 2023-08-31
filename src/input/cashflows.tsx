import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

import { Matrix, evaluate, isMatrix } from "mathjs";
import { GridSize } from "../grid/gridform";

export interface CashflowsFormState {
    // Contents of the textarea
    readonly cashflowString: string;
    // Set on blur, reset on focus
    readonly cashflowStringValid: boolean;
    // Updated on blur, if valid
    readonly cashflows: number[];
}

export interface CashflowsFormProps {
    gridSize: GridSize;
}

export const CashflowsForm = ({ gridSize }: CashflowsFormProps) => {

    const [state, setState] = useState<CashflowsFormState>(
        {
            cashflowString: '40000 * concat(ones(5),zeros(5)) \n- 40000 * concat(zeros(5),ones(5))',
            cashflowStringValid: true,
            cashflows: [40000, 40000, 40000, 40000, 40000, -40000, -40000, -40000, -40000, -40000],
        }
    );

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({
            ...state,
            cashflowString: event.target.value,
        })
    }

    const onFocus = () => {
        setState({
            ...state,
            cashflowStringValid: true,
        })
    }

    const onBlur = () => {
        const arrayOrNull = parseCashflowArray(state.cashflowString);
        if (arrayOrNull) {
            setState({
                ...state,
                cashflowStringValid: true,
                cashflows: arrayOrNull
            })
        } else {
            setState({
                ...state,
                cashflowStringValid: false,
            })
        }
    }

    const traces: Plotly.Data[] = [{
        // Match plotted vector length to periods
        y: state.cashflows.length >= gridSize.periods
            ? state.cashflows.slice(0, gridSize.periods)
            : [...state.cashflows, ...Array(gridSize.periods - state.cashflows.length).fill(0)],
        type: 'bar'
    },
    {
        x: [-1, gridSize.periods + 1, gridSize.periods + 1, -1],
        y: [gridSize.wealthStep, gridSize.wealthStep, -gridSize.wealthStep , -gridSize.wealthStep],
        mode: "lines",
        type: "scatter"
    },];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        showlegend: false,
        xaxis: {
            range: [-0.5, gridSize.periods - 0.5],
        },
        margin: { t: margin, l: margin, r: margin, b: margin }
    }

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Cashflows</div>
                Lorem ipsum dolor sit amet</div>
            <textarea className={"input-box"}
                style={!state.cashflowStringValid ? { borderColor: "red" } : {}}
                placeholder="Type some math here"
                onChange={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
                value={state.cashflowString}>
            </textarea>
            <Plot
                data={traces}
                layout={layout} />
        </div>
    )

}

function parseCashflowArray(cashflowString: string): (number[] | null) {
    // Needed for multiline expressions
    const stripped = cashflowString.replace(/\s/g, '');
    let result;
    try {
        result = evaluate(stripped);
        if (isMatrix(result) && result.size().length === 1) {
            return (result as Matrix).toArray() as number[];
        }
        return null;
    }
    catch (error) {
        return null;
    }
}