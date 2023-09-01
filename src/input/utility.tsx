import { evaluate, log, max } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { GridState } from "../grid/gridform";

const Plot = createPlotlyComponent(Plotly);

export interface UtilityFormState {
    // Contents of the textarea
    readonly utilityString: string;
    // Updated on blur
    readonly utilityFunction: (wealth: number) => number;
}

export interface UtilityFormProps {
    gridState: GridState;
}

export const UtilityForm = ({ gridState }: UtilityFormProps) => {

    const [state, setState] = useState<UtilityFormState>({
        utilityString: "f(x)=log(x) + step(x - 100000)",
        utilityFunction: (x: number) => log(x) + step(x - 100000)
    });

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({
            ...state,
            utilityString: event.target.value,
        })
    }

    const onBlur = () => {
        setState({
            ...state,
            utilityFunction: parseUtilityFunction(state.utilityString)
        });
    }

    // Evaluate on center of bins
    const halfStep = (gridState.wealthBoundaries[1] - gridState.wealthBoundaries[0]) / 2
    const wealthRange: number[] = gridState.wealthBoundaries.map((i: number) => { return (i + halfStep) });
    const utility = wealthRange.map(state.utilityFunction);
    // No complex numbers or other shenanigans
    const valid = utility.every(item => typeof item === 'number' && isFinite(item) && !isNaN(item))

    const traces: Plotly.Data[] = [{
        x: wealthRange,
        y: utility,
        type: 'scatter'
    }];
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
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

function parseUtilityFunction(utilityString: string): (i: number) => number {
    const parsed = evaluate(utilityString, { step: step });
    return (i: number) => { return parsed(i) };
}

function step(x: number): number {
    return x > 0 ? 1 : 0;
}
