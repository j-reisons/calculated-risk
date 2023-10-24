import { range } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import { useEffect, useState } from "react";
import createPlotlyComponent from 'react-plotly.js/factory';
import { CashflowsState, StrategiesState, UtilityState } from "../input/state";
import { Problem, Solution, solve } from "../solver/main";
import { QuantileTraces, computeTrajectories, findQuantiles } from "../solver/trajectories";
import { GridState } from "./state";

const Plot = createPlotlyComponent(Plotly);

export interface GridPlotProps {
    readonly gridState: GridState;
    readonly strategiesState: StrategiesState,
    readonly cashflowsState: CashflowsState,
    readonly utilityState: UtilityState,
}

export const GridPlot = ({ gridState, strategiesState, cashflowsState, utilityState }: GridPlotProps) => {

    const [solution, setSolution] = useState<Solution>({ optimalStrategies: [], expectedUtilities: [], extendedSolution: null });
    const [quantiles, setQuantiles] = useState<QuantileTraces[]>([]);

    useEffect(() => {
        const problem: Problem = {
            strategies: strategiesState.strategies,
            wealthBoundaries: gridState.wealthBoundaries,
            periods: gridState.periods,
            cashflows: cashflowsState.cashflows,
            utilityFunction: utilityState.utilityFunction,
        }
        async function solveProblem() {
            const solution = await solve(problem);
            setSolution(solution);
        }
        solveProblem();
    }, [gridState, strategiesState, cashflowsState, utilityState])

    const clickHandler = (data: any) => {
        const index = data.points[0].pointIndex;
        const trajectories = computeTrajectories(solution.extendedSolution!, index[1], index[0]);
        const quantiles = findQuantiles(trajectories, [0.68, 0.95, 0.99], index[1]);
        setQuantiles(quantiles);
    }


    // Offset everything by a half interval to get the heatmap cells to align with the axes;
    const timeRange: number[] = (range(0.5, gridState.periods + 0.5).valueOf() as number[]);
    const wealthBoundaries = gridState.wealthBoundaries;
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);

    const traces: Plotly.Data[] = [{
        x: timeRange,
        y: wealthValues,
        z: solution.optimalStrategies,
        type: 'heatmap',
        showscale: false,
    }, ...quantiles.flatMap(quantile => toPlotlyData(quantile, solution.extendedSolution!.extendedBoundaries))];

    const layout: Partial<Plotly.Layout> = {
        width: 1100,
        height: 500,
        margin: { t: 0, l: 40, r: 0, b: 30 },
    }
    const config: Partial<Plotly.Config> = {
    }

    return (
        <Plot
            data={traces}
            layout={layout}
            config={config}
            onClick={clickHandler}
        />
    )
}

function toPlotlyData(quantileTraces: QuantileTraces, wealthBoundaries: number[]): Plotly.Data[] {
    return [
        {
            x: quantileTraces.x,
            y: quantileTraces.y_bottom.map(y => wealthBoundaries[y]),
            line: { color: "transparent" },
            name: "p=" + quantileTraces.probability,
            showlegend: false,
            type: "scatter"
        },
        {
            x: quantileTraces.x,
            y: quantileTraces.y_top.map(y => wealthBoundaries[y]),
            fill: "tonexty",
            fillcolor: "rgba(100,100,100,0.3)",
            line: { color: "transparent" },
            name: "p=" + quantileTraces.probability,
            showlegend: false,
            type: "scatter"
        }
    ]
}



