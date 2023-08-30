import React from 'react';

export interface UtilityFormState { }

export interface UtilityFormProps {
    state: UtilityFormState;
    setState: React.Dispatch<React.SetStateAction<UtilityFormState>>
}

export const UtilityForm = ({ state, setState }: UtilityFormProps) => {

    state;
    setState;

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Utility</div>
                Lorem ipsum dolor sic amet</div>
            <textarea className="input-box" placeholder="Type some math here"></textarea>
            <svg className="plotting-area" width="100%" height="100%">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24">Plot here</text>
            </svg>
        </div>
    )
}