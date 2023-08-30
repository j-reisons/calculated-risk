import React from 'react';
import { GridState } from './main';

export interface GridFormState {
    readonly wealthMin: string;
    readonly wealthMax: string;
    readonly wealthStep: string;
    readonly periods: string;
}

export interface GridFormProps {
    state: GridState;
    setState: React.Dispatch<React.SetStateAction<GridState>>;
}

export const GridForm = ({ state, setState }: GridFormProps) => {

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {

        const value: number | null = parseIfValid(event);

        setState({
            ...state,
            formState: {
                ...state.formState,
                [event.target.id]: event.target.value
            },
            plotState: !value ? state.plotState : {
                gridSize: {
                    ...state.plotState.gridSize,
                    [event.target.id]: value
                }
            }

        });
    };

    return (
        <div>
            <div>Wealth max <input type="text" inputMode="numeric" value={state.formState.wealthMax} onChange={handleInput} id="wealthMax" name="wealthMax" pattern="^\d+$" /></div>
            <div>Wealth step <input type="text" inputMode="numeric" value={state.formState.wealthStep} onChange={handleInput} id="wealthStep" name="wealthStep" pattern="^\d+$" /></div>
            <div>Wealth min <input type="text" inputMode="numeric" value={state.formState.wealthMin} onChange={handleInput} id="wealthMin" name="wealthMin" pattern="^-?\d+$" /></div>
            <div>Periods <input type="text" inputMode="numeric" value={state.formState.periods} onChange={handleInput} id="periods" name="periods" pattern="^\d+$" /></div>
        </div>
    )
}

function parseIfValid(event: React.ChangeEvent<HTMLInputElement>): number | null {
    let value = null;
    try {
        value = parseInt(event.target.value);
    }
    catch (e) {
        return null;
    }

    switch (event.target.id) {
        case "wealthMin":
            break;
        default:
            if (value <= 0) return null;
    }
    return value;
}
