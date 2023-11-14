declare module "ndarray-unsqueeze" {
    import { NdArray } from "ndarray";
    function unsqueeze(a: NdArray, axes?: number): NdArray;
    export = unsqueeze;
}