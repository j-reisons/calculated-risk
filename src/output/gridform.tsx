import Plotly from "plotly.js-cartesian-dist";
import React, { useEffect } from 'react';

export interface GridFormState {
    readonly wealthMinString: string;
    readonly wealthMaxString: string;
    readonly wealthStepString: string;
    readonly periodsString: string;
}

export interface GridFormProps {
    state: GridFormState;
    setState: React.Dispatch<React.SetStateAction<GridFormState>>
}

export const GridForm: React.FC<GridFormProps> = ({ state, setState }) => {

    // TODO: less insane validation
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = null;
        try {
            value = parseInt(event.target.value);
        } catch (e) {
            return;
        }
        switch (event.target.id) {
            case "wealth_min":
                setState({
                    ...state,
                    wealthMinString: event.target.value,
                    wealthMin: value === null ? state.wealthMin : value,
                })
                return;
            case "wealth_max":
                setState({
                    ...state,
                    wealthMaxString: event.target.value,
                    wealthMax: value === null ? state.wealthMax : value,
                })
                return;
            case "wealth_steps":
                setState({
                    ...state,
                    wealthStepsString: event.target.value,
                    wealthSteps: value === null ? state.wealthSteps : value,
                })
                return;
            case "time_steps":
                setState({
                    ...state,
                    timeStepsString: event.target.value,
                    timeSteps: value === null ? state.timeSteps : value,
                })
                return;
        }
    }

    // useEffect(() => {
    //     // TODO: Customize heatmap to make a good picture of the grid
    //     const data: Plotly.Data[] = [{
    //         z: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    //         type: 'heatmap',
    //         xgap: 1,
    //         ygap: 1,
    //         hoverinfo: "none",
    //         showscale: false,
    //         x0: 0.5,
    //         y0: 0.5
    //     }];

    //     const layout: Partial<Plotly.Layout> = {
    //         dragmode: false,
    //         hovermode: false,
    //     }
        
    //     const config: Partial<Plotly.Config> = {
    //         displayModeBar: false
    //     }

    //     Plotly.newPlot('plotting-area-grid', data, layout,config);

    //     return () => {
    //         Plotly.purge('plotting-area-grid');
    //     };
    // });

    return (
        <div>
            <div>Wealth max <input type="text" inputMode="numeric" value={state.wealthMaxString} onChange={handleInput} id="wealth_max" name="wealth_max" pattern="^-?\d+$" /></div>
            <div>Wealth step <input type="text" inputMode="numeric" value={state.wealthStepString} onChange={handleInput} id="wealth_steps" name="wealth_steps" pattern="^-?\d+$" /></div>
            <div>Wealth min <input type="text" inputMode="numeric" value={state.wealthMinString} onChange={handleInput} id="wealth_min" name="wealth_min" pattern="^-?\d+$" /></div>    
            <div>Periods <input type="text" inputMode="numeric" value={state.periodsString} onChange={handleInput} id="time_steps" name="time_steps" pattern="^-?\d+$" /></div> 
        </div>
    )
}