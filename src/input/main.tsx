import React from 'react';
import { CashflowsForm, CashflowsFormState } from './cashflows';
import "./main.css";
import { StrategiesForm, StrategiesFormState } from './strategies';
import { UtilityForm, UtilityFormState } from './utility';


export interface MainFormState {
    cashflowsFormState: CashflowsFormState;
    strategiesFormState: StrategiesFormState;
    utilityFormState: UtilityFormState;
}

export interface MainFormProps {
    state: MainFormState;
    setState: React.Dispatch<React.SetStateAction<MainFormState>>;
}

export const MainForm = ({ state, setState }: MainFormProps) => {

    const setStrategies = (strategiesFormState: StrategiesFormState) => { setState({ ...state, strategiesFormState: strategiesFormState }) };
    const setCashflows = (cashflowsFormState: CashflowsFormState) => { setState({ ...state, cashflowsFormState: cashflowsFormState }) };
    const setUtility = (utilityFormState: UtilityFormState) => { setState({ ...state, utilityFormState: utilityFormState }) };

    return (
        <div className="top-container">
            <StrategiesForm state={state.strategiesFormState} setState={setStrategies} />
            <CashflowsForm state={state.cashflowsFormState} setState={setCashflows} />
            <UtilityForm state={state.utilityFormState} setState={setUtility} />
        </div>
    );
};

export default MainForm;