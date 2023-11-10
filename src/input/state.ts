export interface CashflowsFormState {
    // Contents of the textarea
    readonly cashflowString: string;
    // Set on blur, reset on focus
    readonly cashflowStringValid: boolean;
}

export interface CashflowsState {
    readonly cashflows: number[];
}

export interface StrategiesState {
    readonly strategies: Strategy[];
}

export interface Strategy {
    readonly name: string,
    readonly location: number; // mean when defined
    readonly scale: number; // std when defined

    readonly CDF: (r: number) => number;
     // A range of input values which accounts for at least 99.9999% of the ditribution.
     // The CDF should be normalized to 0/1 at the extremities (< 1E-6 tails are cut off).
    readonly support: [number, number];

    // These fields used for plotting only
    readonly PDF: (r: number) => number;
    readonly pointsOfInterest: number[];
    readonly deltas: Delta[];
    readonly colorIndex: number;
}
export interface Delta {
    readonly location: number;
    readonly weight: number
}

export interface StrategiesFormState {
    // Contents of the textarea
    readonly strategiesString: string;
    // Set on blur, reset on focus
    readonly strategiesStringValid: boolean;
}

export interface UtilityFormState {
    readonly utilityString: string;
    readonly textAreaFocused: boolean;
    readonly utilityStringParses: boolean;
}

export interface UtilityState {
    readonly utilityFunction: (wealth: number) => number;
}

export function step(x: number): number {
    return x > 0 ? 1 : 0;
}