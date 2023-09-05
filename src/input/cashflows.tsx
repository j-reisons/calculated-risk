import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

import { Matrix, evaluate, isMatrix } from "mathjs";
import { initCashflowsForm } from "../InitState";
import { GridState } from "../grid/gridform";


export interface CashflowsFormState {
    // Contents of the textarea
    readonly cashflowString: string;
    // Set on blur, reset on focus
    readonly cashflowStringValid: boolean;
}

export interface CashflowsState {
    readonly cashflows: number[];
}

export interface CashflowsFormProps {
    gridState: GridState;
    cashflowsState: CashflowsState;
    setCashflowsState: React.Dispatch<React.SetStateAction<CashflowsState>>;
}

export const CashflowsForm = ({ gridState, cashflowsState, setCashflowsState }: CashflowsFormProps) => {

    const [state, setState] = useState<CashflowsFormState>(initCashflowsForm);

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
        if (arrayOrNull == null) {
            setState({
                ...state,
                cashflowStringValid: false,
            })
        } else {
            setState({
                ...state,
                cashflowStringValid: true,
            });
            setCashflowsState({
                cashflows: arrayOrNull
            });
        }
    }

    const wealthStep = gridState.wealthBoundaries[1] - gridState.wealthBoundaries[0];
    const traces: Plotly.Data[] = [{
        // Match plotted vector length to periods
        y: cashflowsState.cashflows.length >= gridState.periods
            ? cashflowsState.cashflows.slice(0, gridState.periods)
            : [...cashflowsState.cashflows, ...Array(gridState.periods - cashflowsState.cashflows.length).fill(0)],
        type: 'bar'
    },
    {
        x: [-1, gridState.periods + 1, gridState.periods + 1, -1],
        y: [wealthStep, wealthStep, -wealthStep, -wealthStep],
        mode: "lines",
        type: "scatter"
    },];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        showlegend: false,
        xaxis: {
            range: [-0.5, gridState.periods - 0.5],
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
            return (result as Matrix).valueOf() as number[];
        }
        return null;
    }
    catch (error) {
        return null;
    }
}