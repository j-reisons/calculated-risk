import { range } from "mathjs";

export interface GridFormState {
    readonly wealthMin: string;
    readonly wealthMax: string;
    readonly wealthStep: string;
    readonly periods: string;
}

export interface GridState {
    readonly wealthMin: number;
    readonly wealthMax: number;
    readonly wealthStep: number;
    readonly periods: number;

    readonly wealthBoundaries: number[];
    readonly wealthValues: number[];
}

export interface TrajectoriesInputFormState {
    readonly startingWealth: string;
    readonly startingPeriod: string;
    readonly quantiles: string;
    readonly pickOnClick: boolean;
}

export interface TrajectoriesInputState {
    readonly startingWealth: number | null,
    readonly startingPeriod: number | null,
    readonly quantiles: number[],
    readonly pickOnClick: boolean;
}

export interface TrajectoriesState {
    readonly startPeriod: number;
    readonly extendedBoundaries: number[]
    readonly extendedValues: number[]
    readonly extendedTrajectories: number[][];
}

export function logGrid(wealthMin: number, wealthMax: number, wealthStep: number, periods: number): GridState {
    const wealthBoundaries = (range(Math.log(wealthMin), Math.log(wealthMax), Math.log(1 + wealthStep), true).valueOf() as number[]).map(Math.exp);
    const wealthValues = [...wealthBoundaries.keys()].slice(0, -1).map(i => (wealthBoundaries[i] + wealthBoundaries[i + 1]) / 2);
    return { wealthMin, wealthMax, wealthStep, wealthBoundaries, wealthValues, periods }
}

export const RdBu: [number, string][] = [
    [0, 'rgb(5,10,172)'],
    [0.35, 'rgb(106,137,247)'],
    [0.5, 'rgb(190,190,190)'],
    [0.6, 'rgb(220,170,132)'],
    [0.7, 'rgb(230,145,90)'],
    [1, 'rgb(178,10,28)']
];

export function interpolateColor(index: number, colorscale: [number, string][]): string {
    index = Math.min(1, Math.max(0, index));
    const itop = Math.max(colorscale.findIndex(([stop]) => stop >= index), 1);
    const [bot, colorBot] = colorscale[itop - 1];
    const [top, colorTop] = colorscale[itop];
    const factor = (index - bot) / (top - bot);
    const topRGB = colorTop.match(/\d+/g)!.map(Number);
    const botRGB = colorBot.match(/\d+/g)!.map(Number);
    const result = botRGB.map((c1, i) => Math.round(c1 + (topRGB[i] - c1) * factor));
    return `rgb(${result[0]},${result[1]},${result[2]})`;
}

