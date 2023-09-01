import { GridForm, GridFormState, GridState } from "./gridform";
import { GridPlot } from "./gridplot";
import "./main.css";

export interface GridProps {
    gridFormState: GridFormState;
    setGridFormState: React.Dispatch<React.SetStateAction<GridFormState>>;

    gridState: GridState;
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
}

export const Grid = ({ gridFormState, setGridFormState, gridState, setGridState }: GridProps) => {


    return (
        <div className="grid">
            <GridForm gridFormState={gridFormState} setGridFormState={setGridFormState} setGridState={setGridState} />
            <GridPlot gridState={gridState} />
        </div>)
}