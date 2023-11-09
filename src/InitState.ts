import { GridFormState, GridState, TrajectoriesInputFormState, TrajectoriesInputState, logGrid } from "./grid/state";
import { CASHFLOWS_PARAM, parseCashflows } from "./input/cashflows";
import { CashflowsFormState, CashflowsState, StrategiesFormState, StrategiesState, step } from "./input/state";
import { Normal } from "./input/strategies/distributions/normal";
import { UTILITY_PARAM, parseUtility } from "./input/utility";

const searchParams = new URLSearchParams(window.location.search);

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

const cashflowsString = searchParams.get(CASHFLOWS_PARAM);
const parsedCashflows = cashflowsString ? parseCashflows(cashflowsString) : null;

export const initCashflowsForm: CashflowsFormState = {
    cashflowString: parsedCashflows ? cashflowsString! : 'cashflows = 40000*concat(ones(5),zeros(5)) -40000*concat(zeros(5),ones(5))',
    cashflowStringValid: true
}

export const initCashflows: CashflowsState = {
    cashflows: parsedCashflows ? parsedCashflows : [40000, 40000, 40000, 40000, 40000, -40000, -40000, -40000, -40000, -40000],
}

export const initStrategiesForm: StrategiesFormState = {
    strategiesString:
        'cash = Normal(1%, 1%)\n' +
        'e_25 = Normal(2%, 5%)\n' +
        'e_50 = Normal(3%, 10%)\n' +
        'e_75 = Normal(4%, 15%)\n' +
        'e_100 = Normal(5%, 20%)',
    strategiesStringValid: true,
}

export const initStrategies: StrategiesState = {
    strategies: [
        { name: 'cash', ...Normal.create(0.01, 0.01), colorIndex: 0 },
        { name: 'e_25', ...Normal.create(0.02, 0.05), colorIndex: 0.25 },
        { name: 'e_50', ...Normal.create(0.03, 0.1), colorIndex: 0.5 },
        { name: 'e_75', ...Normal.create(0.04, 0.15), colorIndex: 0.75 },
        { name: 'e_100', ...Normal.create(0.05, 0.2), colorIndex: 1.0 }
    ]
}

const utilityString = searchParams.get(UTILITY_PARAM);
const parsedUtility = utilityString ? parseUtility(utilityString) : null;

export const initUtilityForm = {
    utilityString: parsedUtility ? utilityString! : "Utility(w) = step(w - 100000)",
    utilityStringParses: true,
    textAreaFocused: false
};

export const initUtility = {
    utilityFunction: parsedUtility ? parsedUtility : (x: number) => { return step(x - 100000) },
};
