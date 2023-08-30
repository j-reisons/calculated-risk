import { GridForm, GridFormState } from "./gridform";
import { GridPlot, GridPlotState } from "./gridplot";
import "./main.css";

export interface GridState {
    formState: GridFormState;
    plotState: GridPlotState;
}

export interface GridProps {
    gridState: GridState;
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
}

export const Grid = ({ gridState, setGridState }: GridProps) => {


    return (
        <div className="grid">
            <GridForm state={gridState} setState={setGridState} />
            <GridPlot state={gridState.plotState} />
        </div>)
}