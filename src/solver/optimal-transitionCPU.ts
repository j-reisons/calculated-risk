import { NdArray } from "ndarray";
import { TransitionTensor } from "./core";
import { OptimalTransitionTensor } from "./optimal-transition";
import { zerosND } from "./utils";

export function indexOptimalTransitionTensor(transitionTensor: TransitionTensor,
    optimalStrategies: NdArray): OptimalTransitionTensor {
    const periods = optimalStrategies.shape[0];
    const wealthIndexSize = optimalStrategies.shape[1];

    const optimalValues = new Array<NdArray>(periods);
    const optimalBandIndices = new Array<NdArray>(periods);
    const optimalBandWidths = new Array<NdArray>(periods);

    for (let p = 0; p < periods; p++) {
        const u = transitionTensor.uniquePeriodIndices[p];
        const periodBandIndices = transitionTensor.supportBandIndices[u];
        const periodBandWidths = transitionTensor.supportBandWidths[u];
        const periodValues = transitionTensor.values[u];

        const optimalPeriodBandIndices = zerosND([wealthIndexSize]);
        const optimalPeriodBandWidths = zerosND([wealthIndexSize]);
        const optimalPeriodValues = zerosND([wealthIndexSize, transitionTensor.values[u].shape[2]]);

        for (let i = 0; i < wealthIndexSize; i++) {
            let strategyIndex = optimalStrategies.get(p, i);
            strategyIndex = strategyIndex > 0 ? strategyIndex : 0;

            optimalPeriodBandIndices.set(i, periodBandIndices.get(i, strategyIndex));
            
            const bandWidth = periodBandWidths.get(i, strategyIndex);
            optimalPeriodBandWidths.set(i, bandWidth);
            for (let j = 0; j < bandWidth; j++) {
                optimalPeriodValues.set(i, j, periodValues.get(i, strategyIndex, j));
            }
        }

        optimalBandIndices[p] = optimalPeriodBandIndices;
        optimalBandWidths[p] = optimalPeriodBandWidths;
        optimalValues[p] = optimalPeriodValues;
    }

    return { values: optimalValues, supportBandIndices: optimalBandIndices, supportBandWidths: optimalBandWidths };
}