import { erf } from "mathjs";
import { Strategy } from "../state";

export class Normal implements Strategy {

    name: string;
    location: number;
    scale: number;
    sketchPDF: (r: number) => number;
    CDF: (r: number) => number;

    constructor(name: string, mean: number, vola: number) {
        this.name = name;
        this.location = mean;
        this.scale = vola;
        this.sketchPDF = normalSketch(mean, vola);
        this.CDF = normalCdf(mean, vola);
    }


    static create(name: string, args: number[]): Normal | null {
        if (args.length != 2) return null;
        return new Normal(name, args[0], args[1]);
    }

}

function normalCdf(mean: number, vola: number): (r: number) => number {
    return (r: number) => { return 0.5 * (1 + cachedErf((r - mean) / (1.41421356237 * vola))) }
}

function normalSketch(mean: number, vola: number): (r: number) => number {
    return (r: number) => {
        if (vola === 0) { return r === mean ? 1 : 0 }
        const exponent = - (((r - mean) / vola) ** 2) / 2;
        return Math.exp(exponent);
    }
}

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