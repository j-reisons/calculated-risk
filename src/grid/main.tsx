import { CashflowsState, StrategiesState, UtilityState } from "../input/state";
import { GridForm } from "./gridform";
import { GridPlot } from "./gridplot";
import "./main.css";
import { GridState } from "./state";

export interface GridProps {
    gridState: GridState;
    strategiesState: StrategiesState,
    cashflowsState: CashflowsState,
    utilityState: UtilityState,
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
}

export const Grid = ({ gridState, strategiesState, cashflowsState, utilityState, setGridState }: GridProps) => {

    return (
        <div className="grid">
            <GridForm setGridState={setGridState} />
            <GridPlot gridState={gridState} strategiesState={strategiesState} cashflowsState={cashflowsState} utilityState={utilityState} />
        </div>)
}