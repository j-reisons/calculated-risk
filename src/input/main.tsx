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

    // Dispatch<A|(A) => A> Is not the same as Dispatch<A> | Dispatch<(A) => A>
    // Odious hack
    const setStrategies = (strategiesFormState: React.SetStateAction<StrategiesFormState>) => { setState({ ...state, strategiesFormState: strategiesFormState as StrategiesFormState }) };
    const setCashflows = (cashflowsFormState: React.SetStateAction<CashflowsFormState>) => { setState({ ...state, cashflowsFormState: cashflowsFormState as CashflowsFormState }) };
    const setUtility = (utilityFormState: React.SetStateAction<UtilityFormState>) => { setState({ ...state, utilityFormState: utilityFormState as UtilityFormState }) };

    return (
        <div className="top-container">
            <StrategiesForm state={state.strategiesFormState} setState={setStrategies} />
            <CashflowsForm state={state.cashflowsFormState} setState={setCashflows} />
            <UtilityForm state={state.utilityFormState} setState={setUtility} />
        </div>
    );
};

export default MainForm;