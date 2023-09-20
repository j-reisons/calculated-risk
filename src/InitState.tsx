import { range } from "mathjs";
import { GridFormState, GridState } from "./grid/state";
import { CashflowsFormState, CashflowsState, StrategiesFormState, StrategiesState, UtilityFormState, UtilityState, normalCdf, step } from "./input/state";


export const initGridFormState: GridFormState = {
    wealthMin: "0",
    wealthMax: "400000",
    wealthStep: "10000",
    periods: "10",
}

export const initGridState: GridState = {
    wealthBoundaries: range(0, 400000, 10000, true).valueOf() as number[],
    periods: 10,
};

export const initCashflowsForm: CashflowsFormState = {
    cashflowString: '40000 * concat(ones(5),zeros(5)) \n- 40000 * concat(zeros(5),ones(5))',
    cashflowStringValid: true
}

export const initCashflows: CashflowsState = {
    cashflows: [40000, 40000, 40000, 40000, 40000, -40000, -40000, -40000, -40000, -40000],
}

export const initStrategiesForm: StrategiesFormState = {
    strategiesString:
        'cash = Normal(0.01, 0)\n' +
        'e_25 = Normal(0.02, 0.05)\n' +
        'e_50 = Normal(0.03, 0.1)\n' +
        'e_75 = Normal(0.04, 0.15)\n' +
        'e_100 = Normal(0.05, 0.2)',
    strategiesStringValid: true,
    strategies: [
        { name: 'cash', mu: 0.01, sigma: 0 },
        { name: 'e_25', mu: 0.02, sigma: 0.05 },
        { name: 'e_50', mu: 0.03, sigma: 0.1 },
        { name: 'e_75', mu: 0.04, sigma: 0.15 },
        { name: 'e_100', mu: 0.05, sigma: 0.2 }
    ],
}

export const initStrategies: StrategiesState = {
    strategies: [
        { name: 'cash', CDF: normalCdf(0.01, 0), mean: 0.01, vola: 0 },
        { name: 'e_25', CDF: normalCdf(0.02, 0.05), mean: 0.02, vola: 0.05 },
        { name: 'e_50', CDF: normalCdf(0.03, 0.1), mean: 0.03, vola: 0.1 },
        { name: 'e_75', CDF: normalCdf(0.04, 0.15), mean: 0.04, vola: 0.15 },
        { name: 'e_100', CDF: normalCdf(0.05, 0.2), mean: 0.05, vola: 0.2 }
    ]
}

export const initUtilityForm: UtilityFormState = {
    utilityString: "f(x)= step(x - 100000)"
}

export const initUtility: UtilityState = {
    utilityFunction: (x: number) => { return step(x - 100000) }
}
