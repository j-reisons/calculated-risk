import { AssignmentNode, BlockNode, ConstantNode, FunctionNode, parse } from "mathjs";
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

    const mean = (functionNode.args[0] as ConstantNode).value;
    const vola = (functionNode.args[1] as ConstantNode).value;
    return new Normal(assignment.object.name, mean, vola);
}
