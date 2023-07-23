import React from "react";
import { InputDataProps } from "./types";

export const StrategiesForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event;
        inputData;
        setInputData;
        // TODO
    };

    return (
        // TODO
        <div>
            Strategies:
            <input
                type="text"
                value=""
                onChange={handleChange}
            />
        </div>
    )
}
