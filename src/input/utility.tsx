import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { GridSize } from "../grid/gridform";

const Plot = createPlotlyComponent(Plotly);

export interface UtilityFormState {
    // Contents of the textarea
    readonly utilityString: string;
    // Set on blue, reset on focus
    readonly utilityStringValid: boolean;
    // Updated on blur, if valid
    readonly utilityFunction: (wealth: number) => number;
}

export interface UtilityFormProps {
    gridSize: GridSize;
}

export const UtilityForm = ({ gridSize }: UtilityFormProps) => {

    const [state, setState] = useState<UtilityFormState>({});

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({
            ...state,
            utilityString: event.target.value,
        })
    }

    const onFocus = () => {
        setState({
            ...state,
            utilityStringValid: true,
        })
    }

    const onBlur = () => {
        const functionOrNull = parseUtilityFunction(state.utilityString);
        if (functionOrNull) {
            setState({
                ...state,
                utilityStringValid: true,
                utilityFunction: functionOrNull
            })
        } else {
            setState({
                ...state,
                utilityStringValid: false,
            })
        }
    }

    // TODO: Get the wealth range
    // TODO: plot the function
    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Utility</div>
                Lorem ipsum dolor sic amet</div>
            <textarea className={"input-box"}
                style={!state.utilityStringValid ? { borderColor: "red" } : {}}
                placeholder="Type some math here"
                onChange={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
                value={state.utilityString}>
            </textarea>
            <svg className="plotting-area" width="100%" height="100%">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24">Plot here</text>
            </svg>
        </div>
    )
}

// TODO: parse the function
function parseUtilityFunction(utilityString: string): (i: number) => number {
    return i => i
}
