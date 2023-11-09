import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

import { Matrix, evaluate, isMatrix, range } from "mathjs";
import { initCashflowsForm } from "../InitState";
import { GridState } from "../grid/state";
import { CashflowsFormState, CashflowsState } from "./state";


export interface CashflowsFormProps {
    gridState: GridState;
    cashflowsState: CashflowsState;
    setCashflowsState: React.Dispatch<React.SetStateAction<CashflowsState>>;
}

export const CASHFLOWS_PARAM = "cashflows";

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
        const arrayOrNull = parseCashflows(state.cashflowString);
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

            const params = new URLSearchParams(window.location.search);
            params.set(CASHFLOWS_PARAM, state.cashflowString);
            history.replaceState({}, "", '?' + params.toString())
            
            setCashflowsState({
                cashflows: arrayOrNull
            });
        }
    }

    // Adjust cashflows to match periods
    const adjustedCashflows = cashflowsState.cashflows.length >= gridState.periods
        ? cashflowsState.cashflows.slice(0, gridState.periods)
        : [...cashflowsState.cashflows, ...Array(gridState.periods - cashflowsState.cashflows.length).fill(0)];

    const traces: Plotly.Data[] = [{
        x: range(1, adjustedCashflows.length + 1).valueOf() as number[],
        y: adjustedCashflows,
        type: 'bar',
        marker: {
            color: 'rgb(5,10,172)'
        },
        hovertemplate: "Period: %{x}<br>Cashflow: %{y}",
    }];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        showlegend: false,
        height: 250,
        width: 400,
        xaxis: {
            range: [0.5, gridState.periods + 0.5],
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
                placeholder={'# Assign cashflows, e.g. \ncashflows = [1,2,3]'}
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

export function parseCashflows(cashflowString: string): (number[] | null) {
    const scope = { cashflows: null };
    try {
        evaluate(cashflowString, scope);
    } catch (error) { return null; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = scope.cashflows as any;
    if (isMatrix(result) && result.size().length === 1) {
        return (result as Matrix).valueOf() as number[];
    }
    return null;
}