import { defaultCashflows, defaultCashflowsForm, defaultGridForm, defaultGridState, defaultStrategies, defaultStrategiesForm, defaultTrajectoriesInputForm, defaultTrajectoriesInputState, defaultUtility, defaultUtilityFormState } from "./DefaultState";
import { gridIfValid, trajectoriesInputStateIfValid } from "./grid/sideform";
import { GRID_PARAM, GridFormState, GridState, TRAJECTORIES_PARAM, TrajectoriesInputFormState, TrajectoriesInputState } from "./grid/state";
import { CASHFLOWS_PARAM, CashflowsFormState, CashflowsState, STRATEGIES_PARAM, StrategiesFormState, StrategiesState, UTILITY_PARAM, parseCashflows, parseUtility } from "./input/state";
import { compileStrategiesArray } from "./input/strategies/compiler";

const searchParams = new URLSearchParams(window.location.search);

const gridString = searchParams.get(GRID_PARAM);
const parsedGrid = gridString ? JSON.parse(gridString) : null;
const validGrid = parsedGrid ? gridIfValid(parsedGrid) : null;
export const initGridFormState: GridFormState = validGrid ? parsedGrid : defaultGridForm;
export const initGridState: GridState = validGrid ? validGrid : defaultGridState;


const trajectoriesString = searchParams.get(TRAJECTORIES_PARAM);
const parsedTrajectories = trajectoriesString ? JSON.parse(trajectoriesString) : null;
const validTrajectories = parsedTrajectories ? trajectoriesInputStateIfValid(parsedTrajectories, initGridFormState) : null;
export const initTrajectoriesInputFormState: TrajectoriesInputFormState = validTrajectories ? parsedTrajectories : defaultTrajectoriesInputForm
export const initTrajectoriesInputState: TrajectoriesInputState = validTrajectories ? validTrajectories : defaultTrajectoriesInputState;
export const initPickOnClick: boolean = false;


const cashflowsString = searchParams.get(CASHFLOWS_PARAM);
const parsedCashflows = cashflowsString ? parseCashflows(cashflowsString) : null;
const parsedCashflowsValid = parsedCashflows !== null && parsedCashflows.length !== 0;
export const initCashflowsForm: CashflowsFormState = parsedCashflowsValid ? {
    cashflowString: cashflowsString!,
    cashflowStringValid: true
} : defaultCashflowsForm;
export const initCashflows: CashflowsState = parsedCashflows ? { cashflows: parsedCashflows } : defaultCashflows;


const strategiesString = searchParams.get(STRATEGIES_PARAM);
const parsedStrategies = strategiesString ? compileStrategiesArray(strategiesString) : null;
const parsedStrategiesValid = parsedStrategies !== null && parsedStrategies.length > 0;
export const initStrategiesForm: StrategiesFormState = parsedStrategiesValid ? {
    strategiesString: strategiesString!,
    strategiesStringValid: true,
} : defaultStrategiesForm;
export const initStrategies: StrategiesState = parsedStrategiesValid ? { strategies: parsedStrategies! } : defaultStrategies


const utilityString = searchParams.get(UTILITY_PARAM);
const parsedUtility = utilityString ? parseUtility(utilityString) : null;
const parsedUtilityValid = parsedUtility !== null;
export const initUtilityForm = parsedUtilityValid ? {
    utilityString: utilityString!,
    utilityStringParses: true,
    textAreaFocused: false
} : defaultUtilityFormState;
export const initUtility = parsedUtilityValid ? {
    utilityFunction: parsedUtility
} : defaultUtility;
