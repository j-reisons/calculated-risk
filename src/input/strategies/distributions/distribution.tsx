import { Delta } from "../../state";
import { DeltaDist } from "./delta";
import { Normal } from "./normal";

export interface Distribution {
    readonly CDF: (r: number) => number;
    readonly location: number;
    readonly scale: number;

    readonly PDF: (r: number) => number;
    readonly pointsOfInterest: number[];
    readonly deltas: Delta[];
}

export interface WeightedDistribution {
    readonly weight: number;
    readonly distribution: Distribution;
}

const factories: { [key: string]: (args: number[]) => Distribution | null } =
{
    'normal': Normal.createArgs,
    'delta': DeltaDist.createArgs
};

export function createDistribution(name: string, args: number[]): Distribution | null {
    const factory = factories[name];
    if (factory === undefined) return null;
    return factories[name](args);
}
