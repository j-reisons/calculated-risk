import { Delta } from "../../state";
import { Distribution } from "./distribution";

export class DeltaDist implements Distribution {
    CDF: (r: number) => number;
    location: number;
    scale: number;
    support: [number, number];
    PDF: (r: number) => number;
    pointsOfInterest: number[];
    deltas: Delta[];

    constructor(location: number) {
        this.CDF = (r => r >= location ? 1 : 0)
        this.location = location;
        this.scale = 0;
        this.support = [location, location];
        this.PDF = ((_) => 0);
        this.pointsOfInterest = [location];
        this.deltas = [{ location, weight: 1 }]
    }


    static createArgs(args: number[]): Distribution | null {
        if (args.length != 1) return null;
        return new DeltaDist(args[0]);
    }

}