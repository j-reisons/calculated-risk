import React, { useState } from 'react';

import InputForm from "./input/input";
import { InputData } from './input/types';

const App: React.FC = () => {

  const [inputData, setInputData] = useState<InputData>(
    {
      periods: 0,
      cashflowString: '',
      cashflows: null,
      strategies: [],
      utility: '',
    });

  return (
    <>
      <InputForm inputData={inputData} setInputData={setInputData} />
    </>
  )
}

export default App