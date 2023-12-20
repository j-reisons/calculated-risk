import isEqual from "lodash.isequal";
import { range } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { initCashflowsForm } from "../InitState";
import { GridState } from "../grid/state";
import { CASHFLOWS_PARAM, CashflowsFormState, CashflowsState, parseCashflows } from "./state";

const Plot = createPlotlyComponent(Plotly);


export interface CashflowsFormProps {
    gridState: GridState;
    cashflowsState: CashflowsState;
    setCashflowsState: React.Dispatch<React.SetStateAction<CashflowsState>>;
}

export const CashflowsForm = ({ gridState, cashflowsState, setCashflowsState }: CashflowsFormProps) => {

    const [state, setState] = useState<CashflowsFormState>(initCashflowsForm);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setState({ ...state, cashflowString: event.target.value }) };

    const onFocus = () => { setState({ ...state, cashflowStringValid: true }) };

    const onBlur = () => {
        const arrayOrNull = parseCashflows(state.cashflowString);
        const newState = { ...state, cashflowStringValid: !(arrayOrNull === null) };
        setState(newState);

        if (newState.cashflowStringValid) {
            const params = new URLSearchParams(window.location.search);
            params.set(CASHFLOWS_PARAM, state.cashflowString);
            history.replaceState({}, "", '?' + params.toString())
            const newState = { cashflows: arrayOrNull! };
            setCashflowsState(s => { return isEqual(s, newState) ? s : newState });
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
        name: '',
        hovertemplate: "Period: %{x}<br>Cashflow: %{y}",
    }];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        showlegend: false,
        height: 250,
        width: 400,
        xaxis: {
            range: [0.5, gridState.periods + 0.5],
            showgrid: true,
        },
        margin: { t: margin, l: margin, r: margin, b: margin }
    }

    return (
        <div className="container"
            style={{ gridColumn: 2 }}>
            <div className="title">Cashflows</div>
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
        </div >
    )

}