import { Distribution, WeightedDistribution } from "./compiler";

export class Compound implements Distribution {

    PDF: (r: number) => number;
    CDF: (r: number) => number;
    location: number;
    scale: number;

    constructor(components: WeightedDistribution[]) {
        this.PDF = compoundPdf(components);
        this.CDF = compoundCdf(components);
        this.location = compoundLocation(components);
        this.scale = compoundScale(components);
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
