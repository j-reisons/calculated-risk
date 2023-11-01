import { range, zeros } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import { useEffect, useState } from "react";
import createPlotlyComponent from 'react-plotly.js/factory';
import { CashflowsState, StrategiesState, UtilityState } from "../input/state";
import { Problem, Solution, solve } from "../solver/main";
import { QuantileTraces, computeTrajectories, findQuantiles } from "../solver/trajectories";
import { GridState, TrajectoriesInputFormState, TrajectoriesInputState, TrajectoriesState } from "./state";

const Plot = createPlotlyComponent(Plotly);

export interface GridPlotProps {
    readonly gridState: GridState;
    readonly strategiesState: StrategiesState,
    readonly cashflowsState: CashflowsState,
    readonly utilityState: UtilityState,
    readonly trajectoriesInputState: TrajectoriesInputState;
    readonly trajectoriesState: TrajectoriesState | null;
    readonly setTrajectoriesInputFormState: React.Dispatch<React.SetStateAction<TrajectoriesInputFormState>>;
    readonly setTrajectoriesInputState: React.Dispatch<React.SetStateAction<TrajectoriesInputState>>;
    readonly setTrajectoriesState: React.Dispatch<React.SetStateAction<TrajectoriesState | null>>;
}

export const GridPlot = ({ gridState, strategiesState, cashflowsState, utilityState, trajectoriesInputState, trajectoriesState, setTrajectoriesInputFormState, setTrajectoriesInputState, setTrajectoriesState }: GridPlotProps) => {

    const [solution, setSolution] = useState<Solution | null>(null);

    useEffect(() => {
        const problem: Problem = {
            strategies: strategiesState.strategies,
            wealthBoundaries: gridState.wealthBoundaries,
            wealthValues: gridState.wealthValues,
            wealthStep: gridState.wealthStep,
            periods: gridState.periods,
            cashflows: cashflowsState.cashflows,
            utilityFunction: utilityState.utilityFunction,
        }
        async function solveProblem() {
            const solution = await solve(problem);
            setSolution(solution);
            setTrajectoriesState(null);
        }
        solveProblem();
    }, [gridState, strategiesState, cashflowsState, utilityState, setTrajectoriesState])

    const clickHandler = (data: Plotly.PlotMouseEvent) => {
        const index = data.points[0].pointIndex as unknown as number[];
        const wealth = Math.floor(gridState.wealthValues[index[0]]);
        const period = index[1] + 1;

        setTrajectoriesInputFormState(
            state => {
                if (state.pickOnClick) {
                    return {
                        ...state,
                        startingWealth: wealth.toString(),
                        startingPeriod: period.toString(),
                    }
                } else {
                    return state;
                }
            });
        setTrajectoriesInputState(
            state => {
                if (state.pickOnClick) {
                    return {
                        ...state,
                        startingWealth: wealth,
                        startingPeriod: period,
                    }
                } else {
                    return state;
                }
            });
    }

    useEffect(() => {
        if (trajectoriesInputState.startingPeriod && trajectoriesInputState.startingWealth && solution) {
            setTrajectoriesState(
                {
                    startPeriod: trajectoriesInputState.startingPeriod - 1,
                    extendedValues: solution.extendedSolution!.extendedValues,
                    extendedBoundaries: solution.extendedSolution!.extendedBoundaries,
                    extendedTrajectories: computeTrajectories(solution.extendedSolution!, trajectoriesInputState.startingPeriod - 1, trajectoriesInputState.startingWealth),
                }
            )
        } else {
            setTrajectoriesState(null);
        }
    }, [solution, trajectoriesInputState, setTrajectoriesState])

    let heatmapData: Plotly.Data[] = [];
    let quantilesData: Plotly.Data[] = [];

    if (solution) {
        heatmapData = [
            {
                name: "",
                x0: 0.5,
                dx: range(0, gridState.periods).valueOf(),
                y: gridState.wealthValues,
                z: solution.optimalStrategies,
                customdata: customData(solution.expectedUtilities, solution.optimalStrategies, strategiesState.strategies.map(s => s.name)) as unknown as Plotly.Datum[][],
                hovertemplate: "Period: %{x:.0f}<br>Wealth: %{y:.4s}<br>Strategy: %{customdata[0]}<br>Utility: %{customdata[1]:.4g}",
                type: 'heatmap',
                showscale: false,
            } as Plotly.Data];

        if (trajectoriesState) {
            const quantiles = findQuantiles(trajectoriesState.extendedTrajectories, trajectoriesInputState.quantiles, trajectoriesState.startPeriod);
            quantilesData = quantiles.flatMap(quantile => toPlotlyData(quantile, solution.extendedSolution!.extendedBoundaries))
        }
    }

    const traces: Plotly.Data[] = [
        ...quantilesData,
        ...heatmapData];

    const layout: Partial<Plotly.Layout> = {
        width: 1100,
        height: 500,
        xaxis: {
            range: [0, gridState.periods]
        },
        yaxis: {
            range: [0, gridState.wealthMax]
        },
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

function customData(expectedUtilities: number[][], optimalStrategies: number[][], strategyNames: string[]) {
    if (expectedUtilities.length == 0) return [];
    strategyNames = ["Unknown", ...strategyNames]
    const customData = zeros(expectedUtilities.length, expectedUtilities[0].length).valueOf() as (number | string)[][][];
    for (let i = 0; i < expectedUtilities.length; i++) {
        for (let j = 0; j < expectedUtilities[0].length; j++) {
            customData[i][j] = new Array<number | string>(2);
            customData[i][j][0] = strategyNames[optimalStrategies[i][j] + 1];
            customData[i][j][1] = expectedUtilities[i][j];
        }
    }
    return customData;
}

