import { Matrix } from "mathjs";

// -1 strategy indices are output by max when multiple maxima are found.
// This function overwrites -1 areas with values found either above or below them.
// If values are present both above and below a -1 area they must match to be used for overwriting.
export function postProcessStrategies(optimalStrategies: Matrix): void {
    const strategiesArray = optimalStrategies.valueOf() as number[][];
    for (let i = 0; i < strategiesArray.length; i++) {
        const periodArray = strategiesArray[i];
        let j = 0;
        let strategyBelow = -1;
        let defaultStrategy = -1;
        let strategyAbove = -1;
        while (j < periodArray.length) {
            if (periodArray[j] == -1) {
                const start = j;
                while (j < periodArray.length && periodArray[j] == -1) j++;
                strategyAbove = j == periodArray.length ? -1 : periodArray[j];

                if (strategyBelow == -1) {
                    defaultStrategy = strategyAbove;
                } else if (strategyAbove == -1) {
                    defaultStrategy = strategyBelow
                } else if (strategyBelow == strategyAbove) {
                    defaultStrategy = strategyBelow
                } else {
                    defaultStrategy = -1;
                }

                for (let index = start; index < j; index++) {
                    periodArray[index] = defaultStrategy;
                }
                strategyBelow = strategyAbove;
            } else {
                strategyBelow = periodArray[j];
                j++;
            }
        }
    }
}