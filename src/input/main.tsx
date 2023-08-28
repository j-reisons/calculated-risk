import React from 'react';
import { GridForm, GridFormState } from './grid';
import { CashflowsForm, CashflowsFormState } from './cashflows';
import { StrategiesForm, StrategiesFormState } from './strategies';
import { UtilityForm, UtilityFormState } from './utility';


export interface MainFormState {
    gridFormState: GridFormState;
    cashflowsFormState: CashflowsFormState;
    strategiesFormState: StrategiesFormState;
    utilityFormState: UtilityFormState;
}

export interface MainFormProps {
    state: MainFormState;
    setState: React.Dispatch<React.SetStateAction<MainFormState>>;
}

export const MainForm: React.FC<MainFormProps> = ({ state, setState }) => {

    const setGrid = (gridFormState: GridFormState) => { setState({ ...state, gridFormState: gridFormState }) };
    const setCashflows = (cashflowsFormState: CashflowsFormState) => { setState({ ...state, cashflowsFormState: cashflowsFormState }) };
    const setStrategies = (strategiesFormState: StrategiesFormState) => { setState({ ...state, strategiesFormState: strategiesFormState }) };
    const setUtility = (utilityFormState: UtilityFormState) => { setState({ ...state, utilityFormState: utilityFormState }) };

    return (
        <div className="top-container">
            <GridForm state={state.gridFormState} setState={setGrid} />

            <CashflowsForm state={state.cashflowsFormState} setState={setCashflows} />

            <StrategiesForm state={state.strategiesFormState} setState={setStrategies} />

            <UtilityForm state={state.utilityFormState} setState={setUtility} />
        </div>
    );
};

export default MainForm;