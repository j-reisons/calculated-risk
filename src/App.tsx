import { useState } from 'react';

import { initCashflows, initGridState, initStrategies, initUtility } from './InitState';
import { GridState } from './grid/gridform';
import { Grid } from './grid/main';
import { CashflowsState } from './input/cashflows';
import MainForm from "./input/main";
import { StrategiesState } from './input/strategies';
import { UtilityState } from './input/utility';

const App = () => {

  const [gridState, setGridState] = useState<GridState>(initGridState);
  const [strategiesState, setStrategiesState] = useState<StrategiesState>(initStrategies);
  const [cashflowsState, setCashflowsState] = useState<CashflowsState>(initCashflows);
  const [utilityState, setUtilityState] = useState<UtilityState>(initUtility);

  return (
    <>
      <Grid
        gridState={gridState}
        strategiesState={strategiesState}
        cashflowsState={cashflowsState}
        utilityState={utilityState}
        setGridState={setGridState}
      />

      <MainForm gridState={gridState} setStrategiesState={setStrategiesState}
        cashflowsState={cashflowsState}
        setCashflowsState={setCashflowsState}
        utilityState={utilityState}
        setUtilityState={setUtilityState}
      />
    </>
  )
}

export default App