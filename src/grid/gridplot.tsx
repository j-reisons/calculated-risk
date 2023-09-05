import { Matrix, range, zeros } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import createPlotlyComponent from 'react-plotly.js/factory';
import { CashflowsState } from "../input/cashflows";
import { StrategiesState } from "../input/strategies";
import { UtilityState } from "../input/utility";
import { Problem, Solution, solve } from "../solver/main";
import { GridState } from "./gridform";

const Plot = createPlotlyComponent(Plotly);

export interface GridPlotProps {
    readonly gridState: GridState;
    readonly strategiesState: StrategiesState,
    readonly cashflowsState: CashflowsState,
    readonly utilityState: UtilityState,
}

export interface Strategy {
    readonly name: string;
    readonly CDF: (r: number) => number;
}

export const GridPlot = ({ gridState, strategiesState, cashflowsState, utilityState }: GridPlotProps) => {

    const problem: Problem = {
        strategyCDFs: strategiesState.strategies.map(s => s.CDF),
        wealthBoundaries: gridState.wealthBoundaries,
        cashflows: cashflowsState.cashflows,
        utilityFunction: utilityState.utilityFunction,
    }
    const solution = solve(problem);


    // Offset everything by a half interval to get the heatmap cells to align with the axes;
    const timeRange: number[] = (range(0.5, gridState.periods + 0.5).valueOf() as number[]);
    const wealthBoundaries = gridState.wealthBoundaries;
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);

    const z: number[][] = solution.optimalStrategies;

    const traces: Plotly.Data[] = [{
        x: timeRange,
        y: wealthValues,
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



