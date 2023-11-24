import { erf } from "mathjs";
import { Delta } from "../../state";
import { DeltaDist } from "./delta";
import { Distribution } from "./distribution";

export class Normal implements Distribution {

    PDF: (r: number) => number;
    CDF: (r: number) => number;
    location: number;
    scale: number;
    support: [number, number];
    pointsOfInterest: number[];
    deltas: Delta[]

    private constructor(mean: number, vola: number) {
        this.location = mean;
        this.scale = vola;
        this.support = [mean - 5 * vola, mean + 5 * vola];
        this.PDF = normalPDF(mean, vola);
        this.CDF = normalCDF(mean, vola);
        this.pointsOfInterest = [mean];
        this.deltas = []
    }

    static createArgs(args: number[]): Distribution | null {
        if (args.length != 2) return null;
        const [mean, vola] = args;
        if (vola == 0) return new DeltaDist(mean);
        return new Normal(mean, vola);
    }
}

export function normalCDF(mean: number, vola: number): (r: number) => number {
    return (r: number) => { return 0.5 * (1 + cachedErf((r - mean) / (SQRT_2 * vola))) }
}

export function normalPDF(mean: number, vola: number): (r: number) => number {
    return (r: number) => {
        const exponent = - (((r - mean) / vola) ** 2) / 2;
        return Math.exp(exponent) / (vola * SQRT_2_PI);
    }
}

const SQRT_2 = 1.4142135623730951;
const SQRT_2_PI = 2.5066282746310002;

const CACHE = Array<number>(20001);
const START = -5;
const END = 5;
const STEP = ((END - START) / (CACHE.length - 1));
for (let i = 0; i < CACHE.length; i++) {
    CACHE[i] = erf(START + STEP * i);
}

function cachedErf(x: number): number {
    if (x < START + STEP) return -1;
    if (x > END - STEP) return 1;
    const i = Math.floor((x - START) / STEP);
    const rest = x - START - (STEP * i);
    return (1 - rest) * CACHE[i] + (rest) * CACHE[i + 1];
}