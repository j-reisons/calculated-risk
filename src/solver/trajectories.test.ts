import ndarray from "ndarray";
import { TrajectoriesInputs } from "./main";
import { computeTrajectories } from "./trajectories";

test('Trajectories are computed correctly', async () => {
    //@ts-format-ignore-region
    const transition = [
        0.5, 0.25, 0   , 0   , 0,
        0.5, 0.5 , 0.25, 0   , 0,
        0  , 0.25, 0.5 , 0.25, 0,
        0  , 0   , 0.25, 0.5 , 0.5,
        0  , 0   , 0   , 0.25, 0.5
    ];
    const supportBandIndices = [
        0,2,
        0,3,
        1,4,
        2,5,
        3,5,
    ];
    //@ts-format-ignore-endregion
    const transitionNd = ndarray(new Float32Array([...transition, ...transition, ...transition]), [3, 5, 5]);
    const supportNd = ndarray(new Float32Array([...supportBandIndices, ...supportBandIndices, ...supportBandIndices]), [3, 5, 2]);

    const inputs: TrajectoriesInputs = {
        boundaries: [0, 1.5, 2.5, 3.5, 4.5, 5.5],
        values: [1, 2, 3, 4, 5],
        optimalTransitionTensor: { values: transitionNd, supportBandIndices: supportNd }
    }

    let result = computeTrajectories(inputs, 2, 2);
    let expected = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0.25, 0.5, 0.25, 0, 0],
    ]
    expect(result).toStrictEqual(expected);

    result = computeTrajectories(inputs, 1, 2);
    expected = [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0.25, 0.5, 0.25, 0, 0],
        [0.25, 0.4375, 0.25, 0.0625, 0],
    ]
    expect(result).toStrictEqual(expected);

    result = computeTrajectories(inputs, 0, 2);
    expected = [
        [0, 1, 0, 0, 0],
        [0.25, 0.5, 0.25, 0, 0],
        [0.25, 0.4375, 0.25, 0.0625, 0],
        [0.234375, 0.40625, 0.25, 0.09375, 0.015625],
    ];
    expect(result).toStrictEqual(expected);

});