import isEqual from "lodash.isequal";
import { cumsum } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { initUtilityForm } from "../InitState";
import { GridState, TrajectoriesState } from "../grid/state";
import { UTILITY_PARAM, UtilityFormState, UtilityState, isPositiveFiniteNumber, parseUtility } from "./state";

const Plot = createPlotlyComponent(Plotly);

export interface UtilityFormProps {
    gridState: GridState;
    utilityState: UtilityState;
    trajectoriesState: TrajectoriesState | null;
    setUtilityState: React.Dispatch<React.SetStateAction<UtilityState>>;
}

export const UtilityForm = ({ gridState, utilityState, trajectoriesState, setUtilityState }: UtilityFormProps) => {

    const [state, setState] = useState<UtilityFormState>(initUtilityForm);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setState({ ...state, utilityString: event.target.value }) }

    const onFocus = () => { setState({ ...state, textAreaFocused: true }) }

    const onBlur = () => {
        const utilityOrNull = parseUtility(state.utilityString);
        if (utilityOrNull !== null) {
            const params = new URLSearchParams(window.location.search);
            const oldUtilityString = params.get(UTILITY_PARAM);
            params.set(UTILITY_PARAM, state.utilityString);
            history.replaceState({}, "", '?' + params.toString())

            if (!isEqual(oldUtilityString, state.utilityString)) {
                setUtilityState({ utilityFunction: utilityOrNull });
            }
        }

        setState({ ...state, textAreaFocused: false, utilityStringParses: utilityOrNull !== null });
    }

    const wealthValues = gridState.wealthValues;
    const utility = gridState.wealthValues.map(utilityState.utilityFunction);
    // No complex numbers or other shenanigans
    const valid = utility.every(isPositiveFiniteNumber)
    const redBorder = !state.textAreaFocused && (!state.utilityStringParses || !valid);

    let terminalDistributionTraces: Plotly.Data[] = [];
    if (trajectoriesState) terminalDistributionTraces = toPlotlyData(trajectoriesState, utility);

    const traces: Plotly.Data[] = [
        {
            name: "",
            x: wealthValues,
            y: utility,
            type: 'scatter',
            hovertemplate: "Wealth: %{x:.4s}<br>Utility: %{y:.4g}",
            line: { color: 'rgb(5,10,172)' },
            showlegend: false,
        },
        ...terminalDistributionTraces,
    ];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        height: 250,
        width: 400,
        xaxis: {
            range: [- 0.05 * gridState.wealthMax, gridState.wealthMax * 1.05],
        },
        margin: { t: margin, l: margin, r: margin, b: margin }
    }

    return (
        <div className="container"
        style={{ gridColumn: 3 }}>
            <div className="title">Utility</div>
            <textarea className={"input-box"}
                style={redBorder ? { borderColor: "red" } : {}}
                placeholder={'# Assign Utility(w), e.g. \nUtility(w) = step(w - 100000)'}
                onChange={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
                value={state.utilityString}>
            </textarea>
            <Plot
                data={traces}
                layout={layout} />
        </div>
    )
}

function toPlotlyData(trajectoriesState: TrajectoriesState, utility: number[]): Plotly.Data[] {
    const trajectories = trajectoriesState.extendedTrajectories;
    const boundaries = trajectoriesState.extendedBoundaries;
    const values = trajectoriesState.extendedValues;

    const widths = trajectoriesState.extendedBoundaries.map((_, i) => boundaries[i] - (boundaries[i - 1] || 0)).slice(1);
    // The +/- inf boundaries at the edges are funky
    widths[0] = widths[1];
    widths[widths.length - 1] = widths[widths.length - 2];

    const terminalProbabilities = trajectories[trajectories.length - 1];
    const terminalCDF = cumsum(terminalProbabilities) as number[];

    const terminalDensitites = terminalProbabilities.map((p, i) => p / widths[i]);
    const maxUtility = Math.max(...utility);
    const scaleFactor = (1 - terminalProbabilities[0]) * maxUtility / Math.max(...terminalDensitites.slice(1, -1));
    const scaledDensity = terminalDensitites.map(d => d * scaleFactor);
    scaledDensity[0] = terminalProbabilities[0];
    scaledDensity[scaledDensity.length - 1] = terminalProbabilities[terminalProbabilities.length - 1];

    return [{
        name: "",
        x: values,
        y: scaledDensity,
        customdata: terminalCDF,
        type: 'scatter',
        line: {
            color: 'rgb(178,10,28)'
        },
        hovertemplate: "Wealth: %{x:.4s}<br>CDF: %{customdata:.2%}",
        showlegend: false
    },
    {
        name: "",
        x: [0, 0],
        y: [0, terminalProbabilities[0] * maxUtility],
        customdata: [0, terminalProbabilities[0]],
        hovertemplate: "Wealth: %{x:.4s}<br>CDF: %{customdata:.2%}",
        type: 'scatter',
        mode: 'lines+markers',
        hoverinfo: 'none',
        line: {
            width: 3,
            color: 'rgb(178,10,28)'
        },
        marker: {
            size: [0, 20],
            symbol: ['triangle-up', 'triangle-up'],
            opacity: 1
        },
        showlegend: false
    }]
}
