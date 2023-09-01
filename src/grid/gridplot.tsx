import { Matrix, range, zeros } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import createPlotlyComponent from 'react-plotly.js/factory';
import { GridState } from "./gridform";

const Plot = createPlotlyComponent(Plotly);

export interface GridPlotProps {
    readonly gridState: GridState;
}

export const GridPlot = ({ gridState }: GridPlotProps) => {
    // Offset everything by a half interval to get the heatmap cells to align with the axes;
    const timeRange: number[] = (range(0.5, gridState.periods + 0.5).toArray() as number[]);
    const halfStep = (gridState.wealthBoundaries[1] - gridState.wealthBoundaries[0]) / 2
    const wealthRange: number[] = gridState.wealthBoundaries.map((i: number) => { return (i + halfStep) });

    const z: number[][] = ((zeros(wealthRange.length, timeRange.length) as Matrix).toArray() as number[][]);

    const traces: Plotly.Data[] = [{
        x: timeRange,
        y: wealthRange,
        xgap: 0.5,
        ygap: 0.5,
        z: z,
        type: 'heatmap',
        showscale: false,
    }];


    const layout: Partial<Plotly.Layout> = {
        width: 1100,
        height: 500,
        margin: { t: 0, l: 40, r: 0, b: 30 },
        // dragmode: false,
        // hovermode: false,
    }
    const config: Partial<Plotly.Config> = {
        // displayModeBar: false
    }


    return (
        <Plot
            data={traces}
            layout={layout}
            config={config}
        />
    )
}



