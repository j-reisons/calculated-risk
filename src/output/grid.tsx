import Plotly from "plotly.js-cartesian-dist";
import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export interface GridState {
    readonly wealthMin: number;
    readonly wealthMax: number;
    readonly wealthStep: number;
    readonly periods: number;
}

export const Grid: React.FC = () => {
    // TODO: Customize heatmap to make a good picture of the grid
    const traces: Plotly.Data[] = [{
        z: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        type: 'heatmap',
        xgap: 1,
        ygap: 1,
        hoverinfo: "none",
        showscale: false,
        // x0: 0.5,
        // y0: 0.5
    }];
    const layout: Partial<Plotly.Layout> = {
        dragmode: false,
        hovermode: false,
    }
    const config: Partial<Plotly.Config> = {
        displayModeBar: false
    }


    return (
        <Plot
                data={traces}
                layout={layout}
                config={config} />
    )
}



