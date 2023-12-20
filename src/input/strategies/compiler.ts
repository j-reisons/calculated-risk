import { AssignmentNode, FunctionNode, MathNode, OperatorNode, parse } from "mathjs";
import { Strategy } from "../state";
import { Compound } from "./distributions/compound";
import { Distribution, WeightedDistribution, createDistribution } from "./distributions/distribution";

export function compileStrategiesArray(strategiesString: string): (Strategy[] | null) {
    const lines = strategiesString.split("\n").filter(s => s.trim() !== "");
    const strategies: Strategy[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let root;
        try {
            root = parse(line);
        }
        catch (error) {
            return null;
        }

        switch (root.type) {
            case 'AssignmentNode': {
                const strategyOrNull = compileStrategy((root as AssignmentNode), i / (lines.length - 1))
                if (strategyOrNull === null) return null;
                strategies.push(strategyOrNull);
                break;
            }
            case 'ConstantNode': continue // Comment lines are parsed as ConstantNodes
            default:
                return null;
        }
    }

    return strategies;
}

function compileStrategy(assignment: AssignmentNode, colorIndex: number): (Strategy | null) {
    if (assignment.object.type !== 'SymbolNode') return null;

    const name = assignment.object.name;

    const distribution = compileDistribution(assignment.value);
    if (distribution === null) return null;
    return { name, ...distribution, color: interpolateColor(colorIndex, RdBu) };
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

function compileSimpleDistribution(node: FunctionNode): Distribution | null {
    const name = node.fn.name.toLowerCase();
    const args = compileArgs(node.args)
    if (args === null) return null;
    return createDistribution(name, args);
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
    let weight;
    try {
        weight = timesNode.args[0].compile().evaluate();
    } catch (e) {
        return null;
    }

    const distribution = compileSimpleDistribution(timesNode.args[1] as FunctionNode)
    if (distribution === null) return null;

    return [{ weight, distribution }];
}


const RdBu: [number, string][] = [
    [0, 'rgb(5,10,172)'],
    [0.35, 'rgb(106,137,247)'],
    [0.5, 'rgb(190,190,190)'],
    [0.6, 'rgb(220,170,132)'],
    [0.7, 'rgb(230,145,90)'],
    [1, 'rgb(178,10,28)']
];

function interpolateColor(index: number, colorscale: [number, string][]): string {
    index = Math.min(1, Math.max(0, index));
    const itop = Math.max(colorscale.findIndex(([stop]) => stop >= index), 1);
    const [bot, colorBot] = colorscale[itop - 1];
    const [top, colorTop] = colorscale[itop];
    const factor = (index - bot) / (top - bot);
    const topRGB = colorTop.match(/\d+/g)!.map(Number);
    const botRGB = colorBot.match(/\d+/g)!.map(Number);
    const result = botRGB.map((c1, i) => Math.round(c1 + (topRGB[i] - c1) * factor));
    return `rgb(${result[0]},${result[1]},${result[2]})`;
}

