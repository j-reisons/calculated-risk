import { useState } from 'react';

import { GridFormState, GridSize } from './grid/gridform';
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
  const [gridSize, setGridSize] = useState<GridSize>(
    {
      wealthMin: 0,
      wealthMax: 400000,
      wealthStep: 10000,
      periods: 10,
    });

  return (
    <>
      <Grid gridFormState={gridFormState} setGridFormState={setGridFormState} gridSize={gridSize} setGridSize={setGridSize} />
      <MainForm gridSize={gridSize} />
    </>
  )
}

export default App