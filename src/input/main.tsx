
import { GridState, TrajectoriesState } from '../grid/state';
import { CashflowsForm } from './cashflows';
import "./main.css";
import { CashflowsState, StrategiesState, UtilityState } from './state';
import { StrategiesForm } from './strategies';
import { UtilityForm } from './utility';

export interface MainFormProps {
    gridState: GridState;
    trajectoriesState: TrajectoriesState | null;
    setStrategiesState: React.Dispatch<React.SetStateAction<StrategiesState>>;
    cashflowsState: CashflowsState;
    setCashflowsState: React.Dispatch<React.SetStateAction<CashflowsState>>;
    utilityState: UtilityState;
    setUtilityState: React.Dispatch<React.SetStateAction<UtilityState>>;
}

export const MainForm = ({ gridState, trajectoriesState, setStrategiesState, cashflowsState, setCashflowsState, utilityState, setUtilityState }: MainFormProps) => {

    return (
        <div className="top-container">
            <StrategiesForm setStrategiesState={setStrategiesState} />
            <CashflowsForm gridState={gridState} cashflowsState={cashflowsState} setCashflowsState={setCashflowsState} />
            <UtilityForm gridState={gridState} utilityState={utilityState} trajectoriesState={trajectoriesState} setUtilityState={setUtilityState} />
        </div>
    );
};

export default MainForm;