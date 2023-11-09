import { useState } from 'react';

import { initCashflows, initGridState, initStrategies, initUtility } from './InitState';
import { Grid } from './grid/main';
import { GridState, TrajectoriesState } from './grid/state';
import MainForm from "./input/main";
import { CashflowsState, StrategiesState, UtilityState } from './input/state';

const App = () => {

  const [gridState, setGridState] = useState<GridState>(initGridState);
  const [strategiesState, setStrategiesState] = useState<StrategiesState>(initStrategies);
  const [cashflowsState, setCashflowsState] = useState<CashflowsState>(initCashflows);
  const [utilityState, setUtilityState] = useState<UtilityState>(initUtility);
  const [trajectoriesState, setTrajectoriesState] = useState<TrajectoriesState | null>(null);

  return (
    <>
      <Grid
        gridState={gridState}
        setGridState={setGridState}
        strategiesState={strategiesState}
        cashflowsState={cashflowsState}
        utilityState={utilityState}
        trajectoriesState={trajectoriesState}
        setTrajectoriesState={setTrajectoriesState}
      />

      <MainForm gridState={gridState}
        strategiesState={strategiesState}
        setStrategiesState={setStrategiesState}
        cashflowsState={cashflowsState}
        setCashflowsState={setCashflowsState}
        trajectoriesState={trajectoriesState}
        utilityState={utilityState}
        setUtilityState={setUtilityState}
      />
    </>
  )
}

export default App