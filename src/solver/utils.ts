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

type TypedArray = | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
type TypedArrayConstructor<T extends TypedArray> = {
    new(arraybuffer: ArrayBuffer): T;
    BYTES_PER_ELEMENT: number;
};

export function initUniformBuffer<T extends TypedArray>(device: GPUDevice,
    values: number[],
    typedArrayConstructor: TypedArrayConstructor<T>): GPUBuffer {

    const buffer = device.createBuffer({
        mappedAtCreation: true,
        size: values.length * typedArrayConstructor.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.UNIFORM,
    });
    new typedArrayConstructor(buffer.getMappedRange()).set(values);
    buffer.unmap();
    return buffer;
}

export function initStorageBuffer<T extends TypedArray>(device: GPUDevice,
    ndArray: NdArray,
    typedArrayConstructor: { new(arraybuffer: ArrayBuffer): T }): GPUBuffer {
    const dataSize = (ndArray.data as T).byteLength;
    const buffer = device.createBuffer({
        mappedAtCreation: true,
        size: dataSize,
        usage: GPUBufferUsage.STORAGE
    });
    new typedArrayConstructor(buffer.getMappedRange()).set(ndArray.data as T);
    buffer.unmap();
    return buffer;
}

export function initOutputBuffer(device: GPUDevice, size: number, mapped: boolean = false) {
    const buffer = device.createBuffer({
        mappedAtCreation: mapped,
        size: size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const readBuffer = device.createBuffer({
        size: size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    return { buffer, readBuffer };
}
