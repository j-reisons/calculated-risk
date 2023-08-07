import { AssignmentNode, BlockNode, ConstantNode, FunctionNode, parse } from "mathjs";
import React from "react";

export interface StrategiesFormState {
    // Contents of the textarea
    readonly strategiesString: string;
    // Set on blur, reset on focus
    readonly strategiesStringValid: boolean;
    // Updated on blur, if valid
    readonly strategies: Strategy[];
}

class Strategy {
    constructor(
        public readonly name: string,
        public readonly mu: number,
        public readonly sigma: number,
    ) { }
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

    // TODO: useEffect for plotting

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
            <svg className="plotting-area" width="100%" height="100%">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24">Plot here</text>
            </svg>
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

    return new Strategy(assignment.object.name,
        (functionNode.args[0] as ConstantNode).value,
        (functionNode.args[1] as ConstantNode).value);
}
