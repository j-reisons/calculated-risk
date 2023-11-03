import { AssignmentNode, BlockNode, FunctionNode, MathNode, OperatorNode, parse } from "mathjs";
import { Delta, Strategy } from "../state";
import { Compound } from "./compound";
import { Normal } from "./normal";

export function compileStrategiesArray(strategiesString: string): (Strategy[] | null) {
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

    const out: Strategy[] = assignments.map(compileStrategy)
        .filter((item): item is Strategy => item !== null);
    return out.length === assignments.length ? out : null;
}

function compileStrategy(assignment: AssignmentNode): (Strategy | null) {
    if (assignment.object.type !== 'SymbolNode') return null;

    const name = assignment.object.name;

    const distribution = compileDistribution(assignment.value);
    if (distribution === null) return null;
    return { name, ...distribution };
}

function compileDistribution(node: MathNode): Distribution | null {
    if (node.type == 'FunctionNode') return compileSimpleDistribution((node as FunctionNode));
    if (node.type == 'OperatorNode') {
        const weightedDistributions = compileWeightedDistributions(node as OperatorNode);

        if (weightedDistributions === null) return null;

        const total = weightedDistributions.reduce((acc, c) => c.weight + acc, 0);
        if (Math.abs(total - 1) > 1E-6) return null;
        return new Compound(weightedDistributions);

    }
    return null;
}

export interface Distribution {
    readonly CDF: (r: number) => number;
    readonly location: number;
    readonly scale: number;

    readonly PDF: (r: number) => number;
    readonly pointsOfInterest: number[];
    readonly deltas: Delta[];
}

const factoryMap: { [key: string]: (args: number[]) => Distribution | null } =
    { 'normal': Normal.createArgs };

function compileSimpleDistribution(node: FunctionNode): Distribution | null {
    const functionName = node.fn.name.toLowerCase();

    const factory = factoryMap[functionName];
    if (factory === undefined) return null;

    const args = compileArgs(node.args)
    if (args === null) return null;

    return factory(args);
}


export interface WeightedDistribution {
    readonly weight: number;
    readonly distribution: Distribution;
}

function compileWeightedDistributions(node: OperatorNode): WeightedDistribution[] | null {
    if (node.op === "+") return compilePlus(node);
    if (node.op === "*") return compileTimes(node);
    return null;
}

function compileArgs(args: MathNode[]): number[] | null {
    const out = new Array<number>(args.length);
    for (let i = 0; i < args.length; i++) {
        try {
            out[i] = args[i].compile().evaluate();
        } catch (e) {
            return null;
        }
    }
    return out;
}

function compilePlus(plusNode: OperatorNode): WeightedDistribution[] | null {
    const left = compileWeightedDistributions(plusNode.args[0] as OperatorNode)
    const right = compileWeightedDistributions(plusNode.args[1] as OperatorNode)
    if (left !== null && right !== null) return [...left, ...right];
    return null;
}

function compileTimes(timesNode: OperatorNode): WeightedDistribution[] | null {
    const types = timesNode.args.map(a => a.type);

    const weightIndex = types.findIndex(s => s !== "FunctionNode");
    const functionIndex = types.findIndex(s => s === "FunctionNode");

    if (weightIndex === -1 || functionIndex === -1) return null;

    let weight;
    try {
        weight = timesNode.args[weightIndex].compile().evaluate();
    } catch (e) {
        return null;
    }

    const distribution = compileSimpleDistribution(timesNode.args[functionIndex] as FunctionNode)
    if (distribution === null) return null;

    return [{ weight, distribution }];
}

