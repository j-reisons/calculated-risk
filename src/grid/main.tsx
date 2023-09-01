import { CashflowsState } from "../input/cashflows";
import { StrategiesState } from "../input/strategies";
import { UtilityState } from "../input/utility";
import { GridForm, GridState } from "./gridform";
import { GridPlot } from "./gridplot";
import "./main.css";

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