import React from 'react';

export interface GridState {
    readonly wealthMin: number;
    readonly wealthMax: number;
    readonly wealthStep: number;
    readonly periods: number;
}

export const Grid: React.FC<GridState> = (state) => {
    return (
        <svg className="plotting-area" width="100%" height="100%">
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24">Plot here</text>
        </svg>
        {/* <div id="plotting-area-grid" /> */ }
    )
}



