import React from 'react';
import { GridSize } from './gridplot';

export interface GridFormState {
    readonly wealthMin: string;
    readonly wealthMax: string;
    readonly wealthStep: string;
    readonly periods: string;
    // Output
    readonly gridSize: GridSize;
}

export interface GridFormProps {
    state: GridFormState;
    setState: React.Dispatch<React.SetStateAction<GridFormState>>
}

export const GridForm = ({ state, setState }: GridFormProps) => {

    // TODO: less insane validation
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value: number | null = parseIfValid(event);
        setState({
            ...state,
            [event.target.id]: event.target.value,
            gridSize: !value ? state.gridSize : {
                ...state.gridSize,
                [event.target.id]: value
            }
        });
    }

    return (
        <div>
            <div>Wealth max <input type="text" inputMode="numeric" value={state.wealthMax} onChange={handleInput} id="wealthMax" name="wealthMax" pattern="^\d+$" /></div>
            <div>Wealth step <input type="text" inputMode="numeric" value={state.wealthStep} onChange={handleInput} id="wealthStep" name="wealthStep" pattern="^\d+$" /></div>
            <div>Wealth min <input type="text" inputMode="numeric" value={state.wealthMin} onChange={handleInput} id="wealthMin" name="wealthMin" pattern="^-?\d+$" /></div>
            <div>Periods <input type="text" inputMode="numeric" value={state.periods} onChange={handleInput} id="periods" name="periods" pattern="^\d+$" /></div>
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
