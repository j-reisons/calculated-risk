import isEqual from 'lodash.isequal';
import React, { useState } from 'react';
import { initGridFormState } from '../InitState';
import { GRID_PARAM, GridFormState, GridState, TRAJECTORIES_PARAM, TrajectoriesInputFormState, TrajectoriesInputState, logGrid } from './state';

export interface SideFormProps {
    trajectoriesInputFormState: TrajectoriesInputFormState;
    pickOnClick: boolean;
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
    setTrajectoriesInputFormState: React.Dispatch<React.SetStateAction<TrajectoriesInputFormState>>;
    setTrajectoriesInputState: React.Dispatch<React.SetStateAction<TrajectoriesInputState>>;
    setPickOnClick: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SideForm = ({ trajectoriesInputFormState, pickOnClick, setGridState, setTrajectoriesInputFormState, setTrajectoriesInputState, setPickOnClick }: SideFormProps) => {

    const [gridFormState, setGridFormState] = useState<GridFormState>(initGridFormState);

    const syncGridFormState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGridFormState({ ...gridFormState, [event.target.id]: event.target.value });
    };

    const syncGridState = () => {
        const newState = gridIfValid(gridFormState)
        if (newState !== null) {
            const params = new URLSearchParams(window.location.search);
            params.set(GRID_PARAM, JSON.stringify(gridFormState));
            history.replaceState({}, "", '?' + params.toString())
            setGridState(s => { return isEqual(s, newState) ? s : newState });
        }
    }

    const syncTrajectoriesInputFormState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTrajectoriesInputFormState({ ...trajectoriesInputFormState, [event.target.id]: event.target.value });
    };

    const handlePickOnClick = (event: React.ChangeEvent<HTMLInputElement>) => { setPickOnClick(event.target.checked); };

    const syncTrajectoriesInputState = () => {
        const newState = trajectoriesInputStateIfValid(trajectoriesInputFormState, gridFormState);
        if (newState !== null) {
            const params = new URLSearchParams(window.location.search);
            params.set(TRAJECTORIES_PARAM, JSON.stringify(trajectoriesInputFormState));
            history.replaceState({}, "", '?' + params.toString())

            setTrajectoriesInputState(s => { return isEqual(s, newState) ? s : newState });
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

            <input type="checkbox" id="pickOnClick" name="pickOnClick" checked={pickOnClick}
                onChange={handlePickOnClick} />
            <label htmlFor="pickOnClick"> Pick-on-click</label>
        </div>
    )
}

export function gridIfValid(gridFormState: GridFormState): GridState | null {
    let wealthMin, wealthStep, wealthMax, periods: number;
    if (!gridFormState.wealthStep.trim().endsWith("%")) return null;

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

export function trajectoriesInputStateIfValid(trajectoriesInputFormState: TrajectoriesInputFormState, gridFormState: GridFormState): TrajectoriesInputState | null {
    const gridState = gridIfValid(gridFormState);
    if (gridState == null) return null;

    let startingWealth, startingPeriod: number | null;
    let quantiles: number[];

    try {
        startingWealth = parseInt(trajectoriesInputFormState.startingWealth);
        startingPeriod = parseInt(trajectoriesInputFormState.startingPeriod);
        quantiles = trajectoriesInputFormState.quantiles.split(',').map(s => s.replace('%', '')).map(s => parseFloat(s) / 100);
    }
    catch (e) {
        return null
    }

    if (startingWealth > gridState.wealthMax || startingWealth < gridState.wealthMin) return null;
    if (startingPeriod > gridState.periods || startingPeriod <= 0) return null;
    if (!quantiles.every(q => q >= 0 && q <= 1)) return null;

    startingWealth = isNaN(startingWealth) ? null : startingWealth;
    startingPeriod = isNaN(startingPeriod) ? null : startingPeriod;

    return { startingWealth, startingPeriod, quantiles }
}
