import isEqual from 'lodash.isequal';
import React, { useState } from 'react';
import { initGridFormState } from '../InitState';
import { GRID_PARAM, GridFormState, GridState, QUANTILES_PARAM, START_PARAM, TrajectoriesStartFormState, TrajectoriesStartState, linLogGrid } from './state';

export interface SideFormProps {
    trajectoriesStartFormState: TrajectoriesStartFormState;
    quantilesString: string;
    pickOnClick: boolean;
    setGridState: React.Dispatch<React.SetStateAction<GridState>>;
    setTrajectoriesStartFormState: React.Dispatch<React.SetStateAction<TrajectoriesStartFormState>>;
    setQuantilesString: React.Dispatch<React.SetStateAction<string>>;
    setTrajectoriesStartState: React.Dispatch<React.SetStateAction<TrajectoriesStartState>>;
    setQuantiles: React.Dispatch<React.SetStateAction<number[]>>;
    setPickOnClick: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SideForm = ({ trajectoriesStartFormState, quantilesString, pickOnClick, setGridState, setTrajectoriesStartFormState, setQuantilesString, setTrajectoriesStartState, setQuantiles, setPickOnClick }: SideFormProps) => {

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

    const syncTrajectoriesStartFormState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTrajectoriesStartFormState({ ...trajectoriesStartFormState, [event.target.id]: event.target.value });
    };

    const syncTrajectoriesStartState = () => {
        const newState = trajectoriesStartStateIfValid(trajectoriesStartFormState, gridFormState);
        if (newState !== null) {
            const params = new URLSearchParams(window.location.search);
            params.set(START_PARAM, JSON.stringify(trajectoriesStartFormState));
            history.replaceState({}, "", '?' + params.toString())

            setTrajectoriesStartState(s => { return isEqual(s, newState) ? s : newState });
        }
    };

    const syncQuantilesString = (event: React.ChangeEvent<HTMLInputElement>) => { setQuantilesString(event.target.value) }
    const syncQuantiles = () => {
        const newState = quantilesIfValid(quantilesString);
        if (newState !== null) {
            const params = new URLSearchParams(window.location.search);
            params.set(QUANTILES_PARAM, quantilesString);
            history.replaceState({}, "", '?' + params.toString())
            setQuantiles(s => { return isEqual(s, newState) ? s : newState });
        }
    }

    const handlePickOnClick = (event: React.ChangeEvent<HTMLInputElement>) => { setPickOnClick(event.target.checked); };


    return (
        <div>
            <h4>Grid</h4>

            <div>Wealth max
                <br />
                <input type="text" inputMode="numeric" value={gridFormState.wealthMax}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="wealthMax" name="wealthMax"
                    pattern="^\d+$" /></div>

            <div>Wealth step - log
                <br />
                <input type="text" inputMode="numeric" value={gridFormState.logStep}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="logStep" name="logStep"
                    pattern="^\d+(\.\d+)?%$" /></div>

            <div>Wealth step - lin
                <br /> <input type="text" inputMode="numeric" value={gridFormState.linStep}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="linStep" name="linStep"
                    pattern="^\d+$" /></div>

            <div>Periods
                <br /> <input type="text" inputMode="numeric" value={gridFormState.periods}
                    onChange={syncGridFormState} onBlur={syncGridState}
                    id="periods" name="periods"
                    pattern="^\d+$" /></div>

            <h4>Trajectories</h4>

            <div>Starting wealth
                <br /> <input type="text" inputMode="numeric" value={trajectoriesStartFormState.startingWealth}
                    onChange={syncTrajectoriesStartFormState} onBlur={syncTrajectoriesStartState}
                    id="startingWealth" name="startingWealth"
                    pattern="^\d+$" /></div>

            <div>Starting period
                <br /> <input type="text" inputMode="numeric" value={trajectoriesStartFormState.startingPeriod}
                    onChange={syncTrajectoriesStartFormState} onBlur={syncTrajectoriesStartState}
                    id="startingPeriod" name="startingPeriod"
                    pattern="^\d+$" /></div>

            <div>Quantiles
                <br /><input type="text" inputMode="numeric" value={quantilesString}
                    onChange={syncQuantilesString} onBlur={syncQuantiles}
                    id="quantiles" name="quantiles"
                    pattern="^\s*(\d+(\.\d+)?%)(\s*,\s*(\d+(\.\d+)?%))*\s*$" /></div>

            <input type="checkbox" id="pickOnClick" name="pickOnClick" checked={pickOnClick}
                onChange={handlePickOnClick} />
            <label htmlFor="pickOnClick"> Pick-on-click</label>
        </div>
    )
}

export function gridIfValid(gridFormState: GridFormState): GridState | null {
    let linStep, wealthStep, wealthMax, periods: number;
    if (!gridFormState.logStep.trim().endsWith("%")) return null;

    try {
        linStep = parseInt(gridFormState.linStep);
        wealthStep = parseFloat(gridFormState.logStep.replace('%', '')) / 100;
        wealthMax = parseInt(gridFormState.wealthMax);
        periods = parseInt(gridFormState.periods);
    }
    catch (e) {
        return null;
    }

    if (linStep < 0) return null;
    if (linStep >= wealthMax) return null;
    if (wealthMax <= 0) return null;
    if (wealthStep <= 0) return null;
    if (periods <= 0) return null;

    return linLogGrid(linStep, wealthMax, wealthStep, periods);
}

export function trajectoriesStartStateIfValid(trajectoriesStartFormState: TrajectoriesStartFormState, gridFormState: GridFormState): TrajectoriesStartState | null {
    const gridState = gridIfValid(gridFormState);
    if (gridState == null) return null;

    let startingWealth, startingPeriod: number | null;

    try {
        startingWealth = parseInt(trajectoriesStartFormState.startingWealth);
        startingPeriod = parseInt(trajectoriesStartFormState.startingPeriod);
    }
    catch (e) {
        return null
    }

    if (startingWealth > gridState.wealthMax || startingWealth < gridState.linStep) return null;
    if (startingPeriod > gridState.periods || startingPeriod <= 0) return null;

    startingWealth = isNaN(startingWealth) ? null : startingWealth;
    startingPeriod = isNaN(startingPeriod) ? null : startingPeriod;

    return { startingWealth, startingPeriod }
}

export function quantilesIfValid(quantilesString: string): number[] | null {
    let quantiles: number[];
    try { quantiles = quantilesString.split(',').map(s => s.replace('%', '')).map(s => parseFloat(s) / 100); }
    catch (e) { return null; }

    if (!quantiles.every(q => q >= 0 && q <= 1)) return null;

    return quantiles;
}
