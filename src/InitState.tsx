import { GridFormState, GridState, TrajectoriesInputFormState, TrajectoriesInputState, logGrid } from "./grid/state";
import { CashflowsFormState, CashflowsState, StrategiesFormState, StrategiesState, UtilityFormState, UtilityState, step } from "./input/state";
import { Normal } from "./input/strategies/normal";

export const initGridFormState: GridFormState = {
    wealthMin: "1000",
    wealthMax: "400000",
    wealthStep: "1%",
    periods: "10",
}

export const initGridState: GridState = logGrid(1000, 400000, 0.01, 10)

export const initTrajectoriesInputFormState: TrajectoriesInputFormState = {
    startingWealth: "70000",
    startingPeriod: "1",
    quantiles: "68%, 95%, 99%",
    pickOnClick: true,
};

export const initTrajectoriesInputState: TrajectoriesInputState = {
    startingWealth: 70000,
    startingPeriod: 1,
    quantiles: [0.68, 0.95, 0.99],
    pickOnClick: true,
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
        'cash = Normal(0.01, 0.01)\n' +
        'e_25 = Normal(0.02, 0.05)\n' +
        'e_50 = Normal(0.03, 0.1)\n' +
        'e_75 = Normal(0.04, 0.15)\n' +
        'e_100 = Normal(0.05, 0.2)',
    strategiesStringValid: true,
}

export const initStrategies: StrategiesState = {
    strategies: [
        new Normal('cash', 0.01, 0.01),
        new Normal('e_25', 0.02, 0.05),
        new Normal('e_50', 0.03, 0.1),
        new Normal('e_75', 0.04, 0.15),
        new Normal('e_100', 0.05, 0.2)
    ]
}

export const initUtilityForm: UtilityFormState = {
    utilityString: "f(x)= step(x - 100000)",
    utilityStringParses: true,
    textAreaFocused: false
}

export const initUtility: UtilityState = {
    utilityFunction: (x: number) => { return step(x - 100000) }
}
