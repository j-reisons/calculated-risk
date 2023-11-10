import { Delta } from "../../state";
import { Distribution, WeightedDistribution } from "./distribution";

export class Compound implements Distribution {

    PDF: (r: number) => number;
    CDF: (r: number) => number;
    location: number;
    scale: number;
    support: [number, number];
    pointsOfInterest: number[];
    deltas: Delta[];

    constructor(components: WeightedDistribution[]) {
        this.PDF = compoundPdf(components);
        this.CDF = compoundCdf(components);
        this.location = compoundLocation(components);
        this.scale = compoundScale(components);
        this.support = compoundFiveNines(components);
        this.pointsOfInterest = compoundPointsOfInterest(components);
        this.deltas = compoundDeltas(components);
    }

}

function compoundLocation(components: WeightedDistribution[]): number {
    return components.reduce((acc, c) => c.weight * c.distribution.location + acc, 0);
}

function compoundScale(components: WeightedDistribution[]): number {
    // Pretend that scale means std and location means mean ¯\_(ツ)_/¯
    const secondMoment = components.reduce((acc, c) => c.weight * (c.distribution.scale ** 2 + c.distribution.location ** 2) + acc, 0);
    return Math.sqrt(secondMoment - compoundLocation(components) ** 2);
}

function compoundFiveNines(components: WeightedDistribution[]): [number, number] {
    return components.reduce((acc, c) => {
        return [Math.min(acc[0], c.distribution.support[0]), Math.max(acc[1], c.distribution.support[1])]
    }, [0, 0])
}

function compoundPdf(components: WeightedDistribution[]): (r: number) => number {
    return (r: number) => {
        return components.reduce((acc, c) => c.weight * c.distribution.PDF(r) + acc, 0);
    }
}

function compoundCdf(components: WeightedDistribution[]): (r: number) => number {
    return (r: number) => {
        return components.reduce((acc, c) => c.weight * c.distribution.CDF(r) + acc, 0);
    }
}

function compoundPointsOfInterest(components: WeightedDistribution[]): number[] {
    return components.reduce((acc, c) => acc.concat(c.distribution.pointsOfInterest), [] as number[])
}

function compoundDeltas(components: WeightedDistribution[]): Delta[] {
    return components.reduce((acc, c) => {
        const weightedDeltas = c.distribution.deltas.map(d => { return { location: d.location, weight: d.weight * c.weight } });
        return acc.concat(weightedDeltas);
    }, [] as Delta[])
}
