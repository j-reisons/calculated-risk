import { Matrix, range, zeros } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export interface GridSize {
    readonly wealthMin: number;
    readonly wealthMax: number;
    readonly wealthStep: number;
    readonly periods: number;
}

export interface GridPlotProps {
    readonly gridSize: GridSize;
}

export const GridPlot = ({ gridSize }: GridPlotProps) => {
    const timeRange: number[] = (range(0.5, gridSize.periods + 0.5).toArray() as number[]);
    const wealthRange: number[] = (range(gridSize.wealthMin + gridSize.wealthStep / 2, gridSize.wealthMax + gridSize.wealthStep / 2, gridSize.wealthStep).toArray() as number[])
    const z: number[][] = ((zeros(wealthRange.length, gridSize.periods) as Matrix).toArray() as number[][]);

    const traces: Plotly.Data[] = [{
        x: timeRange,
        y: wealthRange,
        xgap: 0.5,
        ygap:0.5,
        z: z,
        type: 'heatmap',
        showscale: false,
    }];
    const layout: Partial<Plotly.Layout> = {
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



