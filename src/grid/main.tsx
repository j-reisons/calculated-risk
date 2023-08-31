import { GridForm, GridFormState, GridSize } from "./gridform";
import { GridPlot } from "./gridplot";
import "./main.css";

export interface GridProps {
    gridFormState: GridFormState;
    setGridFormState: React.Dispatch<React.SetStateAction<GridFormState>>;
    
    gridSize: GridSize;
    setGridSize: React.Dispatch<React.SetStateAction<GridSize>>;
}

export const Grid = ({ gridFormState, setGridFormState, gridSize, setGridSize }: GridProps) => {


    return (
        <div className="grid">
            <GridForm gridFormState={gridFormState} setGridFormState={setGridFormState} setGridSize={setGridSize} />
            <GridPlot gridSize={gridSize} />
        </div>)
}