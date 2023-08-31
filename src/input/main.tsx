import { GridSize } from '../grid/gridform';
import { CashflowsForm } from './cashflows';
import "./main.css";
import { StrategiesForm } from './strategies';
import { UtilityForm } from './utility';

export interface MainFormProps {
    gridSize: GridSize;
}

export const MainForm = ({ gridSize }: MainFormProps) => {

    return (
        <div className="top-container">
            <StrategiesForm />
            <CashflowsForm gridSize={gridSize} />
            <UtilityForm gridSize={gridSize} />
        </div>
    );
};

export default MainForm;