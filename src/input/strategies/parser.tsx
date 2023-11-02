import { AssignmentNode, BlockNode, ConstantNode, FunctionNode, MathNode, parse } from "mathjs";
import { Strategy } from "../state";
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
    const name = assignment.object.name;
    if (assignment.object.type !== 'SymbolNode') return null;
    if (assignment.value.type == 'FunctionNode') {
        const functionNode = (assignment.value as FunctionNode);
        const functionName = functionNode.fn.name.toLowerCase();

        const factory = factoryMap[functionName];
        if (factory === undefined) return null;

        const args = parseArgs(functionNode.args)
        if (args === null) return null;

        return factory(name, args);
    }
    else if (assignment.value.type == 'OperatorNode') {
        return null
    } // Do the compound thing
    else return null;
}

const factoryMap: { [key: string]: (name: string, args: number[]) => Strategy | null } =
    { 'normal': Normal.create };

function parseArgs(args: MathNode[]): number[] | null {
    const out = new Array<number>(args.length);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        // TODO: Support percentages here. Requires parsing an OperatorNode rather than a ConstantNode.
        if (arg.type !== 'ConstantNode') return null;
        out[i] = (arg as ConstantNode).value;
    }
    return out;
}

