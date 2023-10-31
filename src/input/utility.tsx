import { cumsum, evaluate } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { initUtilityForm } from "../InitState";
import { GridState, TrajectoriesState } from "../grid/state";
import { UtilityFormState, UtilityState, step } from "./state";

const Plot = createPlotlyComponent(Plotly);

export interface UtilityFormProps {
    gridState: GridState;
    utilityState: UtilityState;
    trajectoriesState: TrajectoriesState | null;
    setUtilityState: React.Dispatch<React.SetStateAction<UtilityState>>;
}

export const UtilityForm = ({ gridState, utilityState, trajectoriesState, setUtilityState }: UtilityFormProps) => {

    const [state, setState] = useState<UtilityFormState>(initUtilityForm);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({
            ...state,
            utilityString: event.target.value,
        })
    }

    const onBlur = () => {
        setUtilityState({
            utilityFunction: parseUtilityFunction(state.utilityString)
        });
    }

    // Evaluate on center of bins
    const wealthBoundaries = gridState.wealthBoundaries;
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2)
    const utility = wealthValues.map(utilityState.utilityFunction);
    // No complex numbers or other shenanigans
    const valid = utility.every(item => typeof item === 'number' && isFinite(item) && !isNaN(item))

    let terminalDistributionTraces: Plotly.Data[] = [];
    if (trajectoriesState) {
        const trajectories = trajectoriesState.extendedTrajectories;
        const boundaries = trajectoriesState.extendedBoundaries;
        const values = trajectoriesState.extendedValues;

        // The +/- inf boundaries at the edges are funky
        const widths = trajectoriesState.extendedBoundaries.map((_, i) => boundaries[i] - (boundaries[i - 1] || 0));
        widths[0] = widths[2];
        widths[1] = widths[2];
        widths[widths.length - 1] = widths[widths.length - 2];
        values[0] = 0
        values[values.length - 1] = values[values.length] + widths[widths.length - 1];

        const terminalProbabilities = trajectories[trajectories.length - 1];
        const terminalCDF = cumsum(terminalProbabilities) as number[];

        const terminalDensitites = terminalProbabilities.map((p, i) => p / widths[i]);
        const scaleFactor = Math.max(...utility) / Math.max(...terminalDensitites.slice(1, -1));
        const scaledDensity = terminalDensitites.map(d => d * scaleFactor);
        scaledDensity[0] = terminalProbabilities[0];
        scaledDensity[scaledDensity.length - 1] = terminalProbabilities[terminalProbabilities.length - 1];

        terminalDistributionTraces = [{
            x: values,
            y: scaledDensity,
            customdata: terminalCDF,
            type: 'scatter',
            hovertemplate: "Wealth: %{x:.4s}<br>CDF: %{customdata:.2%}",
            showlegend:false
        }]
    }

    const traces: Plotly.Data[] = [
        {
            x: wealthValues,
            y: utility,
            type: 'scatter',
            hovertemplate: "Wealth: %{x:.4s}<br>Utility: %{y:.4g}",
            showlegend:false,
        },
        ...terminalDistributionTraces,
    ];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        height: 250,
        width: 400,
        xaxis: {
            range: [- 0.05 * gridState.wealthBoundaries[gridState.wealthBoundaries.length - 1], gridState.wealthBoundaries[gridState.wealthBoundaries.length - 1] * 1.05],
        },
        margin: { t: margin, l: margin, r: margin, b: margin }
    }

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Utility</div>
                Lorem ipsum dolor sic amet</div>
            <textarea className={"input-box"}
                style={!valid ? { borderColor: "red" } : {}}
                placeholder="Type some math here"
                onChange={handleInput}
                onBlur={onBlur}
                value={state.utilityString}>
            </textarea>
            <Plot
                data={traces}
                layout={layout} />
        </div>
    )
}

// TODO: validation of some kind
function parseUtilityFunction(utilityString: string): (i: number) => number {
    const parsed = evaluate(utilityString, { step: step });
    return (i: number) => { return parsed(i) };
}
