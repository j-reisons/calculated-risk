import { range, zeros } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import { useEffect, useState } from "react";
import createPlotlyComponent from 'react-plotly.js/factory';
import { CashflowsState, StrategiesState, Strategy, UtilityState } from "../input/state";
import { Problem, Solution, solve } from "../solver/main";
import { CILocations, computeTrajectories, findCIs } from "../solver/trajectories";
import { GridState, TrajectoriesStartFormState, TrajectoriesStartState, TrajectoriesState } from "./state";

const Plot = createPlotlyComponent(Plotly);

export interface GridPlotProps {
    readonly gridState: GridState;
    readonly strategiesState: StrategiesState,
    readonly cashflowsState: CashflowsState,
    readonly utilityState: UtilityState,
    readonly trajectoriesStartState: TrajectoriesStartState;
    readonly CIs: number[];
    readonly pickOnClick: boolean;
    readonly trajectoriesState: TrajectoriesState | null;
    readonly setTrajectoriesStartFormState: React.Dispatch<React.SetStateAction<TrajectoriesStartFormState>>;
    readonly setTrajectoriesStartState: React.Dispatch<React.SetStateAction<TrajectoriesStartState>>;
    readonly setTrajectoriesState: React.Dispatch<React.SetStateAction<TrajectoriesState | null>>;
}

export const GridPlot = ({ gridState, strategiesState, cashflowsState, utilityState, trajectoriesStartState, CIs, pickOnClick, trajectoriesState, setTrajectoriesStartFormState, setTrajectoriesStartState, setTrajectoriesState }: GridPlotProps) => {

    const [solution, setSolution] = useState<Solution | null>(null);

    useEffect(() => {
        const problem: Problem = {
            strategies: strategiesState.strategies,
            wealthBoundaries: gridState.wealthBoundaries,
            wealthValues: gridState.wealthValues,
            logStep: gridState.logStep,
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

    useEffect(() => {
        if (trajectoriesStartState.startingPeriod && trajectoriesStartState.startingWealth && solution) {
            const wealthIndex = solution.trajectoriesInputs.values.findIndex((num) => num >= trajectoriesStartState.startingWealth!);
            setTrajectoriesState(
                {
                    startPeriod: trajectoriesStartState.startingPeriod - 1,
                    extendedValues: solution.trajectoriesInputs.values,
                    extendedBoundaries: solution.trajectoriesInputs.boundaries,
                    extendedTrajectories: computeTrajectories(solution.trajectoriesInputs.transitionTensor, solution.trajectoriesInputs.optimalStrategies, trajectoriesStartState.startingPeriod - 1, wealthIndex),
                }
            )
        } else {
            setTrajectoriesState(null);
        }
    }, [solution, trajectoriesStartState, setTrajectoriesState])

    const clickHandler = (data: Plotly.PlotMouseEvent) => {
        const index = data.points[0].pointIndex as unknown as number[];
        const wealth = Math.floor(gridState.wealthValues[index[0]]);
        const period = index[1] + 1;

        setTrajectoriesStartFormState(
            state => {
                return pickOnClick ? { startingWealth: wealth.toString(), startingPeriod: period.toString() } : state;
            });
        setTrajectoriesStartState(
            state => {
                return pickOnClick ? { startingWealth: wealth, startingPeriod: period } : state;
            });
    }

    let heatmapData: Plotly.Data[] = [];
    let CIData: Plotly.Data[] = [];

    if (solution) {
        heatmapData = [
            {
                name: "",
                x0: 0.5,
                dx: range(0, gridState.periods).valueOf(),
                y: gridState.wealthValues,
                z: solution.optimalStrategies,
                colorscale: computeColorScale(strategiesState.strategies, solution.optimalStrategies),
                customdata: customData(solution.expectedUtilities, solution.riskOfRuin, solution.optimalStrategies, strategiesState.strategies.map(s => s.name)) as unknown as Plotly.Datum[][],
                hovertemplate: "Period: %{x:.0f}<br>Wealth: %{y:.4s}<br>Strategy: %{customdata[0]}<br>Utility: %{customdata[1]:.4g}<br>Risk of ruin: %{customdata[2]:.2%}",
                type: 'heatmap',
                showscale: false,
            } as Plotly.Data];

        if (trajectoriesState) {
            const CILocations = findCIs(trajectoriesState.extendedTrajectories, CIs, trajectoriesState.startPeriod);
            CIData = CILocations.flatMap(CI => toPlotlyData(CI, solution.trajectoriesInputs.boundaries, CILocations.length))
        }
    }

    const traces: Plotly.Data[] = [
        ...CIData,
        ...heatmapData];

    const layout: Partial<Plotly.Layout> = {
        width: 1250,
        height: 500,
        xaxis: {
            range: [0, gridState.periods],
            tickvals: gridState.periods > 4 ? undefined : [...Array(gridState.periods).keys()]
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

function toPlotlyData(CILocations: CILocations, wealthBoundaries: number[], CICount: number): Plotly.Data[] {
    const alpha = 1 - Math.exp(Math.log(1 - TOTAL_ALPHA) / CICount)
    return [
        {
            x: CILocations.x,
            y: CILocations.y_bottom.map(y => wealthBoundaries[y]),
            line: { color: "transparent" },
            name: "p=" + CILocations.probability,
            showlegend: false,
            type: "scatter"
        },
        {
            x: CILocations.x,
            y: CILocations.y_top.map(y => wealthBoundaries[y]),
            fill: "tonexty",
            fillcolor: `rgba(100,100,100,${alpha})`,
            line: { color: "transparent" },
            name: "p=" + CILocations.probability,
            showlegend: false,
            type: "scatter"
        }
    ]
}

const TOTAL_ALPHA = 0.7

function customData(expectedUtilities: number[][], riskOfRuin: number[][], optimalStrategies: number[][], strategyNames: string[]) {
    if (expectedUtilities.length == 0) return [];
    const customData = zeros(expectedUtilities.length, expectedUtilities[0].length).valueOf() as [string, number, number][][];
    for (let i = 0; i < expectedUtilities.length; i++) {
        for (let j = 0; j < expectedUtilities[0].length; j++) {
            customData[i][j] = [
                strategyNames[optimalStrategies[i][j]] || "Unknown",
                expectedUtilities[i][j],
                riskOfRuin[i][j]];
        }
    }
    return customData;
}

// This keeps the heatmap colors constant on commenting / uncommenting of strategies without the need to update the indices.
function computeColorScale(strategies: Strategy[], optimalStrategies: number[][]): [number, string][] {

    // The range of the colorscale depends on the values present in the plot.
    const uniqueValues: Set<number> = new Set();
    for (const row of optimalStrategies) {
        for (const num of row) {
            uniqueValues.add(num);
        }
    }

    // strategies can get out of sync with optimalStrategies during an update, hence the filter.
    const sortedUniques = [...uniqueValues].filter(v => v < strategies.length).sort();

    const min = sortedUniques[0] || 0;
    const max = sortedUniques[sortedUniques.length - 1] || strategies.length - 1;

    if (min === max) {
        return [[0, strategies[min].color], [1, strategies[max].color]];
    }
    else {
        const sortedUniquesColorIndex = sortedUniques.map(i => (i - min) / (max - min));
        return sortedUniques.map((s, i) => [sortedUniquesColorIndex[i], strategies[s].color]);
    }

}
