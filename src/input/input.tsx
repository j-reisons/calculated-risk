import React from 'react';
import { CashflowsForm } from './cashflows';
import { StrategiesForm } from './strategies';
import { InputDataProps } from './types';
import { UtilityForm } from './utility';
import { WealthGridForm } from './wealthGrid';


export const InputForm: React.FC<InputDataProps> = ({ inputData, setInputData }) => {

    return (
        <div className="top-container">
            <CashflowsForm inputData={inputData} setInputData={setInputData} />

            <StrategiesForm inputData={inputData} setInputData={setInputData} />

            <WealthGridForm inputData={inputData} setInputData={setInputData} />

            <UtilityForm inputData={inputData} setInputData={setInputData} />
        </div>
    );
};

export default InputForm;