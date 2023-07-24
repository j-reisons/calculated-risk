import React, { useState } from 'react';

import InputForm from "./input/input";
import { InputData } from './input/types';

const App: React.FC = () => {

  const [inputData, setInputData] = useState<InputData>(
    {
      cashflowString: 'zeros(1,10)',
      cashflows: [0,0,0,0,0,0,0,0,0,0,0],
    });

  return (
    <>
      <InputForm inputData={inputData} setInputData={setInputData} />
    </>
  )
}

export default App