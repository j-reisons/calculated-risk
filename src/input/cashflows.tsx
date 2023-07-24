import Plotly from "plotly.js-cartesian-dist";
import React, { useEffect } from 'react';

import { Matrix, evaluate, isMatrix } from "mathjs";
import "./input.css";
import { InputDataProps } from "./types";


export const CashflowsForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputData({
            ...inputData,
            cashflowString: event.target.value,
        })
    }

    const onFocus = () => {
        setInputData({
            ...inputData,
            cashflowStringValid: true,
        })
    }

    const onBlur = () => {
        const arrayOrNull = parseCashflowArray(inputData.cashflowString);
        if (arrayOrNull == null) {
            setInputData({
                ...inputData,
                cashflowStringValid: false,
            })
        } else {
            setInputData({
                ...inputData,
                cashflowStringValid: true,
                cashflows: arrayOrNull
            })
        }
    }

    // TODO: Use more of the space
    useEffect(() => {
        // Create the plot
        Plotly.newPlot('plotting-area', [{
            y: inputData.cashflows,
            type: 'bar'
        }]);

        // Clean up on component unmount
        return () => {
            Plotly.purge('plotting-area');
        };

    })

    // useEffect to sync plot to the vector

    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Cashflows</div>
                Lorem ipsum dolor sit amet</div>
            <textarea className={"input-box"}
                style={!inputData.cashflowStringValid ? { borderColor: "red" } : {}}
                placeholder="Type some math here"
                onChange={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
                value={inputData.cashflowString}>
            </textarea>
            <div id="plotting-area">
            </div>
        </div>
    )

}

//TODO: allow multiline,e.g.
// concat(ones(10),zeros(10))*50000 
// - concat(zeros(10),ones(10))*50000 
// Right now it errors
function parseCashflowArray(cashflowString: string): (number[] | null) {
    let result;
    try {
        result = evaluate(cashflowString);
        if (isMatrix(result) && result.size().length === 1) {
            return (result as Matrix).toArray() as number[];
        }
        return null;
    }
    catch (error) {
        return null;
    }
}