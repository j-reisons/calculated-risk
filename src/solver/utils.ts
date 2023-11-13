import { zeros as mathjszeros, Matrix } from "mathjs";
import ndarray, { NdArray } from "ndarray";


export function zeros(size: [number]): number[];

export function zeros(size: [number, number]): number[][];

export function zeros(size: [number, number, number]): number[][][];

export function zeros(size: [number, number, number, number]): number[][][][];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zeros(size: number[]): any {
    return (mathjszeros(size, 'dense') as Matrix).valueOf();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zerosND(size: number[]): NdArray {
    return ndarray(new Float32Array(size.reduce((acc, s) => acc * s, 1)), size);
}