import { useState } from 'react';

import { initCashflows, initGridState, initStrategies, initUtility } from './InitState';
import { Grid } from './grid/main';
import { GridState } from './grid/state';
import MainForm from "./input/main";
import { CashflowsState, StrategiesState, UtilityState } from './input/state';

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