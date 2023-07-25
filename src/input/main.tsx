import React from 'react';
import { CashflowsForm, CashflowsFormState } from './cashflows';
import { StrategiesForm, StrategiesFormState } from './strategies';
import { UtilityForm, UtilityFormState } from './utility';
import { WealthGridForm, WealthGridFormState } from './wealthGrid';


export interface MainFormState {
    cashflowsFormState: CashflowsFormState;
    strategiesFormState: StrategiesFormState;
    utilityFormState: UtilityFormState;
    wealthGridFormState: WealthGridFormState;

}

export interface MainFormProps {
    state: MainFormState;
    setState: React.Dispatch<React.SetStateAction<MainFormState>>;
}

export const MainForm: React.FC<MainFormProps> = ({ state, setState }) => {

    const setCashflows = (cashflowsFormState: CashflowsFormState) => { setState({ ...state, cashflowsFormState: cashflowsFormState }) };
    const setStrategies = (strategiesFormState: StrategiesFormState) => { setState({ ...state, strategiesFormState: strategiesFormState }) };
    const setUtility = (utilityFormState: UtilityFormState) => { setState({ ...state, utilityFormState: utilityFormState }) };
    const setWealthGrid = (wealthGridFormState: WealthGridFormState) => { setState({ ...state, wealthGridFormState: wealthGridFormState }) };

    return (
        <div className="top-container">
            <CashflowsForm state={state.cashflowsFormState} setState={setCashflows} />

            <StrategiesForm state={state.strategiesFormState} setState={setStrategies} />

            <WealthGridForm state={state.wealthGridFormState} setState={setWealthGrid} />

            <UtilityForm state={state.utilityFormState} setState={setUtility} />
        </div>
    );
};

export default MainForm;