import { linLogGrid } from "./grid/state";
import { Normal } from "./input/strategies/distributions/normal";

export const defaultGridForm = {
    linStep: "1000",
    wealthMax: "400000",
    logStep: "1%",
    periods: "10",
}
export const defaultGridState = linLogGrid(1000, 400000, 0.01, 10);


export const defaultTrajectoriesStartForm = {
    startingWealth: "70000",
    startingPeriod: "1",
};
export const defaultTrajectoriesStartState = {
    startingWealth: 70000,
    startingPeriod: 1,
};


export const defaultCIString = "68%, 95%, 99%";
export const defaultCIs = [0.68, 0.95, 0.99];


export const defaultCashflowsForm = {
    cashflowString: 'cashflows = 40000*concat(ones(5),zeros(5)) -40000*concat(zeros(5),ones(5))',
    cashflowStringValid: true
}
export const defaultCashflows = { cashflows: [40000, 40000, 40000, 40000, 40000, -40000, -40000, -40000, -40000, -40000] };


export const defaultStrategiesForm = {
    strategiesString: 'cash = Normal(1%, 1%)\n' +
        'e_25 = Normal(2%, 5%)\n' +
        'e_50 = Normal(3%, 10%)\n' +
        'e_75 = Normal(4%, 15%)\n' +
        'e_100 = Normal(5%, 20%)',
    strategiesStringValid: true,
}
export const defaultStrategies = {
    strategies: [
        { name: 'cash', ...Normal.createArgs([0.01, 0.01])!, color: 'rgb(5,10,172)' },
        { name: 'e_25', ...Normal.createArgs([0.02, 0.05])!, color: 'rgb(77,101,226)' },
        { name: 'e_50', ...Normal.createArgs([0.03, 0.1])!, color: 'rgb(190,190,190)' },
        { name: 'e_75', ...Normal.createArgs([0.04, 0.15])!, color: 'rgb(221,123,80)' },
        { name: 'e_100', ...Normal.createArgs([0.05, 0.2])!, color: 'rgb(178,10,28)' }
    ]
};

export const defaultUtilityFormState = {
    utilityString: "Utility(w) = w > 100000 ? 1 : 0",
    utilityStringParses: true,
    textAreaFocused: false
}
export const defaultUtility = {
    utilityFunction: (w: number) => { return w > 100000 ? 1 : 0 },
}