import { range } from 'mathjs';
import React, { useState } from 'react';
import { initGridFormState } from '../InitState';

export interface GridFormState {
    readonly wealthMin: string;
    readonly wealthMax: string;
    readonly wealthStep: string;
    readonly periods: string;
}

export interface GridState {
    readonly wealthBoundaries: number[];
    readonly periods: number;
}

export interface GridFormProps {
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
}

export const GridForm = ({ setGridState }: GridFormProps) => {

    const [gridFormState, setGridFormState] = useState<GridFormState>(initGridFormState);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGridFormState(
            {
                ...gridFormState,
                [event.target.id]: event.target.value
            }
        )
    };

    const onBlur = () => {
        const gridOrNull = gridIfValid(gridFormState)
        if (gridOrNull !== null) {
            setGridState(gridOrNull);
        }
    }

    return (
        <div>
            <div>Wealth max <input type="text" inputMode="numeric" value={gridFormState.wealthMax} onChange={handleInput} onBlur={onBlur} id="wealthMax" name="wealthMax" pattern="^\d+$" /></div>
            <div>Wealth step <input type="text" inputMode="numeric" value={gridFormState.wealthStep} onChange={handleInput} onBlur={onBlur} id="wealthStep" name="wealthStep" pattern="^\d+$" /></div>
            <div>Wealth min <input type="text" inputMode="numeric" value={gridFormState.wealthMin} onChange={handleInput} onBlur={onBlur} id="wealthMin" name="wealthMin" pattern="^-?\d+$" /></div>
            <div>Periods <input type="text" inputMode="numeric" value={gridFormState.periods} onChange={handleInput} onBlur={onBlur} id="periods" name="periods" pattern="^\d+$" /></div>
        </div>
    )
}

function gridIfValid(gridFormState: GridFormState): GridState | null {
    let wealthMin, wealthStep, wealthMax, periods: number;

    try {
        wealthMin = parseInt(gridFormState.wealthMin);
        wealthStep = parseInt(gridFormState.wealthStep);
        wealthMax = parseInt(gridFormState.wealthMax);
        periods = parseInt(gridFormState.periods);
    }
    catch (e) {
        return null;
    }

    if (wealthMin >= wealthMax) return null;
    if (wealthMax <= 0) return null;
    if (wealthStep <= 0) return null;
    if (periods <= 0) return null;

    return {
        wealthBoundaries: range(wealthMin, wealthMax, wealthStep, true).toArray() as number[],
        periods: periods,
    }

}
