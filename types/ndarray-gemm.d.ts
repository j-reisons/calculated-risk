declare module "ndarray-gemm" {
    import { NdArray } from "ndarray";
    function matrixProduct(out: NdArray, a: NdArray, b: NdArray, alpha?: number, beta?: number)
    export = matrixProduct;
}