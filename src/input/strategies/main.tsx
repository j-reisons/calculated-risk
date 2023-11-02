import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from "react";
import createPlotlyComponent from 'react-plotly.js/factory';
import { initStrategiesForm } from "../../InitState";
import { StrategiesFormState, StrategiesState, Strategy } from "../state";
import { parseStrategiesArray } from "./parser";

const Plot = createPlotlyComponent(Plotly);

export interface StrategiesFormProps {
    strategiesState: StrategiesState;
    setStrategiesState: React.Dispatch<React.SetStateAction<StrategiesState>>;
}

export const StrategiesForm = ({ strategiesState, setStrategiesState }: StrategiesFormProps) => {

    const [state, setState] = useState<StrategiesFormState>(initStrategiesForm);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({ ...state, strategiesString: event.target.value })
    }

    const onFocus = () => { setState({ ...state, strategiesStringValid: true }) }

    const onBlur = () => {
        const arrayOrNull = parseStrategiesArray(state.strategiesString);
        if (arrayOrNull !== null) setStrategiesState({ strategies: arrayOrNull });
        setState({ ...state, strategiesStringValid: arrayOrNull !== null })
    }

    const traces = strategiesState.strategies.map(toPlotlyData);
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

const PLOT_POINTS = (100 * 2) + 1;
const RANGE_SCALES = 5;

function toPlotlyData(strategy: Strategy): Plotly.Data {
    const x = xValues(strategy);
    const y = x.map(strategy.sketchPDF);
    return {
        name: strategy.name,
        x: x,
        y: y,
        type: 'scatter',
    };
}

function xValues(strategy: Strategy): number[] {
    const { location, scale } = strategy;
    if (scale === 0) {
        return [(1 - Number.EPSILON) * location, location, (1 + Number.EPSILON) * location]
    }

    const out = new Array(PLOT_POINTS);
    const start = location - scale * RANGE_SCALES;
    const step = scale * (2 * RANGE_SCALES) / (PLOT_POINTS - 1);
    for (let i = 0; i < PLOT_POINTS; i++) {
        out[i] = start + i * step;
    }
    return out;
}
