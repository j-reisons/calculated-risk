import React from 'react';

export interface InputData {
  // Contents of the textarea
  readonly cashflowString: string;
  // Set on blur, reset on focus
  readonly cashflowStringValid: boolean;
  // Updated on blur, if valid
  readonly cashflows: number[];
}

export interface InputDataProps {
  inputData: InputData;
  setInputData: React.Dispatch<React.SetStateAction<InputData>>;
}