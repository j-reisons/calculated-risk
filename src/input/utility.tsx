import { evaluate } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { initUtilityForm } from "../InitState";
import { GridState } from "../grid/state";
import { UtilityFormState, UtilityState, step } from "./state";

const Plot = createPlotlyComponent(Plotly);

export interface UtilityFormProps {
    gridState: GridState;
    utilityState: UtilityState;
    setUtilityState: React.Dispatch<React.SetStateAction<UtilityState>>;
}

export const UtilityForm = ({ gridState, utilityState, setUtilityState }: UtilityFormProps) => {

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

    const traces: Plotly.Data[] = [{
        x: wealthValues,
        y: utility,
        type: 'scatter'
    }];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        height: 250,
        width: 400,
        xaxis: {
            range: [gridState.wealthBoundaries[0], gridState.wealthBoundaries[gridState.wealthBoundaries.length - 1]],
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
