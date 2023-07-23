import React from 'react';
import { InputDataProps } from "./types";

export const UtilityForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event;
        inputData;
        setInputData;
        // TODO
    };

    return (
        // TODO
        <div>
            Utility:
            <input
                type="text"
                value={inputData.utility}
                onChange={handleChange}
            />
        </div>
    )
}