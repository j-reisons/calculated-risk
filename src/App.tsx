import React, { useState } from 'react';

import InputForm from "./input/input";
import { InputData } from './input/types';

const App: React.FC = () => {

  const [inputData, setInputData] = useState<InputData>(
    {
      cashflowString: '20 * concat(ones(5),zeros(5)) \n- 10 * concat(zeros(5),ones(5))',
      cashflowStringValid: true,
      cashflows: [20,20,20,20,20,-10,-10,-10,-10,-10],
    });

  return (
    <>
      <InputForm inputData={inputData} setInputData={setInputData} />
    </>
  )
}

export default App