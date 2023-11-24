import { Delta } from "../../state";
import { DeltaDist } from "./delta";
import { Distribution } from "./distribution";
import { normalCDF, normalPDF } from "./normal";

export class LogNormal implements Distribution {
    CDF: (r: number) => number;
    location: number;
    scale: number;
    support: [number, number];
    PDF: (r: number) => number;
    pointsOfInterest: number[];
    deltas: Delta[];

    private constructor(logMean: number, logVola: number) {
        this.location = Math.exp(logMean + (logVola ** 2) / 2) - 1;
        this.scale = Math.sqrt((Math.exp(logVola ** 2) - 1) * Math.exp(2 * logMean + logVola ** 2));
        this.support = [logNormalQuantile(logMean, logVola, 5E-7), logNormalQuantile(logMean, logVola, 1 - 5E-7)];
        this.PDF = logNormalPDF(logMean, logVola);
        this.CDF = logNormalCDF(logMean, logVola);
        this.pointsOfInterest = [this.location];
        this.deltas = []
    }

    static createArgs(args: number[]): Distribution | null {
        if (args.length != 2) return null;
        const [logMean, logVola] = args;
        if (logVola == 0) return new DeltaDist(logMean);
        return new LogNormal(logMean, logVola);
    }
}

function logNormalPDF(logMean: number, logVola: number): (r: number) => number {
    return (r: number) => {
        if (r <= -1) return 0;
        return (1 / (r + 1)) * normalPDF(logMean, logVola)(Math.log(r + 1));
    }
}

function logNormalCDF(logMean: number, logVola: number): (r: number) => number {
    return (r: number) => {
        if (r <= -1) return 0;
        return normalCDF(logMean, logVola)(Math.log(r + 1));
    }
}

function logNormalQuantile(logMean: number, logVola: number, quantile: number): number {
    return Math.exp(logMean + Math.sqrt(2) * logVola * erfinv(2 * quantile - 1)) - 1
}

function erfinv(x: number): number {
    const a = 0.147
    const b = 2 / (Math.PI * a) + Math.log(1 - x ** 2) / 2
    const sqrt1 = Math.sqrt(b ** 2 - Math.log(1 - x ** 2) / a)
    const sqrt2 = Math.sqrt(sqrt1 - b)
    return sqrt2 * Math.sign(x)
}