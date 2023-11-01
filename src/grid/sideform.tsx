import React, { useState } from 'react';
import { initGridFormState } from '../InitState';
import { GridFormState, GridState, TrajectoriesInputFormState, TrajectoriesInputState, logGrid } from './state';

export interface SideFormProps {
    trajectoriesInputFormState: TrajectoriesInputFormState;
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
    setTrajectoriesInputFormState: React.Dispatch<React.SetStateAction<TrajectoriesInputFormState>>;
    setTrajectoriesInputState: React.Dispatch<React.SetStateAction<TrajectoriesInputState>>;
}

export const SideForm = ({ trajectoriesInputFormState, setGridState, setTrajectoriesInputFormState, setTrajectoriesInputState }: SideFormProps) => {

    const [gridFormState, setGridFormState] = useState<GridFormState>(initGridFormState);

    const syncGridFormState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGridFormState(
            {
                ...gridFormState,
                [event.target.id]: event.target.value
            }
        )
    };

    const syncGridState = () => {
        const gridOrNull = gridIfValid(gridFormState)
        if (gridOrNull !== null) {
            setGridState(gridOrNull);
        }
    }

    const syncTrajectoriesInputFormState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTrajectoriesInputFormState(
            {
                ...trajectoriesInputFormState,
                [event.target.id]: event.target.value,
            }
        )
    };

    const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTrajectoriesInputFormState(
            {
                ...trajectoriesInputFormState,
                [event.target.id]: event.target.checked,
            }
        )
        setTrajectoriesInputState(state => { return { ...state, pickOnClick: event.target.checked } });
    };

    const syncTrajectoriesInputState = () => {
        const stateOrNull = trajectoriesInputStateIfValid(trajectoriesInputFormState, gridFormState)
        if (stateOrNull !== null) {
            setTrajectoriesInputState(stateOrNull);
        }
    };


    return (
        <div>
            <h4>Grid</h4>

            <div>Wealth max
                <br />
                <input type="text" inputMode="numeric" value={gridFormState.wealthMax}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="wealthMax" name="wealthMax"
                    pattern="^\d+$" /></div>

            <div>Wealth step
                <br />
                <input type="text" inputMode="numeric" value={gridFormState.wealthStep}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="wealthStep" name="wealthStep"
                    pattern="^\d+(\.\d+)?%$" /></div>

            <div>Wealth min
                <br /> <input type="text" inputMode="numeric" value={gridFormState.wealthMin}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="wealthMin" name="wealthMin"
                    pattern="^\d+$" /></div>

            <div>Periods
                <br /> <input type="text" inputMode="numeric" value={gridFormState.periods}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="periods" name="periods"
                    pattern="^\d+$" /></div>

            <h4>Trajectories</h4>

            <div>Starting wealth
                <br /> <input type="text" inputMode="numeric" value={trajectoriesInputFormState.startingWealth}
                    onChange={syncTrajectoriesInputFormState} onBlur={syncTrajectoriesInputState}
                    id="startingWealth" name="startingWealth"
                    pattern="^\d+$" /></div>

            <div>Starting period
                <br /> <input type="text" inputMode="numeric" value={trajectoriesInputFormState.startingPeriod}
                    onChange={syncTrajectoriesInputFormState} onBlur={syncTrajectoriesInputState}
                    id="startingPeriod" name="startingPeriod"
                    pattern="^\d+$" /></div>

            <div>Quantiles
                <br /><input type="text" inputMode="numeric" value={trajectoriesInputFormState.quantiles}
                    onChange={syncTrajectoriesInputFormState} onBlur={syncTrajectoriesInputState}
                    id="quantiles" name="quantiles"
                    pattern="^\s*(\d+(\.\d+)?%)(\s*,\s*(\d+(\.\d+)?%))*\s*$" /></div>

            <input type="checkbox" id="pickOnClick" name="pickOnClick" checked={trajectoriesInputFormState.pickOnClick}
                onChange={handleCheckbox} />
            <label htmlFor="pickOnClick"> Pick-on-click</label>
        </div>
    )
}

function gridIfValid(gridFormState: GridFormState): GridState | null {
    let wealthMin, wealthStep, wealthMax, periods: number;

    try {
        wealthMin = parseInt(gridFormState.wealthMin);
        wealthStep = parseFloat(gridFormState.wealthStep.replace('%', '')) / 100;
        wealthMax = parseInt(gridFormState.wealthMax);
        periods = parseInt(gridFormState.periods);
    }
    catch (e) {
        return null;
    }

    if (wealthMin < 0) return null;
    if (wealthMin >= wealthMax) return null;
    if (wealthMax <= 0) return null;
    if (wealthStep <= 0) return null;
    if (periods <= 0) return null;

    return logGrid(wealthMin, wealthMax, wealthStep, periods);
}

function trajectoriesInputStateIfValid(trajectoriesInputFormState: TrajectoriesInputFormState, gridFormState: GridFormState): TrajectoriesInputState | null {
    const gridState = gridIfValid(gridFormState);
    if (gridState == null) return null;

    let startingWealth, startingPeriod: number | null;
    let quantiles: number[];
    let pickOnClick: boolean;

    try {
        startingWealth = parseInt(trajectoriesInputFormState.startingWealth);
        startingPeriod = parseInt(trajectoriesInputFormState.startingPeriod);
        quantiles = trajectoriesInputFormState.quantiles.split(',').map(s => s.replace('%', '')).map(s => parseFloat(s) / 100);
        pickOnClick = trajectoriesInputFormState.pickOnClick;
    }
    catch (e) {
        return null
    }

    if (startingWealth > gridState.wealthMax || startingWealth < gridState.wealthMin) return null;
    if (startingPeriod > gridState.periods || startingPeriod <= 0) return null;
    if (!quantiles.every(q => q >= 0 && q <= 1)) return null;

    startingWealth = isNaN(startingWealth) ? null : startingWealth;
    startingPeriod = isNaN(startingPeriod) ? null : startingPeriod;

    return { startingWealth, startingPeriod, quantiles, pickOnClick }
}
