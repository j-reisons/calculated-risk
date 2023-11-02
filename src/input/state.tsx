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
    // Easier to pass along than compute from the CDF
    readonly mean: number;
    readonly vola: number;
    // For plotting within the component
    plotX(): number[];
    plotY(): number[];
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