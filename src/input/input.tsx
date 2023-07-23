import React from 'react';
import { CashflowsForm } from './cashflows';
import { StrategiesForm } from './strategies';
import { InputDataProps } from './types';
import { UtilityForm } from './utility';


export const InputForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInputData(
            {
                ...inputData,
                periods: parseInt(event.target.value),
            }
        );
    };

    return (
        <div>
            <div>
                Periods:
                <input
                    type="number"
                    value={inputData.periods}
                    onChange={handleChange}
                />
            </div>

            <CashflowsForm inputData={inputData} setInputData={setInputData} />

            <UtilityForm inputData={inputData} setInputData={setInputData} />

            <StrategiesForm inputData={inputData} setInputData={setInputData} />
        </div>
    );
};

export default InputForm;