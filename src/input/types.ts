import React from 'react';

export interface InputData {
  readonly cashflowString: string;
  readonly cashflows: number[];
}

export interface InputDataProps {
  inputData: InputData;
  setInputData: React.Dispatch<React.SetStateAction<InputData>>;
}