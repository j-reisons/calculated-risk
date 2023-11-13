declare module "ndarray-matrix-vector-product" {
    import { NdArray } from "ndarray";
    function matrixVectorProduct(out: NdArray, a: NdArray, b: NdArray)
    export = matrixVectorProduct;
}