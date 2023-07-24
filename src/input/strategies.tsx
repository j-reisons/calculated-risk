import React from "react";
import { InputDataProps } from "./types";

export const StrategiesForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    inputData;
    setInputData;

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Strategies</div>
                Lorem ipsum dolor sic amet</div>
            <textarea className="input-box" placeholder="Type some math here"></textarea>
            <svg className="plotting-area" width="100%" height="100%">
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24">Plot here</text>
            </svg>
        </div>
    )
}
