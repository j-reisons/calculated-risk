import { GridState } from '../grid/gridform';
import { CashflowsForm, CashflowsState } from './cashflows';
import "./main.css";
import { StrategiesForm, StrategiesState } from './strategies';
import { UtilityForm, UtilityState } from './utility';

export interface MainFormProps {
    gridState: GridState;
    setStrategiesState: React.Dispatch<React.SetStateAction<StrategiesState>>;
    cashflowsState: CashflowsState;
    setCashflowsState: React.Dispatch<React.SetStateAction<CashflowsState>>;
    utilityState: UtilityState;
    setUtilityState: React.Dispatch<React.SetStateAction<UtilityState>>;
}

export const MainForm = ({ gridState, setStrategiesState, cashflowsState, setCashflowsState, utilityState, setUtilityState }: MainFormProps) => {

    return (
        <div className="top-container">
            <StrategiesForm setStrategiesState={setStrategiesState} />
            <CashflowsForm gridState={gridState} cashflowsState={cashflowsState} setCashflowsState={setCashflowsState} />
            <UtilityForm gridState={gridState} utilityState={utilityState} setUtilityState={setUtilityState} />
        </div>
    );
};

export default MainForm;