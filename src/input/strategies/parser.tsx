import { AssignmentNode, BlockNode, ConstantNode, FunctionNode, MathNode, OperatorNode, parse } from "mathjs";
import { Strategy } from "../state";
import { Compound } from "./compound";
import { Normal } from "./normal";

export function parseStrategiesArray(strategiesString: string): (Strategy[] | null) {
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

export function parseStrategyAssignment(assignment: AssignmentNode): (Strategy | null) {
    if (assignment.object.type !== 'SymbolNode') return null;

    const name = assignment.object.name;

    const distribution = parseDistribution(assignment.value);
    if (distribution === null) return null;
    return { name, ...distribution };
}

function parseDistribution(node: MathNode): Distribution | null {
    if (node.type == 'FunctionNode') return parseFunctionNode((node as FunctionNode));
    if (node.type == 'OperatorNode') {
        const weightedDistributions = parseWeightedDistributions(node as OperatorNode);

        if (weightedDistributions === null) return null;

        const total = weightedDistributions.reduce((acc, c) => c.weight + acc, 0);
        if (Math.abs(total - 1) > 1E-6) return null;

        return new Compound(weightedDistributions);
    }
    return null;
}

export interface Distribution {
    readonly sketchPDF: (r: number) => number;
    readonly CDF: (r: number) => number;
    readonly location: number;
    readonly scale: number;
}

const factoryMap: { [key: string]: (args: number[]) => Distribution | null } =
    { 'normal': Normal.create };

function parseFunctionNode(node: FunctionNode): Distribution | null {
    const functionName = node.fn.name.toLowerCase();

    const factory = factoryMap[functionName];
    if (factory === undefined) return null;

    const args = parseArgs(node.args)
    if (args === null) return null;

    return factory(args);
}


export interface WeightedDistribution {
    readonly weight: number;
    readonly distribution: Distribution;
}

function parseWeightedDistributions(node: OperatorNode): WeightedDistribution[] | null {
    if (node.op === "+") return parsePlus(node);
    if (node.op === "*") return parseTimes(node);
    return null;
}

function parseArgs(args: MathNode[]): number[] | null {
    // Support percentages
    // Support negatives
    const out = new Array<number>(args.length);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.type !== 'ConstantNode') return null;
        out[i] = (arg as ConstantNode).value;
    }
    return out;
}

function parsePlus(plusNode: OperatorNode): WeightedDistribution[] | null {
    const left = parseWeightedDistributions(plusNode.args[0] as OperatorNode)
    const right = parseWeightedDistributions(plusNode.args[1] as OperatorNode)
    if (left !== null && right !== null) return [...left, ...right];
    return null;
}

function parseTimes(timesNode: OperatorNode): WeightedDistribution[] | null {
    const types = timesNode.args.map(a => a.type);
    // Support percentages here
    const constIndex = types.findIndex(s => s === "ConstantNode");
    const functionIndex = types.findIndex(s => s === "FunctionNode");
    if (constIndex === -1 || functionIndex === -1) return null;

    const weight = (timesNode.args[constIndex] as ConstantNode).value;
    const distribution = parseDistribution(timesNode.args[functionIndex] as FunctionNode)
    if (distribution === null) return null;

    return [{ weight, distribution }];
}

