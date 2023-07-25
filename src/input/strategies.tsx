import React from "react";

export interface StrategiesFormState { }

export interface StrategiesFormProps {
    state: StrategiesFormState;
    setState: React.Dispatch<React.SetStateAction<StrategiesFormState>>
}

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
