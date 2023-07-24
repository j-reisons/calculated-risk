import React from 'react';

import "./input.css";
import { InputDataProps } from "./types";


export const CashflowsForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {
    inputData;
    setInputData;

    // onChange to handle typing
    // onBlur or similar to parse what was typed into the vector
    // useEffect to sync plot to the vector

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Cashflows</div>
                Lorem ipsum dolor sic amet</div>
            <textarea className="input-box" placeholder="Type some math here"></textarea>
            <svg className="plotting-area" width="100%" height="100%">
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="24">Plot here</text>
            </svg>
        </div>
    )

}