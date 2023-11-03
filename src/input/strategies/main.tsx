import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from "react";
import createPlotlyComponent from 'react-plotly.js/factory';
import { initStrategiesForm } from "../../InitState";
import { GridState } from "../../grid/state";
import { StrategiesFormState, StrategiesState, Strategy } from "../state";
import { compileStrategiesArray } from "./compiler";

const Plot = createPlotlyComponent(Plotly);

export interface StrategiesFormProps {
    gridState: GridState,
    strategiesState: StrategiesState;
    setStrategiesState: React.Dispatch<React.SetStateAction<StrategiesState>>;
}

export const StrategiesForm = ({ gridState, strategiesState, setStrategiesState }: StrategiesFormProps) => {

    const [state, setState] = useState<StrategiesFormState>(initStrategiesForm);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({ ...state, strategiesString: event.target.value })
    }

    const onFocus = () => { setState({ ...state, strategiesStringValid: true }) }

    const onBlur = () => {
        const arrayOrNull = compileStrategiesArray(state.strategiesString);
        if (arrayOrNull !== null) setStrategiesState({ strategies: arrayOrNull });
        setState({ ...state, strategiesStringValid: arrayOrNull !== null })
    }

    const traces = strategiesState.strategies.map(s => toPlotlyData(s, gridState.wealthStep));
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        height: 250,
        width: 400,
        margin: { t: margin, l: margin, r: margin, b: margin }
    }

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Strategies</div>
                Lorem ipsum dolor sit amet</div>
            <textarea className={"input-box"}
                style={!state.strategiesStringValid ? { borderColor: "red" } : {}}
                placeholder="Type some math here"
                onChange={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
                value={state.strategiesString}
            ></textarea>
            <Plot
                data={traces}
                layout={layout} />
        </div>
    )
}

function toPlotlyData(strategy: Strategy, step: number): Plotly.Data {
    const x = xValues(strategy, step);
    const PDF = x.map(strategy.PDF);
    const max = Math.max(...PDF);
    return {
        name: strategy.name,
        x: x,
        y: PDF.map(e => e / max),
        type: 'scatter',
        mode: 'lines',
    };
}

const RANGE_SCALES = 5;

function xValues(strategy: Strategy, step: number): number[] {
    const { location, scale } = strategy;

    if (scale === 0) {
        return [(1 - Number.EPSILON) * location, location, (1 + Number.EPSILON) * location]
    }

    const pointsPerSide = Math.ceil((scale * RANGE_SCALES) / step);
    const out = new Array<number>(2 * pointsPerSide + 1);

    const start = location - step * pointsPerSide;
    for (let i = 0; i < out.length; i++) {
        out[i] = start + i * step;
    }
    return out;
}
