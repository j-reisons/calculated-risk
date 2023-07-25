import React from "react";

export interface WealthGridFormState { }

export interface WealthGridFormProps {
    state: WealthGridFormState;
    setState: React.Dispatch<React.SetStateAction<WealthGridFormState>>
}

export const WealthGridForm: React.FC<WealthGridFormProps> = ({ state, setState }) => {

    state;
    setState;

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Wealth grid</div>
                Lorem ipsum dolor sic amet</div>
            <textarea className="input-box" placeholder="Type some math here"></textarea>
            <svg className="plotting-area" width="100%" height="100%">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24">Plot here</text>
            </svg>
        </div>
    )
}
