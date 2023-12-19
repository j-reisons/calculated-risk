import { useState } from "react";
import { initPickOnClick, initCIs, initCIsString, initTrajectoriesStartFormState, initTrajectoriesStartState } from "../InitState";
import { CashflowsState, StrategiesState, UtilityState } from "../input/state";
import { GridPlot } from "./gridplot";
import "./main.css";
import { SideForm } from "./sideform";
import { GridState, TrajectoriesStartFormState, TrajectoriesStartState, TrajectoriesState } from "./state";

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

    const [trajectoriesStartState, setTrajectoriesStartState] = useState<TrajectoriesStartState>(initTrajectoriesStartState);
    const [trajectoriesStartFormState, setTrajectoriesStartFormState] = useState<TrajectoriesStartFormState>(initTrajectoriesStartFormState);
    const [CIsString, setCIsString] = useState<string>(initCIsString!);
    const [CIs, setCIs] = useState<number[]>(initCIs);
    const [pickOnClick, setPickOnClick] = useState<boolean>(initPickOnClick);

    return (
        <div className="grid">
            <SideForm
                trajectoriesStartFormState={trajectoriesStartFormState}
                CIsString={CIsString}
                pickOnClick={pickOnClick}
                setGridState={setGridState}
                setTrajectoriesStartFormState={setTrajectoriesStartFormState}
                setCIsString={setCIsString}
                setTrajectoriesStartState={setTrajectoriesStartState}
                setCIs={setCIs}
                setPickOnClick={setPickOnClick} />
            <GridPlot
                gridState={gridState}
                strategiesState={strategiesState}
                cashflowsState={cashflowsState}
                utilityState={utilityState}
                CIs={CIs}
                trajectoriesStartState={trajectoriesStartState}
                pickOnClick={pickOnClick}
                trajectoriesState={trajectoriesState}
                setTrajectoriesStartState={setTrajectoriesStartState}
                setTrajectoriesStartFormState={setTrajectoriesStartFormState}
                setTrajectoriesState={setTrajectoriesState} />
        </div>)
}