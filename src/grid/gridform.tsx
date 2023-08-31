import React from 'react';

export interface GridFormState {
    readonly wealthMin: string;
    readonly wealthMax: string;
    readonly wealthStep: string;
    readonly periods: string;
}

export interface GridSize {
    readonly wealthMin: number;
    readonly wealthMax: number;
    readonly wealthStep: number;
    readonly periods: number;
}

export interface GridFormProps {
    gridFormState: GridFormState;
    setGridFormState: React.Dispatch<React.SetStateAction<GridFormState>>;
    setGridSize: React.Dispatch<React.SetStateAction<GridSize>>;
}

export const GridForm = ({ gridFormState, setGridFormState, setGridSize }: GridFormProps) => {

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {

        const value: number | null = parseIfValid(event);
        setGridFormState(
            {
                ...gridFormState,
                [event.target.id]: event.target.value
            }
        )
        if (value !== null) {
            setGridSize(
                (gridSize: GridSize) => {
                    return {
                        ...gridSize,
                        [event.target.id]: value
                    }
                }
            )
        }
    };

    return (
        <div>
            <div>Wealth max <input type="text" inputMode="numeric" value={gridFormState.wealthMax} onChange={handleInput} id="wealthMax" name="wealthMax" pattern="^\d+$" /></div>
            <div>Wealth step <input type="text" inputMode="numeric" value={gridFormState.wealthStep} onChange={handleInput} id="wealthStep" name="wealthStep" pattern="^\d+$" /></div>
            <div>Wealth min <input type="text" inputMode="numeric" value={gridFormState.wealthMin} onChange={handleInput} id="wealthMin" name="wealthMin" pattern="^-?\d+$" /></div>
            <div>Periods <input type="text" inputMode="numeric" value={gridFormState.periods} onChange={handleInput} id="periods" name="periods" pattern="^\d+$" /></div>
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
