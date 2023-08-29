import React from 'react';

export interface GridFormState {
    readonly wealthMinString: string;
    readonly wealthMaxString: string;
    readonly wealthStepString: string;
    readonly periodsString: string;
}

export interface GridFormProps {
    state: GridFormState;
    setState: React.Dispatch<React.SetStateAction<GridFormState>>
}

export const GridForm: React.FC<GridFormProps> = ({ state, setState }) => {

    // TODO: less insane validation
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        switch (event.target.id) {
            case "wealth_min":
                setState({
                    ...state,
                    wealthMinString: event.target.value,
                })
                return;
            case "wealth_max":
                setState({
                    ...state,
                    wealthMaxString: event.target.value,
                })
                return;
            case "wealth_steps":
                setState({
                    ...state,
                    wealthStepString: event.target.value,
                })
                return;
            case "time_steps":
                setState({
                    ...state,
                    periodsString: event.target.value,
                })
                return;
        }
    }

    return (
        <div>
            <div>Wealth max <input type="text" inputMode="numeric" value={state.wealthMaxString} onChange={handleInput} id="wealth_max" name="wealth_max" pattern="^-?\d+$" /></div>
            <div>Wealth step <input type="text" inputMode="numeric" value={state.wealthStepString} onChange={handleInput} id="wealth_steps" name="wealth_steps" pattern="^-?\d+$" /></div>
            <div>Wealth min <input type="text" inputMode="numeric" value={state.wealthMinString} onChange={handleInput} id="wealth_min" name="wealth_min" pattern="^-?\d+$" /></div>    
            <div>Periods <input type="text" inputMode="numeric" value={state.periodsString} onChange={handleInput} id="time_steps" name="time_steps" pattern="^-?\d+$" /></div> 
        </div>
    )
}