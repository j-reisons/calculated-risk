import { useState } from "react";
import { initPickOnClick, initQuantiles, initQuantilesString, initTrajectoriesStartFormState, initTrajectoriesStartState } from "../InitState";
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
    const [quantilesString, setQuantilesString] = useState<string>(initQuantilesString!);
    const [quantiles, setQuantiles] = useState<number[]>(initQuantiles);
    const [pickOnClick, setPickOnClick] = useState<boolean>(initPickOnClick);

    return (
        <div className="grid">
            <SideForm
                trajectoriesStartFormState={trajectoriesStartFormState}
                quantilesString={quantilesString}
                pickOnClick={pickOnClick}
                setGridState={setGridState}
                setTrajectoriesStartFormState={setTrajectoriesStartFormState}
                setQuantilesString={setQuantilesString}
                setTrajectoriesStartState={setTrajectoriesStartState}
                setQuantiles={setQuantiles}
                setPickOnClick={setPickOnClick} />
            <GridPlot
                gridState={gridState}
                strategiesState={strategiesState}
                cashflowsState={cashflowsState}
                utilityState={utilityState}
                quantiles={quantiles}
                trajectoriesStartState={trajectoriesStartState}
                pickOnClick={pickOnClick}
                trajectoriesState={trajectoriesState}
                setTrajectoriesStartState={setTrajectoriesStartState}
                setTrajectoriesStartFormState={setTrajectoriesStartFormState}
                setTrajectoriesState={setTrajectoriesState} />
        </div>)
}