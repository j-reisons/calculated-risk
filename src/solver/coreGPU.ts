import ndarray, { NdArray } from "ndarray";
import { CoreProblem, CoreSolution, TransitionTensor } from "./core";
import shaderSource from './coreGPU.wgsl?raw';

export async function solveCore({ transitionTensor, finalUtilities }: CoreProblem): Promise<CoreSolution> {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const periods = transitionTensor.uniquePeriodIndices.length;
    const wealthSize = finalUtilities.length;

    const nanBuffer = initNanBuffer(device);
    const periodBuffers = initPeriodBuffers(device, periods);
    const dimensionsBuffers = initDimensionsBuffers(device, transitionTensor);
    const transitionDataBuffers = initStorageBuffers(device, transitionTensor.values);
    const supportBandIndicesBuffers = initStorageBuffers(device, transitionTensor.supportBandIndices);
    const supportBandWidthsBuffers = initStorageBuffers(device, transitionTensor.supportBandWidths);

    const { buffer: expectedUtilitiesBuffer, readBuffer: expectedUtilitiesReadBuffer } = initExpectedUtilitiesBuffers(device, periods, wealthSize, finalUtilities);
    const { buffer: optimalStrategiesBuffer, readBuffer: optimalStrategiesReadBuffer } = initOptimalStrategiesBuffers(device, periods, wealthSize);

    const shaderModule = device.createShaderModule({ code: shaderSource })
    const computePipeline = device.createComputePipeline({
        layout: "auto",
        compute: {
            module: shaderModule,
            entryPoint: "main"
        }
    });

    const periodBindGroups: GPUBindGroup[] = new Array(periods);
    for (let p = 0; p < periods; p++) {
        const u = transitionTensor.uniquePeriodIndices[p];
        periodBindGroups[p] = device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: nanBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: periodBuffers[p]
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: dimensionsBuffers[u]
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: transitionDataBuffers[u]
                    }
                },
                {
                    binding: 4,
                    resource: {
                        buffer: supportBandIndicesBuffers[u]
                    }
                },
                {
                    binding: 5,
                    resource: {
                        buffer: supportBandWidthsBuffers[u]
                    }
                },
                {
                    binding: 6,
                    resource: {
                        buffer: expectedUtilitiesBuffer
                    }
                },
                {
                    binding: 7,
                    resource: {
                        buffer: optimalStrategiesBuffer
                    }
                }]
        })
    }

    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
    const workGroupCount = Math.ceil(wealthSize / 64);

    for (let p = periods - 1; p >= 0; p--) {
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, periodBindGroups[p]);
        passEncoder.dispatchWorkgroups(workGroupCount);
        passEncoder.end();
    }

    commandEncoder.copyBufferToBuffer(expectedUtilitiesBuffer, 0, expectedUtilitiesReadBuffer, 0, expectedUtilitiesBuffer.size);
    commandEncoder.copyBufferToBuffer(optimalStrategiesBuffer, 0, optimalStrategiesReadBuffer, 0, optimalStrategiesBuffer.size);

    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);

    await expectedUtilitiesReadBuffer.mapAsync(GPUMapMode.READ);
    const expectedUtilities = ndarray(new Float32Array(expectedUtilitiesReadBuffer.getMappedRange()), [periods + 1, wealthSize]);

    await optimalStrategiesReadBuffer.mapAsync(GPUMapMode.READ);
    const optimalStrategies = ndarray(new Float32Array(optimalStrategiesReadBuffer.getMappedRange()), [periods, wealthSize]);

    return { expectedUtilities, optimalStrategies };
}

function initNanBuffer(device: GPUDevice): GPUBuffer {
    const nanBuffer = device.createBuffer({
        mappedAtCreation: true,
        size: Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.UNIFORM,
    });
    new Float32Array(nanBuffer.getMappedRange()).set([NaN]);
    nanBuffer.unmap();
    return nanBuffer;
}

function initPeriodBuffers(device: GPUDevice, periods: number): GPUBuffer[] {
    const periodBuffers = new Array<GPUBuffer>(periods);
    for (let p = 0; p < periods; p++) {
        periodBuffers[p] = device.createBuffer({
            mappedAtCreation: true,
            size: Uint32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM,
        });
        new Uint32Array(periodBuffers[p].getMappedRange()).set([p]);
        periodBuffers[p].unmap();
    }
    return periodBuffers;
}

function initDimensionsBuffers(device: GPUDevice, transitionTensor: TransitionTensor): GPUBuffer[] {
    const buffers = new Array<GPUBuffer>(transitionTensor.values.length);
    for (let i = 0; i < transitionTensor.values.length; i++) {
        buffers[i] =
            device.createBuffer(
                {
                    mappedAtCreation: true,
                    size: Uint32Array.BYTES_PER_ELEMENT * 3,
                    usage: GPUBufferUsage.UNIFORM
                }
            )
        new Uint32Array(buffers[i].getMappedRange()).set(transitionTensor.values[i].shape);
        buffers[i].unmap();
    }
    return buffers;
}

function initStorageBuffers(device: GPUDevice, ndArrays: NdArray[]): GPUBuffer[] {
    const buffers = new Array<GPUBuffer>(ndArrays.length);
    for (let i = 0; i < ndArrays.length; i++) {
        const values = ndArrays[i];
        const dataSize = (values.data as Float32Array).byteLength;
        buffers[i] = device.createBuffer({
            mappedAtCreation: true,
            size: dataSize,
            usage: GPUBufferUsage.STORAGE
        });
        new Float32Array(buffers[i].getMappedRange()).set(values.data as Float32Array);
        buffers[i].unmap();
    }
    return buffers;
}

function initExpectedUtilitiesBuffers(device: GPUDevice, periods: number, wealthSize: number, finalUtilities: number[]): { buffer: GPUBuffer, readBuffer: GPUBuffer } {
    const expectedUtilitiesBufferSize = (periods + 1) * wealthSize * Float32Array.BYTES_PER_ELEMENT;

    const buffer = device.createBuffer({
        mappedAtCreation: true,
        size: expectedUtilitiesBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });
    new Float32Array(buffer
        .getMappedRange(periods * wealthSize * Float32Array.BYTES_PER_ELEMENT, wealthSize * Float32Array.BYTES_PER_ELEMENT))
        .set(finalUtilities)
    buffer.unmap();

    const readBuffer =
        device.createBuffer({
            size: expectedUtilitiesBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

    return { buffer, readBuffer };
}

function initOptimalStrategiesBuffers(device: GPUDevice, periods: number, wealthSize: number): { buffer: GPUBuffer, readBuffer: GPUBuffer } {
    const optimalStrategiesBufferSize = periods * wealthSize * Float32Array.BYTES_PER_ELEMENT;

    const buffer = device.createBuffer({
        size: optimalStrategiesBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const readBuffer =
        device.createBuffer({
            size: optimalStrategiesBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

    return { buffer, readBuffer };
}
