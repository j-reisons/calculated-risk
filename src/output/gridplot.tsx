import { range, zeros } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export interface GridPlotState {
    readonly wealthMin: number;
    readonly wealthMax: number;
    readonly wealthStep: number;
    readonly periods: number;
}

export const GridPlot: React.FC<GridPlotState> = ({state}) => {
    // TODO: Customize heatmap to make a good picture of the grid
    const timeRange: number[] = range(0.5,state.periods + 0.5).toArray();
    const wealthRange: number[] = range(state.wealthMin + state.wealthStep/2, state.wealthMax + state.wealthStep/2, state.wealthStep).toArray()
    const z: number[][] = zeros(wealthRange.length, state.periods).toArray();

    const traces: Plotly.Data[] = [{
        x: timeRange,
        y: wealthRange,
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



