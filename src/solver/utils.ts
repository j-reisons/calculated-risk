import { zeros as mathjszeros, Matrix } from "mathjs";

export function zeros(size: [number]): number[];

export function zeros(size: [number, number]): number[][];

export function zeros(size: [number, number, number]): number[][][];

export function zeros(size: [number, number, number, number]): number[][][][];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zeros(size: number[]): any {
    return (mathjszeros(size, 'dense') as Matrix).valueOf();
}