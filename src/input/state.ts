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
    readonly CDF: (r: number) => number;
    readonly location: number; // mean when defined
    readonly scale: number; // std when defined

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