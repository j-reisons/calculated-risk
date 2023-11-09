import { GRID_PARAM, TRAJECTORIES_PARAM, gridIfValid, trajectoriesInputStateIfValid } from "./grid/sideform";
import { GridFormState, GridState, TrajectoriesInputFormState, TrajectoriesInputState, logGrid } from "./grid/state";
import { CASHFLOWS_PARAM, parseCashflows } from "./input/cashflows";
import { CashflowsFormState, CashflowsState, StrategiesFormState, StrategiesState, step } from "./input/state";
import { compileStrategiesArray } from "./input/strategies/compiler";
import { Normal } from "./input/strategies/distributions/normal";
import { STRATEGIES_PARAM } from "./input/strategies/main";
import { UTILITY_PARAM, parseUtility } from "./input/utility";

const searchParams = new URLSearchParams(window.location.search);

const gridString = searchParams.get(GRID_PARAM);
const parsedGrid = gridString ? JSON.parse(gridString) : null;
const validGrid = parsedGrid ? gridIfValid(parsedGrid) : null;

export const initGridFormState: GridFormState = validGrid ? parsedGrid : {
    wealthMin: "1000",
    wealthMax: "400000",
    wealthStep: "1%",
    periods: "10",
}

export const initGridState: GridState = validGrid ? validGrid : logGrid(1000, 400000, 0.01, 10)

const trajectoriesString = searchParams.get(TRAJECTORIES_PARAM);
const parsedTrajectories = trajectoriesString ? JSON.parse(trajectoriesString) : null;
const validTrajectories = parsedTrajectories ? trajectoriesInputStateIfValid(parsedTrajectories, initGridFormState) : null;

export const initTrajectoriesInputFormState: TrajectoriesInputFormState = validTrajectories ? parsedTrajectories : {
    startingWealth: "70000",
    startingPeriod: "1",
    quantiles: "68%, 95%, 99%",
    pickOnClick: true,
};

export const initTrajectoriesInputState: TrajectoriesInputState = validTrajectories ? validTrajectories : {
    startingWealth: 70000,
    startingPeriod: 1,
    quantiles: [0.68, 0.95, 0.99],
    pickOnClick: true,
};

const cashflowsString = searchParams.get(CASHFLOWS_PARAM);
const parsedCashflows = cashflowsString ? parseCashflows(cashflowsString) : null;
const parsedCashflowsValid = parsedCashflows !== null && parsedCashflows.length !== 0;

export const initCashflowsForm: CashflowsFormState = {
    cashflowString: parsedCashflowsValid ? cashflowsString! : 'cashflows = 40000*concat(ones(5),zeros(5)) -40000*concat(zeros(5),ones(5))',
    cashflowStringValid: true
}

export const initCashflows: CashflowsState = {
    cashflows: parsedCashflows ? parsedCashflows : [40000, 40000, 40000, 40000, 40000, -40000, -40000, -40000, -40000, -40000],
}

const strategiesString = searchParams.get(STRATEGIES_PARAM);
const parsedStrategies = strategiesString ? compileStrategiesArray(strategiesString) : null;
const parsedStrategiesValid = parsedStrategies !== null && parsedStrategies.length > 0;

export const initStrategiesForm: StrategiesFormState = {
    strategiesString: parsedStrategiesValid ? strategiesString! :
        'cash = Normal(1%, 1%)\n' +
        'e_25 = Normal(2%, 5%)\n' +
        'e_50 = Normal(3%, 10%)\n' +
        'e_75 = Normal(4%, 15%)\n' +
        'e_100 = Normal(5%, 20%)',
    strategiesStringValid: true,
}

export const initStrategies: StrategiesState = {
    strategies: parsedStrategiesValid ? parsedStrategies! : [
        { name: 'cash', ...Normal.create(0.01, 0.01), colorIndex: 0 },
        { name: 'e_25', ...Normal.create(0.02, 0.05), colorIndex: 0.25 },
        { name: 'e_50', ...Normal.create(0.03, 0.1), colorIndex: 0.5 },
        { name: 'e_75', ...Normal.create(0.04, 0.15), colorIndex: 0.75 },
        { name: 'e_100', ...Normal.create(0.05, 0.2), colorIndex: 1.0 }
    ]
}

const utilityString = searchParams.get(UTILITY_PARAM);
const parsedUtility = utilityString ? parseUtility(utilityString) : null;
const parsedUtilityValid = parsedUtility !== null;

export const initUtilityForm = {
    utilityString: parsedUtilityValid ? utilityString! : "Utility(w) = step(w - 100000)",
    utilityStringParses: true,
    textAreaFocused: false
};

export const initUtility = {
    utilityFunction: parsedUtilityValid ? parsedUtility : (x: number) => { return step(x - 100000) },
};
