import React from 'react';

export interface InputData {
  readonly periods: number;

  readonly cashflowString: string;
  readonly cashflows: (number[] | null);

  readonly strategies: string[];
  readonly utility: string;
}

export interface InputDataProps {
  inputData: InputData;
  setInputData: React.Dispatch<React.SetStateAction<InputData>>;
}