import { GridState } from '../grid/gridform';
import { CashflowsForm } from './cashflows';
import "./main.css";
import { StrategiesForm } from './strategies';
import { UtilityForm } from './utility';

export interface MainFormProps {
    gridState: GridState;
}

export const MainForm = ({ gridState }: MainFormProps) => {

    return (
        <div className="top-container">
            <StrategiesForm />
            <CashflowsForm gridState={gridState} />
            <UtilityForm gridState={gridState} />
        </div>
    );
};

export default MainForm;