import { erf } from "mathjs";
import { Strategy } from "../state";

export class Normal implements Strategy {

    name: string;
    mean: number;
    vola: number;
    CDF: (r: number) => number;

    constructor(name: string, mean: number, vola: number) {
        this.name = name;
        this.mean = mean;
        this.vola = vola;
        this.CDF = normalCdf(mean, vola);
    }

    // TODO: 0-vola looks weird plotted on its own
    // TODO: Reflect chosen log-resolution in these plots
    static readonly PLOT_POINTS = (100 * 2) + 1;
    static readonly RANGE_SIGMAS = 5;
    plotX(): number[] {
        if (this.vola === 0) {
            return [(1 - Number.EPSILON) * this.mean, this.mean, (1 + Number.EPSILON) * this.mean]
        }

        const out = new Array(Normal.PLOT_POINTS);
        const start = this.mean - this.vola * Normal.RANGE_SIGMAS;
        const step = this.vola * (2 * Normal.RANGE_SIGMAS) / (Normal.PLOT_POINTS - 1);
        for (let i = 0; i < Normal.PLOT_POINTS; i++) {
            out[i] = start + i * step;
        }
        return out;
    }

    plotY(): number[] {
        if (this.vola === 0) {
            return [0, 1, 0];
        }
        const start = -Normal.RANGE_SIGMAS;
        const step = 2 * Normal.RANGE_SIGMAS / (Normal.PLOT_POINTS - 1);
        const out: number[] = new Array(Normal.PLOT_POINTS);

        for (let i = 0; i < Normal.PLOT_POINTS; i++) {
            const exponent = - ((start + i * step) ** 2) / 2;
            out[i] = Math.exp(exponent);
        }
        return out;
    }

}

function normalCdf(mu: number, sigma: number): (r: number) => number {
    return (r: number) => { return 0.5 * (1 + cachedErf((r - mu) / (1.41421356237 * sigma))) }
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