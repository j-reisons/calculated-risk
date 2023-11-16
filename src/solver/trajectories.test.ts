import ndarray from "ndarray";
import { OptimalTransitionTensor } from "./optimal-transition";
import { computeTrajectories } from "./trajectories";

test('Trajectories are computed correctly', async () => {
    //@ts-format-ignore-region
    // const transition = [
    //     0.5, 0.25, 0   , 0   , 0,
    //     0.5, 0.5 , 0.25, 0   , 0,
    //     0  , 0.25, 0.5 , 0.25, 0,
    //     0  , 0   , 0.25, 0.5 , 0.5,
    //     0  , 0   , 0   , 0.25, 0.5
    // ];
    const transitionFlat = [
        0.5,0.5,0.0,
        0.25,0.5,0.25,
        0.25,0.5,0.25,
        0.25,0.5,0.25,
        0.5,0.5,0.5
    ]
    const bandIndices = [0,0,1,2,3];
    const bandWidths = [2,3,3,3,2];

    //@ts-format-ignore-endregion
    const transitionNd = ndarray(new Float32Array([...transitionFlat]), [5, 3]);
    const bandIndicesNd = ndarray(new Float32Array(bandIndices));
    const bandWidthsNd = ndarray(new Float32Array(bandWidths));

    const transitionTensor: OptimalTransitionTensor = {
        values: [transitionNd, transitionNd, transitionNd],
        supportBandIndices: [bandIndicesNd, bandIndicesNd, bandIndicesNd],
        supportBandWidths: [bandWidthsNd, bandWidthsNd, bandWidthsNd]
    }

    let result = computeTrajectories(transitionTensor, 2, 1);
    let expected = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0.25, 0.5, 0.25, 0, 0],
    ]
    expect(result).toStrictEqual(expected);

    result = computeTrajectories(transitionTensor, 1, 1);
    expected = [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0.25, 0.5, 0.25, 0, 0],
        [0.25, 0.4375, 0.25, 0.0625, 0],
    ]
    expect(result).toStrictEqual(expected);

    result = computeTrajectories(transitionTensor, 0, 1);
    expected = [
        [0, 1, 0, 0, 0],
        [0.25, 0.5, 0.25, 0, 0],
        [0.25, 0.4375, 0.25, 0.0625, 0],
        [0.234375, 0.40625, 0.25, 0.09375, 0.015625],
    ];
    expect(result).toStrictEqual(expected);

});