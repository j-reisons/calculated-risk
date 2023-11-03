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

    const traces = strategiesState.strategies.flatMap(s => toPlotlyData(s, gridState.wealthStep));
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

function toPlotlyData(strategy: Strategy, step: number): Plotly.Data[] {
    const x = xValues(strategy, step);
    const PDF = x.map(strategy.PDF);
    const max = Math.max(...PDF);
    // TODO: Apply the same color to all the traces
    // TODO: compute the CDF

    const pdfTrace = {
        name: strategy.name,
        x: x,
        y: PDF.map(e => e / max),
        type: 'scatter',
        mode: 'lines',
    } as Plotly.Data;

    const deltaTraces: Plotly.Data[] = [];
    for (const delta of strategy.deltas) {
        deltaTraces.push(
            {
                name: strategy.name,
                x: [delta.location, delta.location],
                y: [0, delta.weight],
                type: 'scatter',
                mode: 'lines+markers',
                hoverinfo: 'none',
                line: { width: 3 },
                marker: {
                    size: [0, 20],
                    symbol: ['triangle-up', 'triangle-up'],
                    opacity: 1
                },
                showlegend:false
            }
        )
    }

    return [pdfTrace, ...deltaTraces];
}

const RANGE_SCALES = 5;
const POINTS_PER_SIDE_POI = 5;

function xValues(strategy: Strategy, step: number): number[] {
    const { location, scale } = strategy;

    const allPoints = [];

    const pointsPerSide = Math.ceil((scale * RANGE_SCALES) / step);
    const start = location - step * pointsPerSide;
    for (let i = 0; i < pointsPerSide * 2 + 1; i++) {
        allPoints.push(start + i * step);
    }

    for (const poi of strategy.pointsOfInterest) {
        const start = poi - step * POINTS_PER_SIDE_POI;
        for (let i = 0; i < POINTS_PER_SIDE_POI * 2 + 1; i++) {
            allPoints.push(start + i * step);
        }
    }

    allPoints.sort((a, b) => a - b)
    const deduped = [];
    for (let i = 0; i < allPoints.length; i++) {
        if (i === 0 || allPoints[i] !== allPoints[i - 1]) {
            deduped.push(allPoints[i]);
        }
    }
    return deduped;
}
