import React from "react";

export interface StrategiesFormState { }

export interface StrategiesFormProps {
    state: StrategiesFormState;
    setState: React.Dispatch<React.SetStateAction<StrategiesFormState>>
}

// Parse a positive linear combination of a set of known functions: normal and delta, potentially more in the future
// Plot their PDFs and compute their CDFs.
//
// I need a symbolic representation of the strategies, along with a way to plot the supported primitives.
// I can leverage the MathJS parser, simplifier, and then compile the remaining terms into my strategy objects
//
export const StrategiesForm: React.FC<StrategiesFormProps> = ({ state, setState }) => {

    state;
    setState;

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Strategies</div>
                Lorem ipsum dolor sit amet</div>
            <textarea className="input-box" placeholder="Type some math here"></textarea>
            <svg className="plotting-area" width="100%" height="100%">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24">Plot here</text>
            </svg>
        </div>
    )
}
