import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from "react";
import createPlotlyComponent from 'react-plotly.js/factory';
import { initStrategiesForm } from "../../InitState";
import { StrategiesFormState, StrategiesState } from "../state";
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

    const traces = [];
    for (let i = 0; i < strategiesState.strategies.length; i++) {
        const strategy = strategiesState.strategies[i];
        const data: Plotly.Data = {
            name: strategy.name,
            x: strategy.plotX(),
            y: strategy.plotY(),
            type: 'scatter',
        };
        traces.push(data)
    }
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
