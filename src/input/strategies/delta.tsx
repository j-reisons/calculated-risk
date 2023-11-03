import { Delta } from "../state";
import { Distribution } from "./compiler";

export class DeltaDist implements Distribution {
    CDF: (r: number) => number;
    location: number;
    scale: number;
    PDF: (r: number) => number;
    pointsOfInterest: number[];
    deltas: Delta[];

    constructor(location: number) {
        this.CDF = (r => r >= location ? 1 : 0)
        this.location = location;
        this.scale = 0;
        this.PDF = (r => 0);
        this.pointsOfInterest = [];
        this.deltas = [{ location, weight: 1 }]
    }

}