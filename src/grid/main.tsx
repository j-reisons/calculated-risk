import { CashflowsState, StrategiesState, UtilityState } from "../input/state";
import { GridForm } from "./gridform";
import { GridPlot } from "./gridplot";
import "./main.css";
import { GridState, TrajectoriesState } from "./state";

export interface GridProps {
    gridState: GridState;
    strategiesState: StrategiesState,
    cashflowsState: CashflowsState,
    utilityState: UtilityState,
    trajectoriesState: TrajectoriesState | null,
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
    setTrajectoriesState: React.Dispatch<React.SetStateAction<TrajectoriesState | null>>;
}

export const Grid = ({ gridState, strategiesState, cashflowsState, utilityState, trajectoriesState, setGridState, setTrajectoriesState }: GridProps) => {

    return (
        <div className="grid">
            <GridForm setGridState={setGridState} />
            <GridPlot
                gridState={gridState}
                strategiesState={strategiesState}
                cashflowsState={cashflowsState}
                utilityState={utilityState}
                trajectoriesState={trajectoriesState}
                setTrajectoriesState={setTrajectoriesState} />
        </div>)
}