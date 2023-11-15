import ndarray from "ndarray";
import { CoreProblem, CoreSolution, TransitionTensor } from "./core";
import shaderSource from './coreGPU.wgsl?raw';

export async function solveCoreGPU({ transitionTensor, finalUtilities }: CoreProblem): Promise<CoreSolution> {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const periods = transitionTensor.values.length;
    const wealthSize = transitionTensor.values[0].shape[0];
    const strategiesSize = transitionTensor.values[0].shape[1];

    const nanBuffer = initNanBuffer(device);
    const periodBuffers = initPeriodBuffers(device, periods);
    const dimensionsBuffer = initDimensionsBuffer(device, [periods, wealthSize, strategiesSize, wealthSize]);
    const transitionTensorDataBuffers = initTransitionTensorDataBuffers(device, transitionTensor);
    const transitionTensorSupportBuffers = initTransitionTensorSupportBuffers(device, transitionTensor);
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
                        buffer: dimensionsBuffer
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: transitionTensorDataBuffers[p]
                    }
                },
                {
                    binding: 4,
                    resource: {
                        buffer: transitionTensorSupportBuffers[p]
                    }
                },
                {
                    binding: 5,
                    resource: {
                        buffer: expectedUtilitiesBuffer
                    }
                },
                {
                    binding: 6,
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
        size: 4,
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
            size: 4,
            usage: GPUBufferUsage.UNIFORM,
        });
        new Uint32Array(periodBuffers[p].getMappedRange()).set([p]);
        periodBuffers[p].unmap();
    }
    return periodBuffers;
}

function initDimensionsBuffer(device: GPUDevice, dimensions: [number, number, number, number]): GPUBuffer {
    const dimensionsBuffer =
        device.createBuffer(
            {
                mappedAtCreation: true,
                size: Uint32Array.BYTES_PER_ELEMENT * 4,
                usage: GPUBufferUsage.UNIFORM
            }
        );
    new Uint32Array(dimensionsBuffer.getMappedRange()).set(dimensions);
    dimensionsBuffer.unmap();
    return dimensionsBuffer;
}

function initTransitionTensorDataBuffers(device: GPUDevice, transitionTensor: TransitionTensor): GPUBuffer[] {
    const dataSize = (transitionTensor.values[0].data as Float32Array).byteLength;
    const uniqueToBuffer = new Map<number, GPUBuffer>();
    const uniqueIndices = transitionTensor.uniqueValueIndices;

    const periodBuffers = new Array<GPUBuffer>(uniqueIndices.length);
    for (let p = 0; p < uniqueIndices.length; p++) {
        const u = uniqueIndices[p];

        if (!uniqueToBuffer.has(u)) {
            const values = transitionTensor.values[p]
            const buffer = device.createBuffer({
                mappedAtCreation: true,
                size: dataSize,
                usage: GPUBufferUsage.STORAGE
            });
            new Float32Array(buffer.getMappedRange()).set(values.data as Float32Array);
            buffer.unmap();
            uniqueToBuffer.set(u, buffer);
        }

        periodBuffers[p] = uniqueToBuffer.get(u)!;
    }

    return periodBuffers;
}

function initTransitionTensorSupportBuffers(device: GPUDevice, transitionTensor: TransitionTensor): GPUBuffer[] {
    const dataSize = (transitionTensor.supportBandIndices[0].data as Float32Array).byteLength;
    const uniqueToBuffer = new Map<number, GPUBuffer>();
    const uniqueIndices = transitionTensor.uniqueValueIndices;

    const periodBuffers = new Array<GPUBuffer>(uniqueIndices.length);
    for (let p = 0; p < uniqueIndices.length; p++) {
        const u = uniqueIndices[p];

        if (!uniqueToBuffer.has(u)) {
            const values = transitionTensor.supportBandIndices[p]
            const buffer = device.createBuffer({
                mappedAtCreation: true,
                size: dataSize,
                usage: GPUBufferUsage.STORAGE
            });
            new Float32Array(buffer.getMappedRange()).set(values.data as Float32Array);
            buffer.unmap();
            uniqueToBuffer.set(u, buffer);
        }

        periodBuffers[p] = uniqueToBuffer.get(u)!;
    }

    return periodBuffers;
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
