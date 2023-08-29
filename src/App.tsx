import React, { useState } from 'react';

import { GridForm, GridFormState } from "./output/gridform";
import MainForm, { MainFormState } from "./input/main";

const App: React.FC = () => {

  const [state, setState] = useState<MainFormState>(
    {
      gridFormState: {
        wealthMinString: "0",
        wealthMin: 0,
        wealthMaxString: "4000000",
        wealthMax: 4_000_000,
        wealthStepsString: "100",
        wealthSteps: 100,
        timeStepsString: "10",
        timeSteps: 10
      },
      cashflowsFormState: {
        cashflowString: '40000 * concat(ones(5),zeros(5)) \n- 40000 * concat(zeros(5),ones(5))',
        cashflowStringValid: true,
        cashflows: [40000, 40000, 40000, 40000, 40000, -40000, -40000, -40000, -40000, -40000],

      },
      strategiesFormState: {
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
      },
      utilityFormState: {},
    });

  const [gridFormState, setGridFormState] = useState<GridFormState>(
    {
      wealthMinString: "0",
      wealthMin: 0,
      wealthMaxString: "4000000",
      wealthMax: 4_000_000,
      wealthStepsString: "100",
      wealthSteps: 100,
      timeStepsString: "10",
      timeSteps: 10
    }
  )

  return (
    <>
      <MainForm state={state} setState={setState} />
      <GridForm state={gridFormState} setState={setGridFormState}/>

    </>
  )
}

export default App