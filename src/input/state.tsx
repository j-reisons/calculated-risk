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
    // PDF rescaled to [0,1] for plotting.
    readonly sketchPDF: (r: number) => number;
    readonly CDF: (r: number) => number;
    // Mean / std when available
    readonly location: number;
    readonly scale: number;
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