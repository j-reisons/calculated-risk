import { useState } from "react";
import { initTrajectoriesInputFormState, initTrajectoriesInputState } from "../InitState";
import { CashflowsState, StrategiesState, UtilityState } from "../input/state";
import { GridPlot } from "./gridplot";
import "./main.css";
import { SideForm } from "./sideform";
import { GridState, TrajectoriesInputFormState, TrajectoriesInputState, TrajectoriesState } from "./state";

export interface GridProps {
    gridState: GridState;
    strategiesState: StrategiesState,
    cashflowsState: CashflowsState,
    utilityState: UtilityState,
    trajectoriesState: TrajectoriesState | null,
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
    setTrajectoriesState: React.Dispatch<React.SetStateAction<TrajectoriesState | null>>;
}

export const Grid = ({ gridState, strategiesState, cashflowsState, utilityState, trajectoriesState,
    setGridState, setTrajectoriesState }: GridProps) => {

    const [trajectoriesInputState, setTrajectoriesInputState] = useState<TrajectoriesInputState>(initTrajectoriesInputState);
    const [trajectoriesInputFormState, setTrajectoriesInputFormState] = useState<TrajectoriesInputFormState>(initTrajectoriesInputFormState);

    return (
        <div className="grid">
            <SideForm
                trajectoriesInputFormState={trajectoriesInputFormState}
                setGridState={setGridState}
                setTrajectoriesInputFormState={setTrajectoriesInputFormState}
                setTrajectoriesInputState={setTrajectoriesInputState} />
            <GridPlot
                gridState={gridState}
                strategiesState={strategiesState}
                cashflowsState={cashflowsState}
                utilityState={utilityState}
                trajectoriesInputState={trajectoriesInputState}
                trajectoriesState={trajectoriesState}
                setTrajectoriesInputState={setTrajectoriesInputState}
                setTrajectoriesInputFormState={setTrajectoriesInputFormState}
                setTrajectoriesState={setTrajectoriesState} />
        </div>)
}