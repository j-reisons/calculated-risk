import { AssignmentNode, BlockNode, ConstantNode, FunctionNode, erf, parse } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React, { useState } from "react";
import createPlotlyComponent from 'react-plotly.js/factory';
import { initStrategiesForm } from "../InitState";

const Plot = createPlotlyComponent(Plotly);

export interface Strategy {
    readonly name: string,
    readonly CDF: (r: number) => number;
}

export interface StrategiesState {
    readonly strategies: Strategy[];
}

export interface StrategiesFormProps {
    setStrategiesState: React.Dispatch<React.SetStateAction<StrategiesState>>;
}

export interface StrategiesFormState {
    // Contents of the textarea
    readonly strategiesString: string;
    // Set on blur, reset on focus
    readonly strategiesStringValid: boolean;
    readonly strategies: Strategy_[];
}

interface Strategy_ {
    readonly name: string;
    readonly mu: number;
    readonly sigma: number;
}

export const StrategiesForm = ({ setStrategiesState }: StrategiesFormProps) => {

    const [state, setState] = useState<StrategiesFormState>(initStrategiesForm);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({
            ...state,
            strategiesString: event.target.value,
        })
    }

    const onFocus = () => {
        setState({
            ...state,
            strategiesStringValid: true,
        })
    }

    const onBlur = () => {
        const arrayOrNull = parseStrategiesArray(state.strategiesString);
        if (arrayOrNull == null) {
            setState({
                ...state,
                strategiesStringValid: false,
            })
        } else {
            setState({
                ...state,
                strategiesStringValid: true,
                strategies: arrayOrNull,
            });
            setStrategiesState(
                {
                    strategies: arrayOrNull.map(mapStrategy)
                }
            );
        }
    }


    const traces = [];
    for (let i = 0; i < state.strategies.length; i++) {
        const strategy = state.strategies[i];
        const data: Plotly.Data = {
            x: plotX(strategy),
            y: plotY(strategy),
            type: 'scatter',
            name: strategy.name
        };
        traces.push(data)
    }
    const margin = 30;
    const layout: Partial<Plotly.Layout> = {
        margin: { t: margin, l: margin, r: margin, b: margin }
    }


    return (
        <div className="container">
            <div className="instructions">
                <div className="title">Strategies</div>
                Lorem ipsum dolor sit amet</div>
            <textarea className={"input-box"}
                style={!state.strategiesStringValid ? { borderColor: "red" } : {}}
                placeholder="Type some math here"
                onChange={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
                value={state.strategiesString}
            ></textarea>
            <Plot
                data={traces}
                layout={layout} />
        </div>
    )
}

function parseStrategiesArray(strategiesString: string): (Strategy_[] | null) {
    const assignments: AssignmentNode[] = [];
    let root;
    try {
        root = parse(strategiesString);
    }
    catch (error) {
        return null;
    }
    // Should be either a single AssignmentNode or a BlockNode of AssignmentNodes
    switch (root.type) {
        case 'AssignmentNode':
            assignments.push(root as AssignmentNode);
            break;
        case 'BlockNode':
            {
                const blocks = (root as BlockNode).blocks;
                for (let i = 0; i < blocks.length; i++) {
                    const node = blocks[i].node;
                    if (node.type !== 'AssignmentNode') {
                        return null;
                    }
                    assignments.push((node as AssignmentNode));
                }
                break;
            }
        default:
            return null;
    }

    const out: Strategy_[] = assignments.map(parseStrategyAssignment)
        .filter((item): item is Strategy_ => item !== null);
    return out.length === assignments.length ? out : null;
}

function parseStrategyAssignment(assignment: AssignmentNode): (Strategy_ | null) {
    if (assignment.object.type !== 'SymbolNode') return null;
    if (assignment.value.type !== 'FunctionNode') return null;
    const functionNode = (assignment.value as FunctionNode);
    if (functionNode.fn.name.toLowerCase() !== 'normal') return null;
    if (functionNode.args.length !== 2) return null;
    // TODO: Support percentages here. Requires parsing an OperatorNode rather than a ConstantNode.
    // TODO: Support comments
    // TODO: Support combinations of gaussians.
    if (functionNode.args[0].type !== 'ConstantNode') return null;
    if (functionNode.args[1].type !== 'ConstantNode') return null;

    const mu = (functionNode.args[0] as ConstantNode).value;
    const sigma = (functionNode.args[1] as ConstantNode).value;
    return {
        name: assignment.object.name,
        mu: mu,
        sigma: sigma,
    };
}

const PLOT_POINTS = (100 * 2) + 1;
const RANGE_SIGMAS = 5;

// TODO: Cash looks weird plotted on its own
function plotX(s: Strategy_): number[] {
    if (s.sigma === 0) {
        return [(1 - Number.EPSILON) * s.mu, s.mu, (1 + Number.EPSILON) * s.mu]
    }

    const out = new Array(PLOT_POINTS);
    const start = s.mu - s.sigma * RANGE_SIGMAS;
    const step = s.sigma * (2 * RANGE_SIGMAS) / (PLOT_POINTS - 1);
    for (let i = 0; i < PLOT_POINTS; i++) {
        out[i] = start + i * step;
    }
    return out;
}

function plotY(s: Strategy_): number[] {
    if (s.sigma === 0) {
        return [0, 1, 0];
    }
    const start = -RANGE_SIGMAS;
    const step = 2 * RANGE_SIGMAS / (PLOT_POINTS - 1);
    const out: number[] = new Array(PLOT_POINTS);

    for (let i = 0; i < PLOT_POINTS; i++) {
        const exponent = - ((start + i * step) ** 2) / 2;
        out[i] = Math.exp(exponent);
    }
    return out;
}

function mapStrategy(s: Strategy_): Strategy {
    return {
        name: s.name,
        CDF: normalCdf(s.mu, s.sigma)
    }
}

export function normalCdf(mu: number, sigma: number): (r: number) => number {
    return (r: number) => { return 0.5 * (1 + erf((r - mu) / (1.41421356237 * sigma))) }
}
