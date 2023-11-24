import { Delta } from "../../state";
import { DeltaDist } from "./delta";
import { Distribution } from "./distribution";

export class Cauchy implements Distribution {
    CDF: (r: number) => number;
    location: number;
    scale: number;
    support: [number, number];
    PDF: (r: number) => number;
    pointsOfInterest: number[];
    deltas: Delta[];

    private constructor(location: number, scale: number) {
        this.location = location;
        this.scale = scale;
        this.support = [location - 636620 * scale, location + 636620 * scale]; // They weren't kidding about those fat tails
        this.PDF = cauchyPDF(location, scale);
        this.CDF = cauchyCDF(location, scale);
        this.pointsOfInterest = [location];
        this.deltas = []
    }

    static createArgs(args: number[]): Distribution | null {
        if (args.length != 2) return null;
        const [location, scale] = args;
        if (scale == 0) return new DeltaDist(location);
        return new Cauchy(location, scale);
    }

}

function cauchyPDF(location: number, scale: number): (r: number) => number {
    return (r: number) => {
        const scaledDelta = (r - location) / scale;
        const denom = 1 + scaledDelta ** 2;
        return 1 / (Math.PI * scale * denom);
    }
}

const ONE_OVER_PI = 1 / Math.PI;
function cauchyCDF(location: number, scale: number): (r: number) => number {
    return (r: number) => {
        const scaledDelta = (r - location) / scale;
        return 0.5 + ONE_OVER_PI * Math.atan(scaledDelta);
    }
}