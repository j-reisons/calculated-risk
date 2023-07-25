import React, { useState } from 'react';

import MainForm, { MainFormState } from "./input/main";

const App: React.FC = () => {
  
  const [state, setState] = useState<MainFormState>(
    {
      cashflowsFormState: {
        cashflowString: '20 * concat(ones(5),zeros(5)) \n- 10 * concat(zeros(5),ones(5))',
        cashflowStringValid: true,
        cashflows: [20, 20, 20, 20, 20, -10, -10, -10, -10, -10],

      },
      strategiesFormState: {},
      utilityFormState: {},
      wealthGridFormState: {},
    });

  return (
    <>
      <MainForm state={state} setState={setState} />
    </>
  )
}

export default App