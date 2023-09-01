import { useState } from 'react';

import { range } from 'mathjs';
import { GridFormState, GridState } from './grid/gridform';
import { Grid } from './grid/main';
import MainForm from "./input/main";

const App = () => {

  const [gridFormState, setGridFormState] = useState<GridFormState>(
    {
      wealthMin: "0",
      wealthMax: "400000",
      wealthStep: "10000",
      periods: "10",
    });
  const [gridState, setGridState] = useState<GridState>(
    {
      wealthBoundaries: range(0, 400000, 10000).toArray() as number[],
      periods: 10,
    });

  return (
    <>
      <Grid gridFormState={gridFormState} setGridFormState={setGridFormState} gridState={gridState} setGridState={setGridState} />
      <MainForm gridState={gridState} />
    </>
  )
}

export default App