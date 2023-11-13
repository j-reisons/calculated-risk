declare module "ndarray-unpack" {
    import { NdArray } from "ndarray";
    function unpack(array: NdArray): number[] | number[][] | number[][][] | number[][][][];
    export = unpack;
}