import { AssignmentNode, BlockNode, ConstantNode, FunctionNode, parse } from "mathjs";
import Plotly from "plotly.js-cartesian-dist";
import React, { useEffect } from "react";

export interface StrategiesFormState {
    // Contents of the textarea
    readonly strategiesString: string;
    // Set on blur, reset on focus
    readonly strategiesStringValid: boolean;
    // Updated on blur, if valid
    readonly strategies: Strategy[];
}

interface Strategy {
    readonly name: string,
    readonly mu: number,
    readonly sigma: number,
}

export interface StrategiesFormProps {
    state: StrategiesFormState;
    setState: React.Dispatch<React.SetStateAction<StrategiesFormState>>
}

export const StrategiesForm: React.FC<StrategiesFormProps> = ({ state, setState }) => {

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
                strategies: arrayOrNull
            })
        }
    }

    useEffect(() => {
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

        Plotly.newPlot('plotting-area-strategies', traces, layout);

        return () => {
            Plotly.purge('plotting-area-strategies');
        };
    });


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
            <div id="plotting-area-strategies">
            </div>
        </div>
    )
}

function parseStrategiesArray(strategiesString: string): (Strategy[] | null) {
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

    const out: Strategy[] = assignments.map(parseStrategyAssignment)
        .filter((item): item is Strategy => item !== null);
    return out.length === assignments.length ? out : null;
}

function parseStrategyAssignment(assignment: AssignmentNode): (Strategy | null) {
    if (assignment.object.type !== 'SymbolNode') return null;
    if (assignment.value.type !== 'FunctionNode') return null;
    const functionNode = (assignment.value as FunctionNode);
    if (functionNode.fn.name.toLowerCase() !== 'normal') return null;
    if (functionNode.args.length !== 2) return null;
    if (functionNode.args[0].type !== 'ConstantNode') return null;
    if (functionNode.args[1].type !== 'ConstantNode') return null;

    return {
        name: assignment.object.name,
        mu: (functionNode.args[0] as ConstantNode).value,
        sigma: (functionNode.args[1] as ConstantNode).value
    };
}

const PLOT_POINTS = (100 * 2) + 1;
const RANGE_SIGMAS = 5;

function plotX(s: Strategy): number[] {
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

function plotY(s: Strategy): number[] {
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
